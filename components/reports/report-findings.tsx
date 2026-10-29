// components/reports/report-findings.tsx (COMPLETE FILE - replace the old one)
"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  FileCode,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  Shield,
  Zap,
  Terminal,
  ShieldAlert,
} from "lucide-react"

interface Finding {
  severity: string
  title?: string
  description: string
  file_path?: string
  code_snippet?: string
  suggested_fix?: string
  cwe?: string | null
  line_number?: number
}

interface ReportFindingsProps {
  findings: Finding[]
}

const CWE_METRICS: Record<string, { cvss: number; bountyUsd: number }> = {
  "CWE-78": { cvss: 9.8, bountyUsd: 2500 },
  "CWE-94": { cvss: 9.6, bountyUsd: 2500 },
  "CWE-89": { cvss: 9.4, bountyUsd: 2000 },
  "CWE-287": { cvss: 9.1, bountyUsd: 2000 },
  "CWE-502": { cvss: 9.0, bountyUsd: 1800 },
  "CWE-918": { cvss: 8.6, bountyUsd: 1200 },
  "CWE-943": { cvss: 8.5, bountyUsd: 1200 },
  "CWE-22": { cvss: 8.2, bountyUsd: 1000 },
  "CWE-639": { cvss: 8.1, bountyUsd: 1000 },
  "CWE-862": { cvss: 8.0, bountyUsd: 1000 },
  "CWE-798": { cvss: 7.9, bountyUsd: 800 },
  "CWE-611": { cvss: 7.8, bountyUsd: 800 },
  "CWE-77": { cvss: 7.5, bountyUsd: 750 },
  "CWE-1321": { cvss: 7.4, bountyUsd: 700 },
  "CWE-295": { cvss: 7.2, bountyUsd: 500 },
  "CWE-79": { cvss: 6.5, bountyUsd: 400 },
  "CWE-915": { cvss: 6.4, bountyUsd: 400 },
  "CWE-601": { cvss: 6.1, bountyUsd: 250 },
  "CWE-200": { cvss: 5.8, bountyUsd: 250 },
  "CWE-327": { cvss: 5.3, bountyUsd: 150 },
  "CWE-338": { cvss: 3.7, bountyUsd: 100 },
}

function getMetricsForFinding(finding: Finding) {
  if (finding.cwe && CWE_METRICS[finding.cwe]) {
    return CWE_METRICS[finding.cwe]
  }
  const s = (finding.severity || "").toLowerCase()
  if (s.includes("crit")) return { cvss: 9.2, bountyUsd: 2000 }
  if (s.includes("high")) return { cvss: 8.0, bountyUsd: 800 }
  if (s.includes("med")) return { cvss: 5.8, bountyUsd: 250 }
  return { cvss: 3.5, bountyUsd: 100 }
}

function splitDescriptionAndPoc(rawDescription: string): {
  cleanDescription: string
  pocPayload: string | null
} {
  const marker = "\n\n[POC]: "
  const idx = rawDescription.indexOf(marker)
  if (idx === -1) {
    return { cleanDescription: rawDescription, pocPayload: null }
  }
  return {
    cleanDescription: rawDescription.slice(0, idx).trim(),
    pocPayload: rawDescription.slice(idx + marker.length).trim() || null,
  }
}

