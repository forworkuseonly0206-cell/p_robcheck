// components/reports/report-findings.tsx
// This component shows vulnerable code vs fixed code separately

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
  CheckCircle2
} from "lucide-react"

interface Finding {
  severity: string
  title?: string
  description: string
  file_path?: string
  code_snippet?: string
  suggested_fix?: string
  cwe?: string | null // ✅ Allow null
  line_number?: number
}

interface ReportFindingsProps {
  findings: Finding[]
}

export function ReportFindings({ findings }: ReportFindingsProps) {
  const [expandedFindings, setExpandedFindings] = useState<Record<number, boolean>>({})

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Extract actual fix code from suggested_fix text
  const extractFixCode = (suggestedFix: string) => {
    // Look for code examples in the suggested fix
    const codeMatch = suggestedFix.match(/Example:\s*(.+?)(?:\.|$)/i) || 
                      suggestedFix.match(/Use\s+(.+?)(?:\.|$)/i) ||
                      suggestedFix.match(/`([^`]+)`/)
    
    if (codeMatch && codeMatch[1]) {
      return codeMatch[1].trim()
    }
    
    // If no code found, return a generic message
    return "See suggested fix below for details"
  }

  return (
    <div className="space-y-4">
      {findings.map((finding, index) => (
        <Card 
          key={index}
          className={`border-2 ${getSeverityColor(finding.severity)} overflow-hidden`}
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
              </div>
              
              <h3 className="font-semibold text-base mb-1">
                {finding.title || "Security Vulnerability"}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileCode className="w-4 h-4" />
                <span className="font-mono">{finding.file_path || "unknown"}</span>
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
                <h4 className="text-sm font-semibold mb-2">📋 Description</h4>
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(finding.code_snippet!)
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="bg-red-950/20 border border-red-500/20 rounded-lg p-3 overflow-x-auto">
                    <code className="text-sm font-mono text-red-400">
                      {finding.code_snippet}
                    </code>
                  </pre>
                </div>
              )}

              {/* Fixed Code Example */}
              {finding.suggested_fix && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      How to Fix
                    </h4>
                  </div>
                  
                  {/* Show fix explanation */}
                  <div className="bg-green-950/20 border border-green-500/20 rounded-lg p-3 mb-2">
                    <p className="text-sm text-green-300 leading-relaxed">
                      {finding.suggested_fix}
                    </p>
                  </div>

                  {/* Extract and show code example if available */}
                  {finding.suggested_fix.includes('Example:') && (
                    <pre className="bg-green-950/20 border border-green-500/20 rounded-lg p-3 overflow-x-auto mt-2">
                      <code className="text-sm font-mono text-green-400">
                        {extractFixCode(finding.suggested_fix)}
                      </code>
                    </pre>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (finding.cwe) {
                      window.open(`https://cwe.mitre.org/data/definitions/${finding.cwe.replace('CWE-', '')}.html`, '_blank')
                    }
                  }}
                  disabled={!finding.cwe}
                  className="text-xs"
                >
                  Learn More about {finding.cwe}
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}