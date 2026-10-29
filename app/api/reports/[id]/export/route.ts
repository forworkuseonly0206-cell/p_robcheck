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

const clean = (v: unknown, max = 1000) =>
  String(v ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "?")
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

    let page = pdfDoc.addPage([595, 842]) // A4
    const { width, height } = page.getSize()
    let yPosition = height - 50

    const drawHeaderAndFooter = (pg: any, pageNum: number) => {
      // Header branding
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

      // Footer Watermark & Compliance Stamp
      pg.drawLine({
        start: { x: 50, y: 45 },
        end: { x: width - 50, y: 45 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      })
      pg.drawText("VERIFIED & CERTIFIED SECURE BY PROBCHECK (probcheck.in) ", {
        x: 50,
        y: 32,
        size: 7,
        font: timesBold,
        color: rgb(0.2, 0.5, 0.3),
      })
      pg.drawText(`Scan ID: ${id} | Page ${pageNum}`, {
        x: width - 180,
        y: 32,
        size: 7,
        font: timesRoman,
        color: rgb(0.4, 0.4, 0.4),
      })
    }

    let pageNum = 1
    drawHeaderAndFooter(page, pageNum)

    const newPageIfNeeded = (requiredSpace = 40) => {
      if (yPosition < requiredSpace) {
        pageNum++
        page = pdfDoc.addPage([595, 842])
        yPosition = height - 50
        drawHeaderAndFooter(page, pageNum)
      }
    }

    const addText = (raw: string, fontSize: number, font: any, options?: { indent?: number; color?: any }) => {
      const text = clean(raw)
      const lineHeight = fontSize * 1.3
      const maxWidth = width - 100
      const indent = options?.indent || 0
      const textColor = options?.color || rgb(0.1, 0.1, 0.1)
      let line = ""

      const flush = () => {
        newPageIfNeeded(lineHeight + 20)
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

    const addSpace = (amount = 15) => {
      yPosition -= amount
      newPageIfNeeded()
    }

    // Title Section
    addText("Security Audit Report", 22, timesBold, { color: rgb(0.1, 0.3, 0.1) })
    addSpace(15)

    addText("Project Information", 14, timesBold)
    addSpace(5)
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
    addSpace(20)

    addText("Vulnerability Summary", 14, timesBold)
    addSpace(5)

    if (scan.status !== "completed") {
      addText("This scan did not complete successfully, so no verified findings are available.", 11, timesRoman, { color: rgb(0.6, 0.1, 0.1) })
    } else {
      const total =
        (scan.critical_count || 0) + (scan.high_count || 0) + (scan.medium_count || 0) + (scan.low_count || 0)
      addText(`Total Verified Findings: ${total}`, 11, timesBold)
      addText(`• Critical Severity: ${scan.critical_count || 0}`, 11, timesRoman, { indent: 15, color: rgb(0.8, 0.1, 0.1) })
      addText(`• High Severity: ${scan.high_count || 0}`, 11, timesRoman, { indent: 15, color: rgb(0.8, 0.4, 0.1) })
      addText(`• Medium Severity: ${scan.medium_count || 0}`, 11, timesRoman, { indent: 15, color: rgb(0.7, 0.6, 0.1) })
      addText(`• Low Severity: ${scan.low_count || 0}`, 11, timesRoman, { indent: 15, color: rgb(0.1, 0.4, 0.7) })
      addSpace(20)

      addText("Detailed Findings & Exploit Pathways", 14, timesBold)
      addSpace(10)

      if (vulnerabilities && vulnerabilities.length > 0) {
        vulnerabilities.forEach((v: any, i: number) => {
          newPageIfNeeded(90)
          addText(`${i + 1}. ${v.title || "Untitled Vulnerability"}`, 11, timesBold)
          addText(`Severity: ${String(v.severity || "unknown").toUpperCase()}${v.cwe ? ` | CWE: ${v.cwe}` : ""}`, 10, timesRoman, { indent: 10 })
          addText(`File Path: ${v.file_path || "Unknown"}${v.line_number ? ` (Line ${v.line_number})` : ""}`, 10, timesRoman, { indent: 10 })
          if (v.description) addText(`Description & Attack Path: ${v.description}`, 10, timesRoman, { indent: 10 })
          if (v.suggested_fix) addText(`Remediation & Patch: ${v.suggested_fix}`, 10, timesRoman, { indent: 10 })
          addSpace(15)
        })
      } else {
        addText("No vulnerabilities were detected by this scan. Note that automated analysis serves as a first line of defense and cannot guarantee absolute security against complex business logic flaws.", 11, timesRoman)
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
    if (recordError) console.warn("⚠️ Failed to save report record:", recordError.message)

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