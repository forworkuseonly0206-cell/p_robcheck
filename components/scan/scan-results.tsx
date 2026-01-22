// components/scan/scan-results.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  XCircle,
  Sparkles
} from "lucide-react"

interface ScanResultsProps {
  scanId: string
  report?: {
    project?: string
    summary?: {
      critical?: number
      high?: number
      medium?: number
      low?: number
    }
    results?: Array<{
      path: string
      findings: Array<{
        severity: string
        description: string
        suggestedFix?: string
        snippet?: string
      }>
    }>
  }
  scannerTier?: string
}

export function ScanResults({ scanId, report, scannerTier }: ScanResultsProps) {
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({})

  const summary = {
    critical: report?.summary?.critical ?? 0,
    high: report?.summary?.high ?? 0,
    medium: report?.summary?.medium ?? 0,
    low: report?.summary?.low ?? 0,
  }

  const results = report?.results ?? []
  const total = summary.critical + summary.high + summary.medium + summary.low

  const toggleFileExpansion = (path: string) => {
    setExpandedFiles(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const getSeverityColor = (severity: string) => {
    const s = severity.toLowerCase()
    if (s.includes('crit')) return 'bg-destructive/10 text-destructive border-destructive/20'
    if (s.includes('high')) return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    if (s.includes('med')) return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
  }

  const getSeverityIcon = (severity: string) => {
    const s = severity.toLowerCase()
    if (s.includes('crit')) return <XCircle className="w-5 h-5" />
    if (s.includes('high')) return <AlertCircle className="w-5 h-5" />
    if (s.includes('med')) return <AlertTriangle className="w-5 h-5" />
    return <Info className="w-5 h-5" />
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadReport = () => {
    const reportText = JSON.stringify(report, null, 2)
    const blob = new Blob([reportText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `security-scan-${scanId}.json`
    a.click()
  }

  if (!report) {
    return (
      <Card className="bg-card/50 border-border p-6 text-center">
        <p className="text-muted-foreground">Waiting for scan results…</p>
      </Card>
    )
  }

  if (total === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/50 border-border p-6 text-center space-y-4">
          <CheckCircle className="h-10 w-10 text-primary mx-auto" />
          <h3 className="text-lg font-semibold font-mono">Scan Complete</h3>
          <p className="text-muted-foreground">
            No security vulnerabilities found 🎉
          </p>
          
          {scannerTier && (
            <Badge variant="outline" className="bg-white/5">
              {scannerTier === 'advanced' ? (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Advanced Scan
                </>
              ) : (
                'Basic Scan'
              )}
            </Badge>
          )}

          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">
              Return to Dashboard
            </Button>
          </Link>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <Card className="bg-card/50 border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-mono">Scan Complete</h3>
              <p className="text-sm text-muted-foreground">
                {report.project && `Project: ${report.project} • `}
                {total} vulnerabilities detected
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {scannerTier && (
              <Badge variant="outline" className={scannerTier === 'advanced' ? 'border-primary/30 bg-primary/5 text-primary' : 'bg-white/5'}>
                {scannerTier === 'advanced' ? (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Advanced Scan
                  </>
                ) : (
                  'Basic Scan'
                )}
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadReport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* SUMMARY GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-2" />
            <div className="text-2xl font-bold font-mono text-destructive">
              {summary.critical}
            </div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 text-center">
            <AlertCircle className="h-5 w-5 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold font-mono text-orange-500">
              {summary.high}
            </div>
            <div className="text-sm text-muted-foreground">High</div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold font-mono text-yellow-500">
              {summary.medium}
            </div>
            <div className="text-sm text-muted-foreground">Medium</div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
            <Info className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold font-mono text-blue-500">
              {summary.low}
            </div>
            <div className="text-sm text-muted-foreground">Low</div>
          </div>
        </div>
      </Card>

      {/* DETAILED RESULTS */}
      {results.length > 0 && (
        <Card className="bg-card/50 border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h4 className="font-mono font-semibold text-lg">
              Found {total} issue{total !== 1 ? 's' : ''} in {results.length} file{results.length !== 1 ? 's' : ''}
            </h4>
          </div>

          <div className="divide-y divide-border">
            {results.map((result, idx) => (
              <div key={idx} className="p-6">
                <button
                  onClick={() => toggleFileExpansion(result.path)}
                  className="w-full flex items-center justify-between text-left hover:bg-accent/50 p-3 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-mono text-sm font-semibold">
                        {result.findings.length}
                      </span>
                    </div>
                    <div>
                      <div className="font-mono text-sm text-primary">
                        {result.path}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.findings.length} issue{result.findings.length !== 1 ? 's' : ''} found
                      </div>
                    </div>
                  </div>
                  {expandedFiles[result.path] ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                {expandedFiles[result.path] && (
                  <div className="mt-4 space-y-4 pl-11">
                    {result.findings.map((finding, findingIdx) => (
                      <div
                        key={findingIdx}
                        className={`rounded-lg border p-4 ${getSeverityColor(finding.severity)}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          {getSeverityIcon(finding.severity)}
                          <div className="flex-1">
                            <Badge 
                              variant="outline" 
                              className="mb-2 uppercase text-xs font-semibold"
                            >
                              {finding.severity}
                            </Badge>
                            <p className="font-medium text-sm">
                              {finding.description}
                            </p>
                          </div>
                        </div>

                        {finding.snippet && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-muted-foreground font-mono">
                                Vulnerable Code:
                              </span>
                              <button
                                onClick={() => copyToClipboard(finding.snippet!)}
                                className="text-xs text-muted-foreground hover:text-foreground transition"
                                title="Copy code"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <pre className="bg-black/20 rounded p-3 overflow-x-auto text-xs">
                              <code className="font-mono">{finding.snippet}</code>
                            </pre>
                          </div>
                        )}

                        {finding.suggestedFix && (
                          <div className="bg-black/10 rounded p-3">
                            <div className="text-xs text-muted-foreground mb-1 font-mono">
                              💡 Suggested Fix:
                            </div>
                            <p className="text-sm">{finding.suggestedFix}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ACTION BUTTONS */}
      <Card className="bg-card/50 border-border p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={`/reports/${scanId}`} className="flex-1">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <FileText className="mr-2 h-4 w-4" />
              View Full Report
            </Button>
          </Link>

          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </motion.div>
  )
}