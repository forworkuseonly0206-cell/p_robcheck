// components/scan/scan-results.tsx (COMPLETE FILE - replace the old one)
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
  Check,
  Download,
  XCircle,
  Sparkles,
  Terminal,
  ShieldAlert,
} from "lucide-react"

interface FindingItem {
  severity: string
  title?: string
  description: string
  pocPayload?: string
  estimatedBountyUsd?: number
  cvss?: number
  suggestedFix?: string
  snippet?: string
  cwe?: string
  line?: number
  category?: string
  fix?: {
    startLine: number
    endLine: number
    original: string
    replacement: string
  }
}

interface ScanResultsProps {
  scanId: string
  report?: {
    project?: string
    error?: string
    filesScanned?: number
    warnings?: string[]
    totalEstimatedBountyUsd?: number
    summary?: {
      critical?: number
      high?: number
      medium?: number
      low?: number
    }
    results?: Array<{
      path: string
      findings: FindingItem[]
    }>
  }
  scannerTier?: string
}

function Warnings({ items }: { items: string[] }) {
  return (
    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-left text-sm">
      <div className="font-semibold mb-1">Coverage & Scope Notes</div>
      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
        {items.map((w, i) => <li key={i}>{w}</li>)}
      </ul>
    </div>
  )
}

export function ScanResults({ scanId, report, scannerTier }: ScanResultsProps) {
  const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const summary = {
    critical: report?.summary?.critical ?? 0,
    high: report?.summary?.high ?? 0,
    medium: report?.summary?.medium ?? 0,
    low: report?.summary?.low ?? 0,
  }

  const results = report?.results ?? []
  const total = summary.critical + summary.high + summary.medium + summary.low

  // Calculate total estimated bug bounty triage risk
  const totalBountyUsd =
    report?.totalEstimatedBountyUsd ??
    results.reduce(
      (acc, file) =>
        acc + file.findings.reduce((sum, f) => sum + (f.estimatedBountyUsd || 0), 0),
      0
    )

  const toggleFileExpansion = (path: string) => {
    setExpandedFiles(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const getSeverityColor = (severity: string) => {
    const s = severity.toLowerCase()
    if (s.includes("crit")) return "bg-destructive/10 text-destructive border-destructive/20"
    if (s.includes("high")) return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    if (s.includes("med")) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    return "bg-blue-500/10 text-blue-500 border-blue-500/20"
  }

  const getSeverityIcon = (severity: string) => {
    const s = severity.toLowerCase()
    if (s.includes("crit")) return <XCircle className="w-5 h-5 shrink-0" />
    if (s.includes("high")) return <AlertCircle className="w-5 h-5 shrink-0" />
    if (s.includes("med")) return <AlertTriangle className="w-5 h-5 shrink-0" />
    return <Info className="w-5 h-5 shrink-0" />
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const buildAiFixPrompt = (filePath: string, f: FindingItem) => {
    return [
      `Fix this ${f.severity.toUpperCase()} security vulnerability (${f.cwe || "Security Issue"}) in ${filePath}${f.line ? ` at line ${f.line}` : ""}:`,
      `Title: ${f.title || f.category || "Vulnerability"}`,
      `Details: ${f.description}`,
      f.snippet ? `\nVulnerable Code:\n\`\`\`\n${f.snippet}\n\`\`\`` : "",
      f.fix?.replacement ? `\nSuggested Replacement:\n\`\`\`\n${f.fix.replacement}\n\`\`\`` : "",
      `\nPlease apply a secure fix without breaking existing functionality.`,
    ]
      .filter(Boolean)
      .join("\n")
  }

  const downloadReport = () => {
    const reportText = JSON.stringify(report, null, 2)
    const blob = new Blob([reportText], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `probcheck-scan-${scanId}.json`
    a.click()
  }

  if (!report) {
    return (
      <Card className="bg-card/50 border-border p-6 text-center">
        <p className="text-muted-foreground">Waiting for scan results…</p>
      </Card>
    )
  }

  const didNotFinish = !!report.error || !report.summary

  if (didNotFinish) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/50 border-destructive/30 p-6 text-center space-y-4">
          <XCircle className="h-10 w-10 text-destructive mx-auto" />
          <h3 className="text-lg font-semibold font-mono">Scan did not finish</h3>
          <p className="text-muted-foreground">
            {report.error || "No results were produced for this scan."}
          </p>
          <p className="text-sm text-muted-foreground">
            This does not mean your code is safe. Please try again.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" className="mt-4">
              Return to Dashboard
            </Button>
          </Link>
        </Card>
      </motion.div>
    )
  }

  if (total === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-card/50 border-border p-6 text-center space-y-4">
          <CheckCircle className="h-10 w-10 text-primary mx-auto" />
          <h3 className="text-lg font-semibold font-mono">Scan Complete</h3>
          <p className="text-muted-foreground">
            No vulnerabilities detected
            {typeof report.filesScanned === "number" && ` in ${report.filesScanned} file${report.filesScanned !== 1 ? "s" : ""}`}.
          </p>
          <p className="text-xs text-muted-foreground">
            Automated 4-Gate Bug Bounty Triage checks for proven code-level vulnerabilities. It cannot guarantee that complex business logic is fully secure.
          </p>

          {report.warnings && report.warnings.length > 0 && <Warnings items={report.warnings} />}

          {scannerTier && (
            <Badge variant="outline" className="bg-white/5">
              {scannerTier === "advanced" ? (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Advanced 4-Gate Scan (Claude)
                </>
              ) : (
                "Basic 4-Gate Scan"
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
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold font-mono">4-Gate Bug Bounty Triage Complete</h3>
              <p className="text-sm text-muted-foreground">
                {report.project && `Project: ${report.project} • `}
                {total} verified {total === 1 ? "vulnerability" : "vulnerabilities"} in {report.filesScanned ?? results.length} scanned files
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {totalBountyUsd > 0 && (
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-400 font-mono">
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
                Est. Bounty Risk: ${totalBountyUsd.toLocaleString()}
              </Badge>
            )}

            {scannerTier && (
              <Badge variant="outline" className={scannerTier === "advanced" ? "border-primary/30 bg-primary/5 text-primary" : "bg-white/5"}>
                {scannerTier === "advanced" ? (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Advanced Scan
                  </>
                ) : (
                  "Basic Scan"
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
              Download JSON
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

      {report.warnings && report.warnings.length > 0 && <Warnings items={report.warnings} />}

      {/* DETAILED RESULTS */}
      {results.length > 0 && (
        <Card className="bg-card/50 border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h4 className="font-mono font-semibold text-lg">
              Verified Findings ({total} in {results.length} file{results.length !== 1 ? "s" : ""})
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
                        {result.findings.length} verified issue{result.findings.length !== 1 ? "s" : ""} found
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
                  <div className="mt-4 space-y-4 pl-4 md:pl-11">
                    {result.findings.map((finding, findingIdx) => {
                      const cardKey = `${result.path}-${findingIdx}`
                      return (
                        <div
                          key={findingIdx}
                          className={`rounded-lg border p-4 space-y-3 ${getSeverityColor(finding.severity)}`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="flex items-start gap-3">
                              {getSeverityIcon(finding.severity)}
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <Badge variant="outline" className="uppercase text-xs font-semibold">
                                    {finding.severity}
                                  </Badge>
                                  {finding.cwe && (
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {finding.cwe}
                                    </Badge>
                                  )}
                                  {finding.cvss && (
                                    <Badge variant="outline" className="font-mono text-xs">
                                      CVSS {finding.cvss}
                                    </Badge>
                                  )}
                                  {finding.line && (
                                    <span className="text-xs font-mono text-muted-foreground">
                                      Line {finding.line}
                                    </span>
                                  )}
                                  {finding.estimatedBountyUsd && (
                                    <Badge variant="outline" className="font-mono text-xs border-amber-500/40 text-amber-400">
                                      ~${finding.estimatedBountyUsd} Bounty Value
                                    </Badge>
                                  )}
                                </div>
                                {finding.title && (
                                  <h5 className="font-semibold text-base text-foreground">
                                    {finding.title}
                                  </h5>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(buildAiFixPrompt(result.path, finding), `prompt-${cardKey}`)
                              }
                              className="text-xs h-8 gap-1.5"
                            >
                              {copiedId === `prompt-${cardKey}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  Copied AI Fix Prompt!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  Copy Fix Prompt for AI
                                </>
                              )}
                            </Button>
                          </div>

                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {finding.description}
                          </p>

                          {finding.pocPayload && (
                            <div className="bg-black/30 rounded p-3 border border-border/40">
                              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono mb-1">
                                <Terminal className="w-3.5 h-3.5" />
                                Exploit Proof-of-Concept (PoC):
                              </div>
                              <code className="text-xs font-mono break-all text-foreground">
                                {finding.pocPayload}
                              </code>
                            </div>
                          )}

                          {finding.snippet && (
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs text-muted-foreground font-mono">
                                  Vulnerable Code {finding.line ? `(Line ${finding.line})` : ""}:
                                </span>
                                <button
                                  onClick={() => copyToClipboard(finding.snippet!, `snip-${cardKey}`)}
                                  className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1"
                                >
                                  {copiedId === `snip-${cardKey}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedId === `snip-${cardKey}` ? "Copied" : "Copy"}</span>
                                </button>
                              </div>
                              <pre className="bg-black/25 rounded p-3 overflow-x-auto text-xs text-foreground">
                                <code className="font-mono">{finding.snippet}</code>
                              </pre>
                            </div>
                          )}

                          {(finding.suggestedFix || finding.fix?.replacement) && (
                            <div className="bg-black/15 rounded p-3 space-y-2 border border-primary/20">
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-primary font-mono font-semibold">
                                  🛡️ Verified Fix:
                                </div>
                                {finding.fix?.replacement && (
                                  <button
                                    onClick={() => copyToClipboard(finding.fix!.replacement, `fix-${cardKey}`)}
                                    className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1"
                                  >
                                    {copiedId === `fix-${cardKey}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                    <span>{copiedId === `fix-${cardKey}` ? "Copied Patch" : "Copy Patched Code"}</span>
                                  </button>
                                )}
                              </div>
                              {finding.suggestedFix && (
                                <p className="text-sm text-foreground/90">{finding.suggestedFix}</p>
                              )}
                              {finding.fix?.replacement && (
                                <pre className="bg-black/25 rounded p-3 overflow-x-auto text-xs text-emerald-400">
                                  <code className="font-mono">{finding.fix.replacement}</code>
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
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