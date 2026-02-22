// components/reports/report-findings.tsx - ENHANCED VERSION
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
  Zap
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

export function ReportFindings({ findings }: ReportFindingsProps) {
  const [expandedFindings, setExpandedFindings] = useState<Record<number, boolean>>({})
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const toggleFinding = (index: number) => {
    setExpandedFindings(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const getSeverityColor = (severity: string) => {
    const s = severity.toLowerCase()
    if (s.includes('crit')) return 'bg-red-500/10 text-red-500 border-red-500/20'
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

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // ✅ IMPROVED: Better fix code extraction with multiple patterns
  const extractFixCode = (suggestedFix: string) => {
    // Try multiple patterns to extract code
    const patterns = [
      /```[\w]*\n([\s\S]*?)```/,  // Code in backticks
      /Example:\s*([\s\S]+?)(?:\n\n|$)/i,  // After "Example:"
      /Use:\s*([\s\S]+?)(?:\n\n|$)/i,  // After "Use:"
      /`([^`]+)`/,  // Inline code
      /:\s*(.+?)$/m  // After colon at end of line
    ]

    for (const pattern of patterns) {
      const match = suggestedFix.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    
    return null
  }

  // ✅ NEW: Get severity priority for sorting
  const getSeverityPriority = (severity: string) => {
    const s = severity.toLowerCase()
    if (s.includes('crit')) return 4
    if (s.includes('high')) return 3
    if (s.includes('med')) return 2
    return 1
  }

  // ✅ NEW: Sort findings by severity
  const sortedFindings = [...findings].sort((a, b) => 
    getSeverityPriority(b.severity) - getSeverityPriority(a.severity)
  )

  return (
    <div className="space-y-4">
      {sortedFindings.map((finding, index) => {
        const fixCode = extractFixCode(finding.suggested_fix || '')
        
        return (
          <Card 
            key={index}
            className={`border-2 ${getSeverityColor(finding.severity)} overflow-hidden hover:shadow-lg transition-all duration-200`}
          >
            {/* Header - Always Visible */}
            <button
              onClick={() => toggleFinding(index)}
              className="w-full p-4 flex items-start gap-4 hover:bg-accent/20 transition-colors text-left"
            >
              <div className="shrink-0 mt-1">
                {getSeverityIcon(finding.severity)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className="uppercase text-xs font-semibold"
                  >
                    {finding.severity}
                  </Badge>
                  {finding.cwe && (
                    <Badge variant="outline" className="text-xs">
                      {finding.cwe}
                    </Badge>
                  )}
                  {/* ✅ NEW: Quick impact indicator */}
                  {finding.severity.toLowerCase().includes('crit') && (
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
                <div className="pt-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    What's Wrong
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {finding.description}
                  </p>
                </div>

                {/* Vulnerable Code */}
                {finding.code_snippet && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        Vulnerable Code
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(finding.code_snippet!, index * 2)
                        }}
                        className="h-8 text-xs"
                      >
                        {copiedIndex === index * 2 ? (
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
                    <pre className="bg-red-950/20 border-2 border-red-500/30 rounded-lg p-4 overflow-x-auto relative group">
                      {/* ✅ NEW: Visual indicator */}
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-mono">
                        VULNERABLE
                      </div>
                      <code className="text-sm font-mono text-red-300">
                        {finding.code_snippet}
                      </code>
                    </pre>
                  </div>
                )}

                {/* How to Fix */}
                {finding.suggested_fix && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        How to Fix It
                      </h4>
                    </div>
                    
                    {/* Fix explanation */}
                    <div className="bg-green-950/20 border-2 border-green-500/30 rounded-lg p-4 mb-3 relative">
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-mono">
                        SOLUTION
                      </div>
                      <p className="text-sm text-green-200 leading-relaxed pr-20">
                        {finding.suggested_fix}
                      </p>
                    </div>

                    {/* ✅ IMPROVED: Fixed code example if extractable */}
                    {fixCode && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Fixed Code Example
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(fixCode, index * 2 + 1)
                            }}
                            className="h-8 text-xs"
                          >
                            {copiedIndex === index * 2 + 1 ? (
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
                        <pre className="bg-green-950/20 border-2 border-green-500/30 rounded-lg p-4 overflow-x-auto relative">
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-mono">
                            SECURE ✓
                          </div>
                          <code className="text-sm font-mono text-green-300">
                            {fixCode}
                          </code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ NEW: Action buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                  {finding.cwe && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`https://cwe.mitre.org/data/definitions/${finding.cwe!.replace('CWE-', '')}.html`, '_blank')
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
                        window.open(`https://www.google.com/search?q=${searchQuery}+security+vulnerability`, '_blank')
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
        )}
      )}

      {/* ✅ NEW: Summary footer */}
      {findings.length > 0 && (
        <div className="text-center text-sm text-muted-foreground pt-4">
          Showing {findings.length} vulnerabilit{findings.length === 1 ? 'y' : 'ies'} •{' '}
          {findings.filter(f => f.severity.toLowerCase().includes('crit')).length} critical •{' '}
          {findings.filter(f => f.severity.toLowerCase().includes('high')).length} high •{' '}
          {findings.filter(f => f.severity.toLowerCase().includes('med')).length} medium •{' '}
          {findings.filter(f => f.severity.toLowerCase().includes('low')).length} low
        </div>
      )}
    </div>
  )
}