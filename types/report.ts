// types/report.ts
export interface ReportFinding {
  id: string
  title: string
  severity: "critical" | "high" | "medium" | "low"
  description: string
  file: string
  line?: number
  snippet?: string
  recommendation?: string
  cwe?: string | null
  tags?: string[]
  suggestedFix?: {
    description?: string
    code?: string
  }
}

export interface Report {
  // Core identifiers
  scanId: string
  project: string
  repository?: string

  // Header UI needs these
  environment: string
  date: string
  duration: string

  // Summary
  summary: {
    critical: number
    high: number
    medium: number
    low: number
  }

  // Main content (THIS fixes most errors)
  findings: ReportFinding[]

  // Optional advanced sections
  attackStory?: any

  // Meta (still useful)
  filesScanned?: number
  durationSeconds?: number
}
