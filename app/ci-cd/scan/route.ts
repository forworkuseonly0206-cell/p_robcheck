// app/api/ci-cd/scan/route.ts - TYPESCRIPT FIXED
import { NextResponse } from 'next/server'
import { analyzeFiles } from '@/lib/scanner'
import { advancedAnalyzeFiles } from '@/lib/advanced-scanner'
import { supabaseAdmin } from '@/lib/supabase'
import { createScan, updateScanStatus, saveVulnerabilitiesToDB, completeScan, failScan } from '@/lib/scan-store'
import { cloneAndScanRepo } from '@/lib/repo-scanner'
import { updateUsageStats } from '@/lib/usage-stats'
import { decrementScanCount, canUserScan } from '@/lib/subscription'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const startTime = Date.now()

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const apiKey = authHeader.substring(7)
    
    // ✅ FIXED: Proper type handling
    const { data: apiKeyData, error: apiKeyError } = await supabaseAdmin
      .from('api_keys')
      .select('user_id, profiles!inner(email, plan_type)')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single()

    if (apiKeyError || !apiKeyData) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const userId = apiKeyData.user_id
    const profile = apiKeyData.profiles as unknown as { email: string; plan_type: string }

    await supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key', apiKey)

    const scanCheck = await canUserScan(userId)
    if (!scanCheck.allowed) {
      return NextResponse.json(
        { error: scanCheck.reason || 'Scan limit reached', upgrade: true },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      repositoryUrl,
      language = 'all',
      projectName,
      failOnCritical = true,
      failOnHigh = false,
      failThreshold = null
    } = body

    if (!repositoryUrl) {
      return NextResponse.json({ error: 'Missing repositoryUrl' }, { status: 400 })
    }

    const finalProjectName = projectName || `CI/CD Scan`

    const scan = await createScan({
      user_id: userId,
      scan_name: finalProjectName,
      repository_name: repositoryUrl,
    })

    const scanId = scan.id
    await updateScanStatus(scanId, 'scanning', 0)

    let repoPath: string | null = null
    
    try {
      const { files, platform, repoPath: clonedPath } = await cloneAndScanRepo(
        repositoryUrl,
        { projectName: finalProjectName, language }
      )
      
      repoPath = clonedPath

      if (files.length === 0) {
        throw new Error('No files found')
      }

      const isPro = profile.plan_type === 'pro' || profile.plan_type === 'enterprise'
      
      const report = isPro
        ? await advancedAnalyzeFiles(files, { projectName: finalProjectName, language, userId, scanId })
        : await analyzeFiles(files, { projectName: finalProjectName, language })

      if (report.error) {
        await failScan(scanId, report.error)
        return NextResponse.json({ error: report.error, scanId, exitCode: 1 }, { status: 400 })
      }

      await saveVulnerabilitiesToDB(scanId, report.results || [])

      const durationSeconds = Math.round((Date.now() - startTime) / 1000)

      await completeScan(scanId, {
        total_files_scanned: files.length,
        scan_duration_seconds: durationSeconds,
      })

      await updateUsageStats(userId, {
        scans: 1,
        filesScanned: files.length,
        vulnerabilitiesFound: report.summary.critical + report.summary.high + report.summary.medium + report.summary.low,
      })

      await decrementScanCount(userId)

      let exitCode = 0
      let shouldFail = false
      let failReason = ''

      if (failThreshold !== null) {
        const total = report.summary.critical + report.summary.high + report.summary.medium + report.summary.low
        if (total >= failThreshold) {
          shouldFail = true
          failReason = `Found ${total} vulnerabilities (threshold: ${failThreshold})`
        }
      } else {
        if (failOnCritical && report.summary.critical > 0) {
          shouldFail = true
          failReason = `Found ${report.summary.critical} critical vulnerabilities`
        } else if (failOnHigh && report.summary.high > 0) {
          shouldFail = true
          failReason = `Found ${report.summary.high} high vulnerabilities`
        }
      }

      if (shouldFail) {
        exitCode = 1
      }

      return NextResponse.json({
        success: !shouldFail,
        scanId,
        summary: report.summary,
        results: report.results,
        filesScanned: files.length,
        durationSeconds,
        platform,
        scannerTier: isPro ? 'advanced' : 'basic',
        exitCode,
        message: shouldFail ? failReason : 'Scan completed successfully',
        reportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reports/${scanId}`,
      })

    } finally {
      if (repoPath) {
        const { cleanupRepo } = await import('@/lib/repo-scanner')
        await cleanupRepo(repoPath).catch(console.error)
      }
    }

  } catch (error: any) {
    console.error('CI/CD Scan error:', error)
    return NextResponse.json({ error: error.message || 'Scan failed', exitCode: 1 }, { status: 500 })
  }
}

// GET - Validate API key
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    
    // ✅ FIXED: Proper type handling
    const { data: apiKeyData, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, user_id, name, created_at, last_used_at, profiles!inner(email, plan_type)')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single()

    if (error || !apiKeyData) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const profiles = apiKeyData.profiles as unknown as { email: string; plan_type: string }

    return NextResponse.json({
      valid: true,
      keyName: apiKeyData.name,
      userId: apiKeyData.user_id,
      userEmail: profiles.email,
      planType: profiles.plan_type,
      createdAt: apiKeyData.created_at,
      lastUsedAt: apiKeyData.last_used_at,
    })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to validate API key' }, { status: 500 })
  }
}