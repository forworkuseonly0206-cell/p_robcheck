// app/api/scan/repository/route.ts (COMPLETE FILE - replace the old one)
import { advancedAnalyzeFiles, analyzeFiles } from '@/lib/precise-scanner'
import { NextRequest, NextResponse } from 'next/server'
import { sendScanCompleteEmail } from '@/lib/email'
import { shouldSendScanEmail } from '@/lib/email-check'
import {
  createScan,
  updateScanStatus,
  saveVulnerabilitiesToDB,
  completeScan,
  failScan,
} from '@/lib/scan-store'
import { consumeScanSlot, refundScanSlot } from '@/lib/scan-limits'
import { requireUser, getClientIp, HttpError } from '@/lib/auth-server'
import { checkRateLimit } from '@/lib/rate-limit'
import { supabaseAdmin } from '@/lib/supabase'
import { updateUsageStats } from '@/lib/usage-stats'
import { logAudit } from '@/lib/audit-log'
import { isValidRepoUrl, cloneAndScanRepo, cleanupRepo } from '@/lib/repo-scanner'

export const runtime = 'nodejs'
export const maxDuration = 60

const GENERIC_SERVER_ERROR = 'The scan failed because of a server error. Please try again.'
const GENERIC_SCANNER_ERROR = 'The scanner could not complete this scan. Please try again.'

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let scanId = ''
  let repoPath: string | null = null
  let userId = ''
  let slotTaken = false
  let scanCompleted = false

  try {
    userId = await requireUser(req)

    const ip = getClientIp(req)
    const okUser = await checkRateLimit(`repo:user:${userId}`, 5, 3600)
    const okIp = await checkRateLimit(`repo:ip:${ip}`, 15, 3600)
    if (!okUser || !okIp) {
      throw new HttpError('Too many scan requests. Please wait a while and try again.', 429)
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      throw new HttpError('Invalid request', 400)
    }

    const repositoryUrl = String(body.repositoryUrl || '').trim()
    const projectName =
      String(body.projectName || 'Repository Scan')
        .replace(/[\u0000-\u001f<>]/g, '')
        .trim()
        .slice(0, 100) || 'Repository Scan'
    const language = String(body.language || 'javascript').slice(0, 100)

    if (!repositoryUrl) {
      throw new HttpError('Repository URL is required', 400)
    }
    if (!isValidRepoUrl(repositoryUrl)) {
      throw new HttpError(
        'Invalid repository URL. Use a public https link from GitHub, GitLab or Bitbucket.',
        400
      )
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) {
      throw new HttpError('User profile not found', 404)
    }

    const planType = (profile.plan_type || 'free').toLowerCase()
    const isPro = planType === 'pro' || planType === 'enterprise'

    const allowed = await consumeScanSlot(userId)
    if (!allowed) {
      return NextResponse.json(
        { error: "You've used your free scan. Upgrade to Pro for unlimited scans.", upgrade: true },
        { status: 403 }
      )
    }
    slotTaken = true

    const scan = await createScan({
      user_id: userId,
      scan_name: projectName,
      repository_name: repositoryUrl.slice(0, 200),
    })
    scanId = scan.id

    await updateScanStatus(scanId, 'scanning', 10)

    const cloned = await cloneAndScanRepo(repositoryUrl, { projectName, language })
    repoPath = cloned.repoPath
    const files = cloned.files

    if (files.length === 0) {
      throw new HttpError('No supported files were found in this repository.', 400)
    }

    await updateScanStatus(scanId, 'scanning', 50)

    const report = isPro
      ? await advancedAnalyzeFiles(files, { projectName, language, userId, scanId })
      : await analyzeFiles(files, { projectName, language })

    if (report.error) {
      console.error('❌ Scanner error:', report.error)
      await failScan(scanId, GENERIC_SCANNER_ERROR)
      await refundScanSlot(userId)
      slotTaken = false
      return NextResponse.json({ error: GENERIC_SCANNER_ERROR, scanId }, { status: 400 })
    }

    const allWarnings = report.warnings || []

    await saveVulnerabilitiesToDB(scanId, report.results || [])

    const durationSeconds = Math.round((Date.now() - startTime) / 1000)

    await completeScan(scanId, {
      total_files_scanned: files.length,
      scan_duration_seconds: durationSeconds,
    })
    scanCompleted = true

    try {
      if ((await shouldSendScanEmail(userId)) && profile.email) {
        await sendScanCompleteEmail({
          userEmail: profile.email,
          userName: profile.full_name || undefined,
          scanId,
          projectName,
          summary: report.summary,
          filesScanned: files.length,
          warnings: allWarnings,
          selectedLanguage: language,
        })
      }
    } catch (emailError) {
      console.error('⚠️ Failed to send email, but scan completed:', emailError)
    }

    try {
      await updateUsageStats(userId, {
        scans: 1,
        filesScanned: files.length,
        vulnerabilitiesFound:
          report.summary.critical + report.summary.high + report.summary.medium + report.summary.low,
      })
    } catch (statsError) {
      console.error('Failed to update usage stats:', statsError)
    }

    try {
      await logAudit({
        userId,
        action: 'scan_completed',
        resourceType: 'scan',
        resourceId: scanId,
        metadata: { projectName, language, filesScanned: files.length, repositoryUrl, scanType: 'repository' },
      })
    } catch (auditError) {
      console.error('Failed to log audit:', auditError)
    }

    return NextResponse.json({
      scanId,
      project: projectName,
      summary: report.summary,
      totalEstimatedBountyUsd: report.totalEstimatedBountyUsd || 0,
      results: report.results,
      filesScanned: files.length,
      durationSeconds,
      language,
      scanType: 'repository' as const,
      scannerTier: isPro ? 'advanced' : 'basic',
      warnings: allWarnings,
    })
  } catch (err: any) {
    const isHttp = err instanceof HttpError
    if (!isHttp) console.error('❌ Repository scan error:', err)

    if (slotTaken && !scanCompleted) {
      await refundScanSlot(userId)
    }
    if (scanId) {
      await failScan(scanId, isHttp ? err.message : GENERIC_SERVER_ERROR).catch(() => {})
    }

    return NextResponse.json(
      { error: isHttp ? err.message : (err?.message?.startsWith('Could not download') || err?.message?.startsWith('The repository took') ? err.message : GENERIC_SERVER_ERROR) },
      { status: isHttp ? err.status : 500 }
    )
  } finally {
    if (repoPath) await cleanupRepo(repoPath)
  }
}