// app/api/reports/[id]/export/route.ts (COMPLETE FILE - replace the old one)
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireUser, HttpError } from "@/lib/auth-server"
import { checkRateLimit } from "@/lib/rate-limit"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_VULNS_IN_PDF = 500

// Normalize Unicode punctuation (smart quotes, non-breaking hyphens, em-dashes, bullets)
// into standard WinAnsi characters BEFORE stripping unsupported symbols.
const clean = (v: unknown, max = 1500) =>
  String(v ?? "")
    .replace(/```[\w-]*\n?/g, "")
    .replace(/```/g, "")
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-")
    .replace(/[\u2018\u2019\u201A\u2032`]/g, "'")
    .replace(/[\u201C\u201D\u201E\u2033]/g, '"')
    .replace(/\u2022/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/[\u00A0\u202F\u2007]/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, max)

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUser(req)
    if (!(await checkRateLimit(`export:user:${userId}`, 20, 3600))) {
      throw new HttpError("Too many downloads. Please try again later.", 429)
    }

    const { id } = await params
    if (!UUID_RE.test(id)) throw new HttpError("Report not found", 404)

    const { data: scan } = await supabaseAdmin
      .from("scans")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle()

    if (!scan) throw new HttpError("Report not found", 404)

    const { data: vulnerabilities } = await supabaseAdmin
      .from("vulnerabilities")
      .select("*")
      .eq("scan_id", id)
      .limit(MAX_VULNS_IN_PDF)

    /* ---------- CREATE PDF ---------- */
    const pdfDoc = await PDFDocument.create()
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    const courier = await pdfDoc.embedFont(StandardFonts.Courier)

    let page = pdfDoc.addPage([595, 842]) // A4
    const { width, height } = page.getSize()
    let yPosition = height - 55

    const drawHeaderAndFooter = (pg: any, pageNum: number) => {
      pg.drawText("PROBCHECK SECURITY AUDIT REPORT", {
        x: 50,
        y: height - 30,
        size: 8,
        font: timesBold,
        color: rgb(0.3, 0.3, 0.3),
      })
      pg.drawLine({
        start: { x: 50, y: height - 35 },
        end: { x: width - 50, y: height - 35 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      })

      pg.drawLine({
        start: { x: 50, y: 48 },
        end: { x: width - 50, y: 48 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      })
      pg.drawText("VERIFIED & CERTIFIED SECURE BY PROBCHECK (probcheck.in) - AUTOMATED BUG BOUNTY TRIAGE", {
        x: 50,
        y: 34,
        size: 7,
        font: timesBold,
        color: rgb(0.15, 0.45, 0.25),
      })
      pg.drawText(`Scan ID: ${id} | Page ${pageNum}`, {
        x: width - 195,
        y: 34,
        size: 7,
        font: timesRoman,
        color: rgb(0.4, 0.4, 0.4),
      })
    }

    let pageNum = 1
    drawHeaderAndFooter(page, pageNum)

    // Keep at least 65pt from the bottom so body text never touches the footer line at y=48
    const newPageIfNeeded = (requiredSpace = 65) => {
      const minBottomY = Math.max(65, requiredSpace)
      if (yPosition < minBottomY) {
        pageNum++
        page = pdfDoc.addPage([595, 842])
        yPosition = height - 55
        drawHeaderAndFooter(page, pageNum)
      }
    }

    const addText = (raw: string, fontSize: number, font: any, options?: { indent?: number; color?: any }) => {
      const text = clean(raw)
      if (!text) return
      const lineHeight = fontSize * 1.35
      const maxWidth = width - 100
      const indent = options?.indent || 0
      const textColor = options?.color || rgb(0.1, 0.1, 0.1)
      let line = ""

      const flush = () => {
        newPageIfNeeded(65)
        page.drawText(line.trim(), { x: 50 + indent, y: yPosition, size: fontSize, font, color: textColor })
        yPosition -= lineHeight
      }

      for (const word of text.split(" ")) {
        const testLine = line + word + " "
        if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth - indent && line !== "") {
          flush()
          line = word + " "
        } else {
          line = testLine
        }
      }
      if (line.trim() !== "") flush()
    }

    const addSpace = (amount = 14) => {
      yPosition -= amount
      newPageIfNeeded(65)
    }

    addText("Automated Bug Bounty & Security Audit Report", 20, timesBold, { color: rgb(0.1, 0.3, 0.15) })
    addSpace(14)

    addText("Project Information", 14, timesBold)
    addSpace(4)
    addText(`Project Name: ${scan.scan_name || "Unnamed"}`, 11, timesRoman)
    addText(`Scan Date: ${new Date(scan.created_at).toUTCString()}`, 11, timesRoman)
    addText(`Audit Status: ${String(scan.status || "unknown").toUpperCase()}`, 11, timesRoman)
    addText(
      `Execution Duration: ${
        scan.scan_duration_seconds
          ? `${Math.floor(scan.scan_duration_seconds / 60)}m ${scan.scan_duration_seconds % 60}s`
          : "-"
      }`,
      11,
      timesRoman
    )
    addSpace(18)

    addText("Vulnerability Summary", 14, timesBold)
    addSpace(4)

    if (scan.status !== "completed") {
      addText("This scan did not complete successfully, so no verified findings are available.", 11, timesRoman, { color: rgb(0.6, 0.1, 0.1) })
    } else {
      const total =
        (scan.critical_count || 0) + (scan.high_count || 0) + (scan.medium_count || 0) + (scan.low_count || 0)
      addText(`Total Verified Findings: ${total}`, 11, timesBold)
      addText(`- Critical Severity: ${scan.critical_count || 0}`, 11, timesRoman, { indent: 15, color: rgb(0.75, 0.1, 0.1) })
      addText(`- High Severity: ${scan.high_count || 0}`, 11, timesRoman, { indent: 15, color: rgb(0.8, 0.35, 0.05) })
      addText(`- Medium Severity: ${scan.medium_count || 0}`, 11, timesRoman, { indent: 15, color: rgb(0.65, 0.5, 0.05) })
      addText(`- Low Severity: ${scan.low_count || 0}`, 11, timesRoman, { indent: 15, color: rgb(0.1, 0.4, 0.7) })
      addSpace(18)

      addText("Detailed Findings & Remediation Guidance", 14, timesBold)
      addSpace(8)

      if (vulnerabilities && vulnerabilities.length > 0) {
        vulnerabilities.forEach((v: any, i: number) => {
          newPageIfNeeded(110)
          addText(`${i + 1}. ${v.title || "Untitled Vulnerability"}`, 11, timesBold)
          addText(
            `Severity: ${String(v.severity || "unknown").toUpperCase()}${v.cwe ? ` | CWE: ${v.cwe}` : ""} | File: ${v.file_path || "Unknown"}${v.line_number ? ` (Line ${v.line_number})` : ""}`,
            9.5,
            timesBold,
            { indent: 10, color: rgb(0.25, 0.25, 0.25) }
          )

          if (v.description) {
            const parts = String(v.description).split("[POC]:")
            addText(`Root Cause: ${parts[0]}`, 10, timesRoman, { indent: 10 })
          }
          if (v.suggested_fix) {
            addText(`Remediation: ${v.suggested_fix}`, 9.5, courier, { indent: 10, color: rgb(0.1, 0.35, 0.15) })
          }
          addSpace(12)
        })
      } else {
        addText("No vulnerabilities were detected by this scan.", 11, timesRoman)
      }
    }

    const pdfBuffer = Buffer.from(await pdfDoc.save())
    if (pdfBuffer.length === 0) throw new Error("Generated PDF is empty")

    const { error: recordError } = await supabaseAdmin.from("reports").insert({
      scan_id: id,
      user_id: userId,
      report_type: "pdf",
      file_size_bytes: pdfBuffer.length,
      generated_at: new Date().toISOString(),
    })
    if (recordError) console.warn("Failed to save report record:", recordError.message)

    const safeFilename = String(scan.scan_name || "scan").replace(/[^a-z0-9]/gi, "_").slice(0, 60)

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}-security-report.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error: any) {
    const isHttp = error instanceof HttpError
    if (!isHttp) console.error("PDF Export Error:", error)
    return NextResponse.json(
      { error: isHttp ? error.message : "Failed to generate PDF" },
      { status: isHttp ? error.status : 500 }
    )
  }
}