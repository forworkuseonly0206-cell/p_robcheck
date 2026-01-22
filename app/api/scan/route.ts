// app/api/scan/route.ts
import { advancedAnalyzeFiles } from '@/lib/advanced-scanner'
import { getUserSubscription } from '@/lib/subscription'
import { canUserScan, decrementScanCount } from "@/lib/subscription"
import { NextResponse } from "next/server"
import AdmZip from "adm-zip"
import { analyzeFiles } from "@/lib/scanner"
import { sendScanCompleteEmail } from "@/lib/email"
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

const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || "production"
const isTesting = APP_ENV !== "production"

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
  let scanId: string | null = null

  try {
    const form = await req.formData()

    const file = form.get("file") as File | null
    const projectName = String(form.get("projectName") || "unnamed-project")
    const userId = form.get("userId") ? String(form.get("userId")) : null
    const language = String(form.get("language") || "javascript")

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to scan." },
        { status: 401 }
      )
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    const scanCheck = await canUserScan(userId as string)

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
      user_id: userId as string,
      scan_name: projectName,
      repository_name: file.name,
    })

    scanId = scan.id

    await updateScanStatus(scanId as string, "scanning", 0)

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

    const subscription = await getUserSubscription(userId as string)
    const isPro = subscription?.planType === 'pro' || subscription?.planType === 'enterprise'

    console.log(`📊 Scanning with ${isPro ? 'ADVANCED' : 'BASIC'} tier`)

    const report = isPro
      ? await advancedAnalyzeFiles(safeFiles, { 
          projectName, 
          language,
          userId: userId as string,
          scanId: scanId as string
        })
      : await analyzeFiles(safeFiles, { projectName, language })

    await saveVulnerabilitiesToDB(scanId as string, report.results || [])

    const durationSeconds = Math.round((Date.now() - startTime) / 1000)

    await completeScan(scanId as string, {
      total_files_scanned: safeFiles.length,
      scan_duration_seconds: durationSeconds,
    })

    await sendScanCompleteEmail({
      userEmail: profile.email,
      userName: profile.full_name,
      scanId: scanId as string,
      projectName,
      summary: report.summary,
      filesScanned: safeFiles.length,
    })

    await updateUsageStats(userId as string, {
      scans: 1,
      filesScanned: safeFiles.length,
      vulnerabilitiesFound:
        report.summary.critical +
        report.summary.high +
        report.summary.medium +
        report.summary.low,
    })

    await logAudit({
      userId: userId as string,
      action: "scan_completed",
      resourceType: "scan",
      resourceId: scanId as string,
      metadata: { projectName, language, filesScanned: safeFiles.length },
    })

    await decrementScanCount(userId as string)

    const finalReport = {
      scanId,
      project: projectName,
      summary: report.summary,
      results: report.results,
      filesScanned: safeFiles.length,
      durationSeconds,
      language,
      scannerTier: isPro ? 'advanced' : 'basic',
    }

    setLastReport(finalReport)

    return NextResponse.json(finalReport)

  } catch (err: any) {
    if (scanId) {
      await failScan(scanId as string, String(err?.message || err))
    }

    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    )
  }
}