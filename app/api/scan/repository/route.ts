// app/api/scan/repository/route.ts
import { advancedAnalyzeFiles } from '@/lib/advanced-scanner'
import { getUserSubscription } from '@/lib/subscription'
import { NextRequest, NextResponse } from 'next/server'
import { canUserScan, decrementScanCount } from '@/lib/subscription'
import { analyzeFiles } from '@/lib/scanner'
import { sendScanCompleteEmail } from '@/lib/email'
import { shouldSendScanEmail } from '@/lib/email-check' // ✨ NEW: Import email check
import {
  createScan,
  updateScanStatus,
  saveVulnerabilitiesToDB,
  completeScan,
  failScan,
  setLastReport,
} from '@/lib/scan-store'
import { supabaseAdmin } from '@/lib/supabase'
import { updateUsageStats } from '@/lib/usage-stats'
import { logAudit } from '@/lib/audit-log'
import { isValidGitHubUrl, cloneAndScanRepo, cleanupRepo } from '@/lib/repo-scanner'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const startTime = Date.now()
  let scanId: string | null = null
  let repoPath: string | null = null

  try {
    const body = await req.json()
    const { repositoryUrl, projectName, userId, language } = body

    console.log('🔍 Repository scan request:', { repositoryUrl, projectName, language })

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to scan.' },
        { status: 401 }
      )
    }

    if (!repositoryUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      )
    }

    if (!isValidGitHubUrl(repositoryUrl)) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL. Please provide a valid GitHub repository URL.' },
        { status: 400 }
      )
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const scanCheck = await canUserScan(userId)
    if (!scanCheck.allowed) {
      return NextResponse.json(
        {
          error: scanCheck.reason || 'Scan limit reached',
          upgrade: true,
        },
        { status: 403 }
      )
    }

    const scan = await createScan({
      user_id: userId,
      scan_name: projectName || 'Repository Scan',
      repository_name: repositoryUrl,
    })

    if (!scan || !scan.id) {
      throw new Error('Failed to create scan record')
    }

    const confirmedScanId: string = scan.id
    scanId = confirmedScanId

    await updateScanStatus(confirmedScanId, 'scanning', 10)

    console.log('📦 Starting repository clone...')
    const { files, repoPath: clonedPath } = await cloneAndScanRepo(
      repositoryUrl,
      {
        projectName: projectName || 'Repository Scan',
        language: language || 'javascript',
      }
    )

    repoPath = clonedPath

    if (files.length === 0) {
      throw new Error('No supported files found in the repository')
    }

    console.log(`📄 Scanning ${files.length} files...`)
    await updateScanStatus(confirmedScanId, 'scanning', 50)

    const subscription = await getUserSubscription(userId)
    const isPro = subscription?.planType === 'pro' || subscription?.planType === 'enterprise'

    console.log(`📊 Scanning with ${isPro ? 'ADVANCED' : 'BASIC'} tier`)

    const report = isPro
      ? await advancedAnalyzeFiles(files, {
          projectName: projectName || 'Repository Scan',
          language: language || 'javascript',
          userId,
          scanId: confirmedScanId
        })
      : await analyzeFiles(files, {
          projectName: projectName || 'Repository Scan',
          language: language || 'javascript',
        })

    await saveVulnerabilitiesToDB(confirmedScanId, report.results || [])

    const durationSeconds = Math.round((Date.now() - startTime) / 1000)

    await completeScan(confirmedScanId, {
      total_files_scanned: files.length,
      scan_duration_seconds: durationSeconds,
    })

    // ✨ NEW: Check user preferences before sending email
    const shouldSendEmail = await shouldSendScanEmail(userId)
    
    if (shouldSendEmail) {
      try {
        await sendScanCompleteEmail({
          userEmail: profile.email,
          userName: profile.full_name || undefined,
          scanId: confirmedScanId,
          projectName: projectName || 'Repository Scan',
          summary: report.summary,
          filesScanned: files.length,
        })
        console.log('✅ Scan completion email sent')
      } catch (emailError) {
        console.error('⚠️ Failed to send email, but scan completed:', emailError)
        // Don't fail the scan if email fails
      }
    } else {
      console.log('📧 Email notifications disabled by user')
    }

    try {
      await updateUsageStats(userId, {
        scans: 1,
        filesScanned: files.length,
        vulnerabilitiesFound:
          report.summary.critical +
          report.summary.high +
          report.summary.medium +
          report.summary.low,
      })
    } catch (statsError) {
      console.error('Failed to update usage stats:', statsError)
    }

    try {
      await logAudit({
        userId: userId,
        action: 'scan_completed',
        resourceType: 'scan',
        resourceId: confirmedScanId,
        metadata: {
          projectName: projectName || 'Repository Scan',
          language: language || 'javascript',
          filesScanned: files.length,
          repositoryUrl,
          scanType: 'repository',
        },
      })
    } catch (auditError) {
      console.error('Failed to log audit:', auditError)
    }

    try {
      await decrementScanCount(userId)
    } catch (countError) {
      console.error('Failed to decrement scan count:', countError)
    }

    if (repoPath) {
      try {
        await cleanupRepo(repoPath)
      } catch (cleanupError) {
        console.error('Failed to cleanup repo:', cleanupError)
      }
    }

    const finalReport = {
      scanId: confirmedScanId,
      project: projectName || 'Repository Scan',
      summary: report.summary,
      results: report.results,
      filesScanned: files.length,
      durationSeconds,
      language: language || 'javascript',
      scanType: 'repository' as const,
      scannerTier: isPro ? 'advanced' : 'basic',
    }

    setLastReport(finalReport)

    return NextResponse.json(finalReport)
  } catch (err: any) {
    console.error('❌ Repository scan error:', err)

    if (scanId) {
      try {
        await failScan(scanId, String(err?.message || err))
      } catch (failError) {
        console.error('Failed to mark scan as failed:', failError)
      }
    }

    if (repoPath) {
      try {
        await cleanupRepo(repoPath)
      } catch (cleanupError) {
        console.error('Failed to cleanup repo on error:', cleanupError)
      }
    }

    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    )
  }
}