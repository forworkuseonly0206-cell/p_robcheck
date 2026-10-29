// components/reports/report-header.tsx  (COMPLETE FILE - replace the old one)
"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Download, Mail, Printer, FileJson } from "lucide-react"
import { useState } from "react"
import { authFetch } from "@/lib/auth-fetch"

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
    return { label: "Critical Risk", color: "bg-destructive text-destructive-foreground", pulse: true }
  if (summary.high > 0)
    return { label: "High Risk", color: "bg-orange-500 text-white", pulse: false }
  if (summary.medium > 0)
    return { label: "Medium Risk", color: "bg-yellow-500 text-black", pulse: false }
  if (summary.low > 0)
    return { label: "Low Risk", color: "bg-blue-500 text-white", pulse: false }
  // CHANGED: "Secure" overpromised. A scan can only say what it did not find.
  return { label: "No Issues Detected", color: "bg-green-600 text-white", pulse: false }
}

export function ReportHeader({ report }: ReportHeaderProps) {
  const risk = getOverallRisk(report.summary)
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      // CHANGED: authFetch sends your login token, so only the owner can download the PDF
      const res = await authFetch(`/api/reports/${report.scanId}/export`)

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        alert(`Export failed: ${payload?.error || "please try again"}`)
        return
      }

      const blob = await res.blob()
      if (blob.size === 0) {
        alert("Export failed: PDF is empty")
        return
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${report.project}-security-report.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Export error:", err)
      alert("Failed to export the PDF. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = () => {
    const data = {
      scanId: report.scanId,
      project: report.project,
      environment: report.environment,
      date: report.date,
      duration: report.duration,
      summary: report.summary,
      risk: risk.label
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${report.project}-scan-data.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleEmailReport = () => {
    const subject = encodeURIComponent(`Security Scan Report: ${report.project}`)
    const body = encodeURIComponent(
      `Security Scan Report\n\n` +
      `Project: ${report.project}\n` +
      `Date: ${new Date(report.date).toLocaleDateString()}\n` +
      `Risk Level: ${risk.label}\n\n` +
      `Summary:\n` +
      `- Critical: ${report.summary.critical}\n` +
      `- High: ${report.summary.high}\n` +
      `- Medium: ${report.summary.medium}\n` +
      `- Low: ${report.summary.low}\n\n` +
      `Note: the full report link only opens for the account that ran the scan.`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-mono mb-2">{report.project}</h1>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{report.environment}</Badge>
            <Badge className={`${risk.color} ${risk.pulse ? 'animate-pulse' : ''}`}>
              {risk.label}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              ID: {report.scanId.slice(0, 8)}
            </Badge>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground mt-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(report.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {report.duration}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "PDF"}
            </Button>

            <Button
              variant="outline"
              onClick={handleExportJSON}
              className="flex-1"
            >
              <FileJson className="mr-2 h-4 w-4" />
              JSON
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleEmailReport}
              className="flex-1"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>

            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex-1"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {report.summary.critical > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-950/30 border-2 border-red-500 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="bg-red-500 rounded-full p-2">
              <Download className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-500 mb-1">
                Critical Vulnerabilities Detected
              </h3>
              <p className="text-sm text-muted-foreground">
                This scan found {report.summary.critical} critical security issue{report.summary.critical > 1 ? 's' : ''} that require immediate attention.
                These vulnerabilities could lead to complete system compromise.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}