function splitSuggestedFix(rawFix?: string): {
  fixExplanation: string
  fixCode: string | null
} {
  if (!rawFix) return { fixExplanation: "", fixCode: null }

  const fenceMatch = rawFix.match(/```[\w]*\n([\s\S]*?)```/)
  if (fenceMatch && fenceMatch[1]) {
    const cleanText = rawFix.replace(/```[\w]*\n[\s\S]*?```/, "").trim()
    return {
      fixExplanation: cleanText || "Replace the vulnerable lines with the verified patch below.",
      fixCode: fenceMatch[1].trim(),
    }
  }

  const patterns = [
    /Example:\s*([\s\S]+?)(?:\n\n|$)/i,
    /Use:\s*([\s\S]+?)(?:\n\n|$)/i,
    /`([^`]+)`/,
  ]
  for (const pattern of patterns) {
    const match = rawFix.match(pattern)
    if (match && match[1]) {
      return { fixExplanation: rawFix, fixCode: match[1].trim() }
    }
  }

  return { fixExplanation: rawFix, fixCode: null }
}

export function ReportFindings({ findings }: ReportFindingsProps) {
  const [expandedFindings, setExpandedFindings] = useState<Record<number, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const toggleFinding = (index: number) => {
    setExpandedFindings(prev => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const getSeverityColor = (severity: string) => {
    const s = severity.toLowerCase()
    if (s.includes("crit")) return "bg-red-500/10 text-red-500 border-red-500/20"
    if (s.includes("high")) return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    if (s.includes("med")) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    return "bg-blue-500/10 text-blue-500 border-blue-500/20"
  }

  const getSeverityIcon = (severity: string) => {
    const s = severity.toLowerCase()
    if (s.includes("crit")) return <XCircle className="w-5 h-5" />
    if (s.includes("high")) return <AlertCircle className="w-5 h-5" />
    if (s.includes("med")) return <AlertTriangle className="w-5 h-5" />
    return <Info className="w-5 h-5" />
  }

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const getSeverityPriority = (severity: string) => {
    const s = severity.toLowerCase()
    if (s.includes("crit")) return 4
    if (s.includes("high")) return 3
    if (s.includes("med")) return 2
    return 1
  }

  const sortedFindings = [...findings].sort(
    (a, b) => getSeverityPriority(b.severity) - getSeverityPriority(a.severity)
  )

  const totalBountyRisk = sortedFindings.reduce(
    (sum, f) => sum + getMetricsForFinding(f).bountyUsd,
    0
  )

  const buildAiFixPrompt = (finding: Finding, cleanDesc: string, fixCode: string | null) => {
    return [
      `Fix this ${finding.severity.toUpperCase()} security vulnerability (${finding.cwe || "Security Issue"}) in ${finding.file_path || "the file"}${finding.line_number ? ` at line ${finding.line_number}` : ""}:`,
      `Title: ${finding.title || "Security Vulnerability"}`,
      `Details: ${cleanDesc}`,
      finding.code_snippet ? `\nVulnerable Code:\n\`\`\`\n${finding.code_snippet}\n\`\`\`` : "",
      fixCode ? `\nSuggested Secure Patch:\n\`\`\`\n${fixCode}\n\`\`\`` : "",
      `\nPlease apply a drop-in secure fix without breaking existing functionality.`,
    ]
      .filter(Boolean)
      .join("\n")
  }

  return (
    <div className="space-y-4">
      {sortedFindings.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 font-medium text-amber-300">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>4-Gate Bug Bounty Triage Summary</span>
          </div>
          <span className="font-mono text-xs text-amber-200">
            Estimated Bug Bounty Value at Risk: <strong>${totalBountyRisk.toLocaleString()}</strong>
          </span>
        </div>
      )}

      {sortedFindings.map((finding, index) => {
        const { cleanDescription, pocPayload } = splitDescriptionAndPoc(finding.description || "")
        const { fixExplanation, fixCode } = splitSuggestedFix(finding.suggested_fix)
        const metrics = getMetricsForFinding(finding)

        return (
          <Card
            key={index}
            className={`border-2 ${getSeverityColor(finding.severity)} overflow-hidden hover:shadow-lg transition-all duration-200`}
          >
            {/* Header - Always Visible */}
            <button
              onClick={() => toggleFinding(index)}
              className="w-full p-4 flex items-start gap-4 hover:bg-accent/25 transition-colors text-left"
            >
              <div className="shrink-0 mt-1">
                {getSeverityIcon(finding.severity)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="uppercase text-xs font-semibold">
                    {finding.severity}
                  </Badge>
                  {finding.cwe && (
                    <Badge variant="outline" className="text-xs font-mono">
                      {finding.cwe}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs font-mono">
                    CVSS {metrics.cvss}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-mono border-amber-500/40 text-amber-400">
                    ~${metrics.bountyUsd} Bounty
                  </Badge>
                  {finding.severity.toLowerCase().includes("crit") && (
                    <Badge className="bg-red-500 text-white text-xs">
                      <Zap className="w-3 h-3 mr-1" />
                      Fix Immediately
                    </Badge>
                  )}
                </div>

                <h3 className="font-semibold text-base mb-1">
                  {finding.title || "Security Vulnerability"}
                </h3>

                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <FileCode className="w-4 h-4" />
                  <span className="font-mono truncate">{finding.file_path || "unknown"}</span>
                  {finding.line_number && (
                    <>
                      <span>•</span>
                      <span>Line {finding.line_number}</span>
                    </>
                  )}
                </div>
              </div>

              {expandedFindings[index] ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
            </button>

            {/* Expanded Content */}
            {expandedFindings[index] && (
              <div className="px-4 pb-4 space-y-4 border-t border-border/50">
                {/* Description */}
                <div className="pt-4 flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-[240px]">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      Attack Path & What&apos;s Wrong
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {cleanDescription}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(
                        buildAiFixPrompt(finding, cleanDescription, fixCode),
                        `prompt-${index}`
                      )
                    }}
                    className="h-8 text-xs gap-1.5"
                  >
                    {copiedKey === `prompt-${index}` ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
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

                {/* Exploit PoC */}
                {pocPayload && (
                  <div className="bg-zinc-950 rounded-lg p-3 border border-amber-500/40 shadow-inner">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-amber-400 flex items-center gap-1.5 font-semibold">
                        <Terminal className="w-3.5 h-3.5" />
                        Exploit Proof-of-Concept (PoC):
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(pocPayload, `poc-${index}`)
                        }}
                        className="h-6 text-xs text-amber-300 hover:text-amber-200"
                      >
                        {copiedKey === `poc-${index}` ? "Copied!" : "Copy PoC"}
                      </Button>
                    </div>
                    <code className="text-xs font-mono break-all text-amber-200 block bg-zinc-900 p-2 rounded border border-amber-500/20">
                      {pocPayload}
                    </code>
                  </div>
                )}

                {/* Vulnerable Code with Solid High-Contrast Background */}
                {finding.code_snippet && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        Vulnerable Code {finding.line_number ? `(Line ${finding.line_number})` : ""}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(finding.code_snippet!, `vuln-${index}`)
                        }}
                        className="h-8 text-xs"
                      >
                        {copiedKey === `vuln-${index}` ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="bg-zinc-950 border border-red-500/50 rounded-lg p-4 overflow-x-auto relative group shadow-md">
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-mono font-bold tracking-wide">
                        VULNERABLE
                      </div>
                      <pre className="text-sm font-mono text-red-400 whitespace-pre-wrap leading-relaxed">
                        <code>{finding.code_snippet}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* How to Fix */}
                {(fixExplanation || fixCode) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        How to Fix It
                      </h4>
                    </div>

                    {fixExplanation && (
                      <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-lg p-4 mb-3 relative">
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded font-mono font-bold">
                          SOLUTION
                        </div>
                        <p className="text-sm text-emerald-200 leading-relaxed pr-20">
                          {fixExplanation}
                        </p>
                      </div>
                    )}

                    {fixCode && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Verified Patched Code
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(fixCode, `fix-${index}`)
                            }}
                            className="h-8 text-xs"
                          >
                            {copiedKey === `fix-${index}` ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1" />
                                Copy Patch
                              </>
                            )}
                          </Button>
                        </div>
                        <div className="bg-zinc-950 border border-emerald-500/50 rounded-lg p-4 overflow-x-auto relative shadow-md">
                          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded font-mono font-bold tracking-wide">
                            SECURE ✓
                          </div>
                          <pre className="text-sm font-mono text-emerald-300 whitespace-pre-wrap leading-relaxed">
                            <code>{fixCode}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                  {finding.cwe && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(
                          `https://cwe.mitre.org/data/definitions/${finding.cwe!.replace("CWE-", "")}.html`,
                          "_blank"
                        )
                      }}
                      className="text-xs h-8"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Learn More ({finding.cwe})
                    </Button>
                  )}
                  {finding.title && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        const searchQuery = encodeURIComponent(finding.title!)
                        window.open(
                          `https://www.google.com/search?q=${searchQuery}+security+vulnerability`,
                          "_blank"
                        )
                      }}
                      className="text-xs h-8"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Search Solutions
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        )
      })}

      {/* Summary footer */}
      {findings.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-4">
          Showing {findings.length} verified vulnerabilit{findings.length === 1 ? "y" : "ies"} •{" "}
          {findings.filter(f => f.severity.toLowerCase().includes("crit")).length} critical •{" "}
          {findings.filter(f => f.severity.toLowerCase().includes("high")).length} high •{" "}
          {findings.filter(f => f.severity.toLowerCase().includes("med")).length} medium •{" "}
          {findings.filter(f => f.severity.toLowerCase().includes("low")).length} low
        </div>
      )}
    </div>
  )
}