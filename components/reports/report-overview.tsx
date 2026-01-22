"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react"

interface ReportOverviewReport {
  summary: {
    critical: number
    high: number
    medium: number
    low: number
  }
  findings: {
    id: string
    title: string
    severity: "critical" | "high" | "medium" | "low"
    file: string
  }[]
  overview?: string
}

interface ReportOverviewProps {
  report: ReportOverviewReport
}

export function ReportOverview({ report }: ReportOverviewProps) {
  const total =
    report.summary.critical +
    report.summary.high +
    report.summary.medium +
    report.summary.low

  // Generate overview based on findings
  const generateOverview = () => {
    if (total === 0) {
      return "No security vulnerabilities were detected in this scan. Your code appears to follow security best practices."
    }

    const parts = []
    if (report.summary.critical > 0) {
      parts.push(`${report.summary.critical} critical issue${report.summary.critical > 1 ? 's' : ''}`)
    }
    if (report.summary.high > 0) {
      parts.push(`${report.summary.high} high severity issue${report.summary.high > 1 ? 's' : ''}`)
    }
    if (report.summary.medium > 0) {
      parts.push(`${report.summary.medium} medium severity issue${report.summary.medium > 1 ? 's' : ''}`)
    }
    if (report.summary.low > 0) {
      parts.push(`${report.summary.low} low severity issue${report.summary.low > 1 ? 's' : ''}`)
    }

    return `This scan identified ${total} security issue${total > 1 ? 's' : ''} across ${report.findings.length} location${report.findings.length > 1 ? 's' : ''}: ${parts.join(', ')}. ${report.summary.critical > 0 ? 'Critical vulnerabilities require immediate attention.' : 'Review and address the identified issues to improve your security posture.'}`
  }

  const overview = report.overview ?? generateOverview()

  return (
    <div className="space-y-6">
      <Card className="bg-card/50 border-border p-6">
        <h3 className="text-lg font-semibold font-mono mb-4">Summary</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {overview}
        </p>

        {/* Severity Distribution */}
        {total > 0 && (
          <div className="space-y-4">
            <h4 className="font-mono font-medium">Severity Distribution</h4>
            <div className="flex h-4 rounded-full overflow-hidden bg-secondary">
              {report.summary.critical > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(report.summary.critical / total) * 100}%`,
                  }}
                  className="bg-destructive"
                  title={`Critical: ${report.summary.critical}`}
                />
              )}

              {report.summary.high > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(report.summary.high / total) * 100}%`,
                  }}
                  transition={{ delay: 0.1 }}
                  className="bg-chart-4"
                  title={`High: ${report.summary.high}`}
                />
              )}

              {report.summary.medium > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(report.summary.medium / total) * 100}%`,
                  }}
                  transition={{ delay: 0.2 }}
                  className="bg-accent"
                  title={`Medium: ${report.summary.medium}`}
                />
              )}

              {report.summary.low > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(report.summary.low / total) * 100}%`,
                  }}
                  transition={{ delay: 0.3 }}
                  className="bg-muted-foreground/50"
                  title={`Low: ${report.summary.low}`}
                />
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm">
                  <span className="font-bold">{report.summary.critical}</span>{" "}
                  Critical
                </span>
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-chart-4" />
                <span className="text-sm">
                  <span className="font-bold">{report.summary.high}</span> High
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-accent" />
                <span className="text-sm">
                  <span className="font-bold">{report.summary.medium}</span>{" "}
                  Medium
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-bold">{report.summary.low}</span> Low
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Top Fixes */}
      {total > 0 && (
        <Card className="bg-card/50 border-border p-6">
          <h3 className="text-lg font-semibold font-mono mb-4">
            Top 3 Recommended Fixes
          </h3>

          <ol className="space-y-4">
            {report.findings
              .filter(
                (f) => f.severity === "critical" || f.severity === "high"
              )
              .slice(0, 3)
              .map((finding, index) => (
                <motion.li
                  key={finding.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-mono font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{finding.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {finding.file}
                    </p>
                  </div>
                </motion.li>
              ))}
          </ol>
        </Card>
      )}
    </div>
  )
}