// app/api/scan/route.ts (COMPLETE FILE - replace the old one)
import { advancedAnalyzeFiles, analyzeFiles } from "@/lib/precise-scanner"
import { NextResponse } from "next/server"
import AdmZip from "adm-zip"
import { sendScanCompleteEmail } from "@/lib/email"
import { shouldSendScanEmail } from "@/lib/email-check"
import {
  createScan,
  updateScanStatus,
  saveVulnerabilitiesToDB,
  completeScan,
  failScan,
} from "@/lib/scan-store"
import { consumeScanSlot, refundScanSlot } from "@/lib/scan-limits"
import { requireUser, getClientIp, HttpError } from "@/lib/auth-server"
import { checkRateLimit } from "@/lib/rate-limit"
import { supabaseAdmin } from "@/lib/supabase"
import { updateUsageStats } from "@/lib/usage-stats"
import { logAudit } from "@/lib/audit-log"

export const runtime = "nodejs"
export const maxDuration = 60 // Prevents serverless timeout on multi-file ZIP scans

// ---- Safety limits (protect your server from huge or booby-trapped uploads) ----
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024   // the ZIP itself: 25 MB
const MAX_ENTRIES = 5000                    // files inside the ZIP
const MAX_ENTRY_BYTES = 1 * 1024 * 1024     // one file once unpacked: 1 MB
const MAX_TOTAL_BYTES = 50 * 1024 * 1024    // everything unpacked: 50 MB
const MAX_FILES_TO_SCAN = 30

const GENERIC_SERVER_ERROR = "The scan failed because of a server error. Please try again."
const GENERIC_SCANNER_ERROR = "The scanner could not complete this scan. Please try again."

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
  const all = Object.values(LANGUAGE_EXTENSIONS).flat()
  if (!language || language === "all") return all

  const picked = language.split(",").map(l => l.trim().toLowerCase()).filter(Boolean)
  const exts = picked.flatMap(l => LANGUAGE_EXTENSIONS[l] || [])
  return exts.length ? exts : all
}

// Prioritize real production files over test/mock files when capping at 30 files
function isTestFile(filePath: string): boolean {
  const lower = filePath.toLowerCase()
  return (
    lower.includes("/test/") ||
    lower.includes("/tests/") ||
    lower.includes("/__tests__/") ||
    lower.includes(".test.") ||
    lower.includes(".spec.")
  )
}

