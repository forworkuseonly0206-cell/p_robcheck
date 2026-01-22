"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Download, Share2 } from "lucide-react"
import { useState } from "react"

interface ReportHeaderReport {
  scanId: string
  project: string
  environment: string
  date: string
  duration: string
  summary: {
    critical: number
    high: number
    medium: number
    low: number
  }
}

interface ReportHeaderProps {
  report: ReportHeaderReport
}

function getOverallRisk(summary: ReportHeaderReport["summary"]) {
  if (summary.critical > 0)
    return { label: "Critical", color: "bg-destructive text-destructive-foreground" }
  if (summary.high > 0)
    return { label: "High", color: "bg-chart-4 text-primary-foreground" }
  if (summary.medium > 0)
    return { label: "Medium", color: "bg-accent text-accent-foreground" }
  return { label: "Low", color: "bg-muted text-muted-foreground" }
}

export function ReportHeader({ report }: ReportHeaderProps) {
  const risk = getOverallRisk(report.summary)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      console.log("Requesting PDF export for scan:", report.scanId)
      
      const res = await fetch(`/api/reports/${report.scanId}/export`)
      
      console.log("Response status:", res.status)
      console.log("Response headers:", Object.fromEntries(res.headers.entries()))
      
      if (!res.ok) {
        const errorText = await res.text()
        console.error("Server error:", errorText)
        alert(`Export failed: ${errorText}`)
        return
      }

      const contentType = res.headers.get("content-type")
      if (!contentType?.includes("application/pdf")) {
        console.error("Unexpected content type:", contentType)
        const text = await res.text()
        console.error("Response body:", text)
        alert(`Export failed: Server returned ${contentType} instead of PDF`)
        return
      }

      const blob = await res.blob()
      console.log("PDF blob size:", blob.size)

      if (blob.size === 0) {
        alert("Export failed: PDF is empty")
        return
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${report.project}-report.pdf`
      document.body.appendChild(a)
      a.click()

      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      console.log("PDF download triggered successfully")
    } catch (err) {
      console.error("Export error:", err)
      alert(`Failed to export PDF: ${err}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono">{report.project}</h1>

          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{report.environment}</Badge>
            <Badge className={risk.color}>{risk.label} Risk</Badge>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(report.date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {report.duration}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>

          <Button variant="outline" disabled>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  )
}