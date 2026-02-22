// app/api/scan/route.ts - FIXED PRO TIER DETECTION
import { advancedAnalyzeFiles } from '@/lib/advanced-scanner'
import { canUserScan, decrementScanCount } from "@/lib/subscription"
import { NextResponse } from "next/server"
import AdmZip from "adm-zip"
import { analyzeFiles } from "@/lib/scanner"
import { sendScanCompleteEmail } from "@/lib/email"
import { shouldSendScanEmail } from "@/lib/email-check"
import { 
  createScan, 
  updateScanStatus, 
  saveVulnerabilitiesToDB, 
  completeScan,
  failScan,
  setLastReport 
} from "@/lib/scan-store"
import { supabaseAdmin } from "@/lib/supabase"
import { updateUsageStats } from "@/lib/usage-stats"
import { logAudit } from "@/lib/audit-log"

export const runtime = "nodejs"

const SKIP_DIRS = [
  "node_modules", ".git", ".next", "dist", "build", "out",
  "coverage", "vendor", "__pycache__", ".venv", "venv",
]

const SKIP_FILES = [
  ".min.js", ".min.css", ".map", ".lock",
  "package-lock.json", "yarn.lock",
]

const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  javascript: [".js", ".jsx", ".mjs", ".cjs"],
  typescript: [".ts", ".tsx"],
  python: [".py"],
  go: [".go"],
  java: [".java"],
  ruby: [".rb"],
  php: [".php"],
  csharp: [".cs"],
  rust: [".rs"],
  cpp: [".cpp", ".cc", ".cxx", ".c", ".h", ".hpp"],
}

function getAllowedExtensions(language: string): string[] {
  if (!language || language === "all") {
    return Object.values(LANGUAGE_EXTENSIONS).flat()
  }
  return LANGUAGE_EXTENSIONS[language] || Object.values(LANGUAGE_EXTENSIONS).flat()
}

