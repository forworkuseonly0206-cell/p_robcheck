// app/api/reports/[id]/export/route.ts
import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 })
    }

    console.log("Fetching scan:", id)

    const { data: scan, error: scanError } = await supabaseAdmin
      .from("scans")
      .select("*")
      .eq("id", id)
      .single()

    if (scanError || !scan) {
      console.error("Scan fetch error:", scanError)
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    console.log("Scan found:", scan.scan_name)

    const { data: vulnerabilities } = await supabaseAdmin
      .from("vulnerabilities")
      .select("*")
      .eq("scan_id", id)

    console.log("Vulnerabilities found:", vulnerabilities?.length || 0)

    /* ---------- CREATE PDF ---------- */
    const pdfDoc = await PDFDocument.create()
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    
    let page = pdfDoc.addPage([595, 842]) // A4 size
    const { width, height } = page.getSize()
    let yPosition = height - 50

    // Helper function to add text and manage pages
    const addText = (text: string, fontSize: number, font: any, options?: { bold?: boolean, indent?: number }) => {
      const lineHeight = fontSize * 1.2
      const maxWidth = width - 100
      const indent = options?.indent || 0
      
      // Simple text wrapping
      const words = text.split(' ')
      let line = ''
      
      for (const word of words) {
        const testLine = line + word + ' '
        const testWidth = font.widthOfTextAtSize(testLine, fontSize)
        
        if (testWidth > maxWidth && line !== '') {
          if (yPosition < 50) {
            page = pdfDoc.addPage([595, 842])
            yPosition = height - 50
          }
          
          page.drawText(line.trim(), {
            x: 50 + indent,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          })
          
          line = word + ' '
          yPosition -= lineHeight
        } else {
          line = testLine
        }
      }
      
      if (line.trim() !== '') {
        if (yPosition < 50) {
          page = pdfDoc.addPage([595, 842])
          yPosition = height - 50
        }
        
        page.drawText(line.trim(), {
          x: 50 + indent,
          y: yPosition,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        })
        
        yPosition -= lineHeight
      }
    }

    const addSpace = (amount: number = 20) => {
      yPosition -= amount
      if (yPosition < 50) {
        page = pdfDoc.addPage([595, 842])
        yPosition = height - 50
      }
    }

    /* ---------- HEADER ---------- */
    addText("Security Scan Report", 24, timesBold)
    addSpace(30)

    /* ---------- PROJECT INFO ---------- */
    addText("Project Information", 16, timesBold)
    addSpace(10)
    
    addText(`Project Name: ${scan.scan_name}`, 12, timesRoman)
    addText(`Scan Date: ${new Date(scan.created_at).toDateString()}`, 12, timesRoman)
    addText(`Status: ${scan.status || 'completed'}`, 12, timesRoman)
    addText(
      `Duration: ${
        scan.scan_duration_seconds
          ? `${Math.floor(scan.scan_duration_seconds / 60)}m ${scan.scan_duration_seconds % 60}s`
          : "—"
      }`,
      12,
      timesRoman
    )
    addSpace(30)

    /* ---------- SUMMARY ---------- */
    addText("Vulnerability Summary", 16, timesBold)
    addSpace(10)
    
    const total = (scan.critical_count || 0) + (scan.high_count || 0) + 
                 (scan.medium_count || 0) + (scan.low_count || 0)
    addText(`Total Vulnerabilities: ${total}`, 12, timesRoman)
    addText(`Critical: ${scan.critical_count || 0}`, 12, timesRoman, { indent: 20 })
    addText(`High: ${scan.high_count || 0}`, 12, timesRoman, { indent: 20 })
    addText(`Medium: ${scan.medium_count || 0}`, 12, timesRoman, { indent: 20 })
    addText(`Low: ${scan.low_count || 0}`, 12, timesRoman, { indent: 20 })
    addSpace(30)

    /* ---------- FINDINGS ---------- */
    addText("Detailed Findings", 16, timesBold)
    addSpace(10)

    if (vulnerabilities && vulnerabilities.length > 0) {
      vulnerabilities.forEach((v: any, i: number) => {
        addText(
          `${i + 1}. ${v.title || "Untitled Vulnerability"}`,
          12,
          timesBold
        )
        addText(`Severity: ${String(v.severity || "unknown").toUpperCase()}`, 10, timesRoman, { indent: 10 })
        addText(`File: ${v.file_path || "Unknown"}`, 10, timesRoman, { indent: 10 })
        
        if (v.line_number) {
          addText(`Line: ${v.line_number}`, 10, timesRoman, { indent: 10 })
        }
        
        if (v.description) {
          addText(`Description: ${v.description}`, 10, timesRoman, { indent: 10 })
        }
        
        if (v.cwe) {
          addText(`CWE: ${v.cwe}`, 10, timesRoman, { indent: 10 })
        }
        
        addSpace(15)
      })
    } else {
      addText("No vulnerabilities found. Your code is clean!", 12, timesRoman)
    }

    /* ---------- FOOTER ---------- */
    addSpace(20)
    addText(
      `Generated on ${new Date().toLocaleString()}`,
      8,
      timesRoman
    )

    const pdfBytes = await pdfDoc.save()

    console.log("PDF generated, size:", pdfBytes.length, "bytes")

    if (pdfBytes.length === 0) {
      throw new Error("Generated PDF is empty")
    }

    // Convert Uint8Array to Buffer for NextResponse
    const pdfBuffer = Buffer.from(pdfBytes)

    // Sanitize filename
    const safeFilename = scan.scan_name.replace(/[^a-z0-9]/gi, '_')

    // ✅ NEW: Save report record to database
    try {
      await supabaseAdmin
        .from("reports")
        .insert({
          scan_id: id,
          report_type: "pdf",
          file_size_bytes: pdfBuffer.length,
          generated_at: new Date().toISOString(),
        })
      console.log("✅ Report record saved to database")
    } catch (dbError) {
      console.warn("⚠️ Failed to save report record:", dbError)
      // Continue anyway - PDF generation is more important
    }

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}-report.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("PDF Export Error:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate PDF", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}