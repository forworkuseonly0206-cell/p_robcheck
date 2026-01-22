"use client"

import { useEffect, useState, use } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportHeader } from "@/components/reports/report-header"
import { ReportOverview } from "@/components/reports/report-overview"
import { ReportFindings } from "@/components/reports/report-findings"
import { ReportAttackStory } from "@/components/reports/report-attack-story"
import { LayoutDashboard, Search, GitBranch } from "lucide-react"

interface CompatibleFinding {
  id: string
  title: string
  severity: "critical" | "high" | "medium" | "low"
  description: string
  file: string
  line?: number
  codeSnippet?: string
  recommendation?: string
  cwe?: string | null
  tags: string[]
  suggestedFix?: {
    description?: string
    code?: string
  }
}

interface CompatibleReport {
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
  findings: CompatibleFinding[]
  attackStory: any
}

interface ReportDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { id } = use(params)

  const [report, setReport] = useState<CompatibleReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReport()
  }, [id])

  const loadReport = async () => {
    try {
      const res = await fetch(`/api/reports/${id}`)
      if (!res.ok) {
        setLoading(false)
        return
      }

      const { scan, vulnerabilities } = await res.json()

      const formattedReport: CompatibleReport = {
        scanId: scan.id,
        project: scan.scan_name,
        environment: "Production",
        date: scan.created_at,
        duration: scan.scan_duration_seconds
          ? `${Math.floor(scan.scan_duration_seconds / 60)}m ${scan.scan_duration_seconds % 60}s`
          : "—",

        summary: {
          critical: scan.critical_count || 0,
          high: scan.high_count || 0,
          medium: scan.medium_count || 0,
          low: scan.low_count || 0,
        },

        // ✅ FIX: Map database fields to component fields correctly
        findings: (vulnerabilities || []).map((v: any) => ({
          id: v.id,
          title: v.title || "Untitled Vulnerability",
          severity: v.severity || "low",
          description: v.description || "No description",
          file: v.file_path || "unknown",
          line: v.line_number || undefined,
          codeSnippet: v.code_snippet || undefined,
          recommendation: v.suggested_fix || undefined,
          cwe: v.cwe || null,
          tags: [],
          suggestedFix: {
            description: v.suggested_fix || undefined,
            code: v.code_snippet || undefined,
          },
        })),

        attackStory: null,
      }

      setReport(formattedReport)
      setLoading(false)
    } catch (error) {
      console.error("Error loading report:", error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!report) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-muted-foreground">
          Report not found
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <ReportHeader report={report} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Tabs defaultValue="overview">
            <TabsList className="bg-secondary">
              <TabsTrigger value="overview">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="findings">
                <Search className="mr-2 h-4 w-4" />
                Findings
              </TabsTrigger>
              <TabsTrigger value="attack-story">
                <GitBranch className="mr-2 h-4 w-4" />
                Attack Story
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <ReportOverview report={report} />
            </TabsContent>

            <TabsContent value="findings">
              {/* ✅ FIX: Pass the correct structure to ReportFindings */}
              <ReportFindings 
                findings={(report.findings || []).map(f => ({
                  severity: f.severity,
                  title: f.title,
                  description: f.description,
                  file_path: f.file,
                  code_snippet: f.codeSnippet,
                  suggested_fix: f.suggestedFix?.description,
                  cwe: f.cwe || undefined, // ✅ Convert null to undefined
                  line_number: f.line,
                }))}
              />
            </TabsContent>

            <TabsContent value="attack-story">
              <ReportAttackStory report={report} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}