export async function POST(req: Request) {
  const startTime = Date.now()
  let scanId = ""
  let userEmail = ""
  let userName = ""
  let userId = ""

  try {
    const form = await req.formData()

    const file = form.get("file") as File | null
    const projectName = String(form.get("projectName") || "unnamed-project")
    const userIdFromForm = form.get("userId") ? String(form.get("userId")) : null
    const language = String(form.get("language") || "javascript")

    if (!userIdFromForm) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to scan." },
        { status: 401 }
      )
    }

    userId = userIdFromForm

    // ✅ FIX 1: Load profile with better error handling
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      console.error('❌ Profile load error:', profileError)
      return NextResponse.json(
        { error: "Failed to load user profile" },
        { status: 500 }
      )
    }

    userEmail = profile.email || ""
    userName = profile.full_name || ""

    // ✅ FIX 2: Determine plan type BEFORE scan check
    const planType = (profile.plan_type || "free").toLowerCase()
    const isPro = planType === 'pro' || planType === 'enterprise'

    console.log(`\n🔍 USER PLAN CHECK:`)
    console.log(`   User ID: ${userId}`)
    console.log(`   Plan Type from DB: ${profile.plan_type}`)
    console.log(`   Normalized Plan: ${planType}`)
    console.log(`   Is Pro: ${isPro}`)
    console.log(`   Scanner Tier: ${isPro ? 'ADVANCED' : 'BASIC'}\n`)

    const scanCheck = await canUserScan(userId)

    if (!scanCheck.allowed) {
      return NextResponse.json(
        { 
          error: scanCheck.reason || "Scan limit reached",
          upgrade: true 
        },
        { status: 403 }
      )
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const scan = await createScan({
      user_id: userId,
      scan_name: projectName,
      repository_name: file.name,
    })

    scanId = scan.id

    await updateScanStatus(scanId, "scanning", 0)

    const buffer = Buffer.from(await file.arrayBuffer())
    const zip = new AdmZip(buffer)
    const entries = zip.getEntries()
    const allowedExtensions = getAllowedExtensions(language)

    const files: { path: string; content: string }[] = []

    for (const entry of entries) {
      if (entry.isDirectory) continue
      const path = entry.entryName.toLowerCase()

      if (SKIP_DIRS.some(d => path.includes(`/${d}/`) || path.startsWith(`${d}/`))) continue
      if (SKIP_FILES.some(ext => path.endsWith(ext))) continue
      if (!allowedExtensions.some(ext => path.endsWith(ext))) continue

      const content = entry.getData().toString("utf8")
      if (content.trim().length < 20) continue

      files.push({ path: entry.entryName, content })
    }

    const safeFiles = files.slice(0, 30)

    // ✅ FIX 3: Use the isPro we determined earlier
    console.log(`📊 Scanning with ${isPro ? '🚀 ADVANCED (Pro)' : '⚡ BASIC (Free)'} tier`)

    const report = isPro
      ? await advancedAnalyzeFiles(safeFiles, { 
          projectName, 
          language,
          userId: userId,
          scanId: scanId
        })
      : await analyzeFiles(safeFiles, { projectName, language })

    if (report.error) {
      console.error(`❌ Scan failed with error: ${report.error}`)
      
      await failScan(scanId, report.error)
      
      const shouldSendEmail = await shouldSendScanEmail(userId)
      if (shouldSendEmail && userEmail) {
        try {
          await sendScanCompleteEmail({
            userEmail,
            userName: userName || undefined,
            scanId: scanId,
            projectName,
            summary: { critical: 0, high: 0, medium: 0, low: 0 },
            filesScanned: 0,
            error: report.error,
            selectedLanguage: language
          })
          console.log('✅ Error notification email sent')
        } catch (emailError) {
          console.error('⚠️ Failed to send error email:', emailError)
        }
      }
      
      return NextResponse.json(
        { 
          error: report.error,
          scanId,
          selectedLanguage: language,
          uploadedFiles: files.map(f => f.path)
        },
        { status: 400 }
      )
    }

    await saveVulnerabilitiesToDB(scanId, report.results || [])

    const durationSeconds = Math.round((Date.now() - startTime) / 1000)

    await completeScan(scanId, {
      total_files_scanned: safeFiles.length,
      scan_duration_seconds: durationSeconds,
    })

    const shouldSendEmail = await shouldSendScanEmail(userId)
    
    if (shouldSendEmail && userEmail) {
      try {
        await sendScanCompleteEmail({
          userEmail,
          userName: userName || undefined,
          scanId: scanId,
          projectName,
          summary: report.summary,
          filesScanned: safeFiles.length,
          warnings: report.warnings,
          selectedLanguage: language
        })
        console.log('✅ Scan completion email sent')
      } catch (emailError) {
        console.error('⚠️ Failed to send email, but scan completed:', emailError)
      }
    } else {
      console.log('📧 Email notifications disabled by user')
    }

    await updateUsageStats(userId, {
      scans: 1,
      filesScanned: safeFiles.length,
      vulnerabilitiesFound:
        report.summary.critical +
        report.summary.high +
        report.summary.medium +
        report.summary.low,
    })

    await logAudit({
      userId: userId,
      action: "scan_completed",
      resourceType: "scan",
      resourceId: scanId,
      metadata: { projectName, language, filesScanned: safeFiles.length },
    })

    await decrementScanCount(userId)

    const finalReport = {
      scanId,
      project: projectName,
      summary: report.summary,
      results: report.results,
      filesScanned: safeFiles.length,
      durationSeconds,
      language,
      scannerTier: isPro ? 'advanced' : 'basic',  // ✅ FIX 4: Use correct isPro value
      warnings: report.warnings,
    }

    setLastReport(finalReport)

    return NextResponse.json(finalReport)

  } catch (err: any) {
    console.error('❌ Scan error:', err)
    
    if (scanId) {
      await failScan(scanId, String(err?.message || err))
      
      try {
        const shouldSendEmail = await shouldSendScanEmail(userId)
        if (shouldSendEmail && userEmail) {
          await sendScanCompleteEmail({
            userEmail,
            userName: userName || undefined,
            scanId,
            projectName: 'Scan',
            summary: { critical: 0, high: 0, medium: 0, low: 0 },
            filesScanned: 0,
            error: String(err?.message || err)
          })
        }
      } catch (emailError) {
        console.error('⚠️ Failed to send error email:', emailError)
      }
    }

    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    )
  }
}