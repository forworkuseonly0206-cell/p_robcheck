// app/reports/page.tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, FileText, Calendar, AlertTriangle, ExternalLink } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { supabase, isSupabaseReady } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import { useRouter } from 'next/navigation'

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-destructive/20 text-destructive border-destructive/30"
    case "high":
      return "bg-chart-4/20 text-chart-4 border-chart-4/30"
    case "medium":
      return "bg-accent/20 text-accent border-accent/30"
    case "low":
      return "bg-muted text-muted-foreground border-border"
    default:
      return "bg-muted text-muted-foreground border-border"
  }
}

export default function ReportsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [scans, setScans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    loadScans()

    return () => {
      isMountedRef.current = false
    }
  }, [])

  // CHANGED: the server works out who you are from your login token (no user id is sent)
  const loadScans = async () => {
    if (!isSupabaseReady() || !supabase) {
      router.push('/')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/')
      return
    }

    try {
      const res = await authFetch('/api/user/scans')

      if (res.status === 401) {
        router.push('/')
        return
      }

      const data = res.ok ? await res.json() : null

      if (isMountedRef.current && data?.scans) {
        setScans(data.scans)
      }
    } catch (error) {
      console.error('❌ Error loading reports:', error)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  const filteredReports = scans.filter((scan) =>
    (scan.scan_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    scan.repository_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold font-mono">Scan Reports</h1>
            <p className="text-muted-foreground">View and manage your vulnerability scan reports.</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border font-mono"
            />
          </div>
        </motion.div>

        {/* Reports Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((scan, index) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 border-border p-6 hover:border-primary/50 transition-colors group h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-mono font-semibold">{scan.scan_name}</h3>
                      <Badge variant="outline" className={
                        scan.status === 'completed' ? 'bg-primary/20 text-primary border-primary/30 text-xs mt-1' :
                        'bg-accent/20 text-accent border-accent/30 text-xs mt-1'
                      }>
                        {scan.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  {new Date(scan.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {scan.scan_duration_seconds && (
                    <>
                      <span className="text-muted-foreground/50">•</span>
                      <span>{Math.floor(scan.scan_duration_seconds / 60)}m {scan.scan_duration_seconds % 60}s</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {scan.critical_count > 0 && (
                    <Badge variant="outline" className={getSeverityColor("critical")}>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {scan.critical_count} Critical
                    </Badge>
                  )}
                  {scan.high_count > 0 && (
                    <Badge variant="outline" className={getSeverityColor("high")}>
                      {scan.high_count} High
                    </Badge>
                  )}
                  {scan.medium_count > 0 && (
                    <Badge variant="outline" className={getSeverityColor("medium")}>
                      {scan.medium_count} Med
                    </Badge>
                  )}
                  {scan.low_count > 0 && (
                    <Badge variant="outline" className={getSeverityColor("low")}>
                      {scan.low_count} Low
                    </Badge>
                  )}
                  {scan.vulnerabilities_found === 0 && scan.status === 'completed' && (
                    <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                      No issues detected
                    </Badge>
                  )}
                </div>

                <div className="mt-auto">
                  <Link href={`/reports/${scan.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-border text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-colors bg-transparent"
                      disabled={scan.status !== 'completed'}
                    >
                      View Report <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <Card className="bg-card/50 border-border p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-mono font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search query." : "Run your first scan to generate a report."}
            </p>
            <Link href="/scan">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Start a Scan</Button>
            </Link>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}