export async function POST(req: Request) {
  const startTime = Date.now()
  let scanId = ""
  let userEmail = ""
  let userName = ""
  let userId = ""
  let slotTaken = false
  let scanCompleted = false

  try {
    userId = await requireUser(req)

    const ip = getClientIp(req)
    const okUser = await checkRateLimit(`scan:user:${userId}`, 10, 3600)
    const okIp = await checkRateLimit(`scan:ip:${ip}`, 30, 3600)
    if (!okUser || !okIp) {
      throw new HttpError("Too many scan requests. Please wait a while and try again.", 429)
    }

    if (Number(req.headers.get("content-length") || 0) > MAX_UPLOAD_BYTES + 1_000_000) {
      throw new HttpError("File is too large (maximum 25 MB).", 413)
    }

    const form = await req.formData()

    const file = form.get("file") as File | null
    const projectName =
      String(form.get("projectName") || "unnamed-project")
        .replace(/[\u0000-\u001f<>]/g, "")
        .trim()
        .slice(0, 100) || "unnamed-project"
    const language = String(form.get("language") || "javascript").slice(0, 100)

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      console.error("❌ Profile load error:", profileError)
      throw new HttpError("Failed to load user profile", 500)
    }

    userEmail = profile.email || ""
    userName = profile.full_name || ""

    const planType = (profile.plan_type || "free").toLowerCase()
    const isPro = planType === "pro" || planType === "enterprise"

    console.log(`🔍 User ${userId} | plan: ${planType} | scanner: ${isPro ? "ADVANCED" : "BASIC"}`)

    if (!file) {
      throw new HttpError("No file provided", 400)
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      throw new HttpError("Please upload a .zip file", 400)
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new HttpError("File is too large (maximum 25 MB).", 413)
    }

    const allowed = await consumeScanSlot(userId)
    if (!allowed) {
      return NextResponse.json(
        {
          error: "You've used your free scan. Upgrade to Pro for unlimited scans.",
          upgrade: true,
        },
        { status: 403 }
      )
    }
    slotTaken = true

    const scan = await createScan({
      user_id: userId,
      scan_name: projectName,
      repository_name: file.name.slice(0, 200),
    })

    scanId = scan.id

    await updateScanStatus(scanId, "scanning", 0)

    const buffer = Buffer.from(await file.arrayBuffer())
    const zip = new AdmZip(buffer)
    const entries = zip.getEntries()

    if (entries.length > MAX_ENTRIES) {
      throw new HttpError("This ZIP contains too many files (maximum 5,000).", 400)
    }

    // Sort entries so non-test files are unpacked first
    const sortedEntries = [...entries].sort((a, b) => {
      const aTest = isTestFile(a.entryName) ? 1 : 0
      const bTest = isTestFile(b.entryName) ? 1 : 0
      return aTest - bTest || a.entryName.localeCompare(b.entryName)
    })

    const allowedExtensions = getAllowedExtensions(language)
    const files: { path: string; content: string }[] = []
    let totalBytes = 0
    let matchedCount = 0

    for (const entry of sortedEntries) {
      if (entry.isDirectory) continue
      const path = entry.entryName.toLowerCase()

      if (SKIP_DIRS.some(d => path.includes(`/${d}/`) || path.startsWith(`${d}/`))) continue
      if (SKIP_FILES.some(ext => path.endsWith(ext))) continue
      if (!allowedExtensions.some(ext => path.endsWith(ext))) continue

      matchedCount++
      if (files.length >= MAX_FILES_TO_SCAN) continue

      if (entry.header.size > MAX_ENTRY_BYTES) continue
      const content = entry.getData().toString("utf8")
      if (content.length > MAX_ENTRY_BYTES) continue

      totalBytes += content.length
      if (totalBytes > MAX_TOTAL_BYTES) {
        throw new HttpError("The unpacked code is too large to scan.", 413)
      }

      if (content.trim().length < 20) continue

      files.push({ path: entry.entryName.slice(0, 300), content })
    }

    const safeFiles = files.slice(0, MAX_FILES_TO_SCAN)
    const coverageWarnings =
      matchedCount > safeFiles.length
        ? [`Only ${safeFiles.length} of ${matchedCount} matching files were scanned. The other ${matchedCount - safeFiles.length} were not checked.`]
        : []

    if (safeFiles.length === 0) {
      throw new HttpError("No scannable files were found in this ZIP for the selected language.", 400)
    }

    console.log(`📊 Scanning ${safeFiles.length} files with ${isPro ? "🚀 ADVANCED (Pro)" : "⚡ BASIC (Free)"} tier`)

    const report = isPro
      ? await advancedAnalyzeFiles(safeFiles, {
          projectName,
          language,
          userId: userId,
          scanId: scanId,
        })
      : await analyzeFiles(safeFiles, { projectName, language })

    if (report.error) {
      console.error(`❌ Scan failed with error: ${report.error}`)

      await failScan(scanId, GENERIC_SCANNER_ERROR)
      await refundScanSlot(userId)

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
            error: GENERIC_SCANNER_ERROR,
            selectedLanguage: language,
          })
        } catch (emailError) {
          console.error("⚠️ Failed to send error email:", emailError)
        }
      }

      return NextResponse.json(
        { error: GENERIC_SCANNER_ERROR, scanId, selectedLanguage: language },
        { status: 400 }
      )
    }

    const allWarnings = [...(report.warnings || []), ...coverageWarnings]

    await saveVulnerabilitiesToDB(scanId, report.results || [])

    const durationSeconds = Math.round((Date.now() - startTime) / 1000)

    await completeScan(scanId, {
      total_files_scanned: safeFiles.length,
      scan_duration_seconds: durationSeconds,
    })
    scanCompleted = true

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
          warnings: allWarnings,
          selectedLanguage: language,
        })
      } catch (emailError) {
        console.error("⚠️ Failed to send email, but scan completed:", emailError)
      }
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

    try {
      await logAudit({
        userId: userId,
        action: "scan_completed",
        resourceType: "scan",
        resourceId: scanId,
        metadata: { projectName, language, filesScanned: safeFiles.length },
      })
    } catch (auditError) {
      console.error("⚠️ Audit log failed (scan is still saved):", auditError)
    }

    return NextResponse.json({
      scanId,
      project: projectName,
      summary: report.summary,
      totalEstimatedBountyUsd: report.totalEstimatedBountyUsd || 0,
      results: report.results,
      filesScanned: safeFiles.length,
      durationSeconds,
      language,
      scannerTier: isPro ? "advanced" : "basic",
      warnings: allWarnings,
    })
  } catch (err: any) {
    const isHttp = err instanceof HttpError
    if (!isHttp) console.error("❌ Scan error:", err)

    if (slotTaken && !scanCompleted) {
      await refundScanSlot(userId)
    }

    if (scanId) {
      await failScan(scanId, isHttp ? err.message : GENERIC_SERVER_ERROR)
    }

    return NextResponse.json(
      { error: isHttp ? err.message : GENERIC_SERVER_ERROR },
      { status: isHttp ? err.status : 500 }
    )
  }
}