// components/dashboard/recent-scans-table.tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExternalLink, AlertCircle } from "lucide-react"

interface RecentScansTableProps {
  scans: any[]
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-destructive/10 text-destructive border-destructive/20"
    case "high":
      return "bg-chart-4/10 text-chart-4 border-chart-4/20"
    case "medium":
      return "bg-accent/10 text-accent border-accent/20"
    case "low":
      return "bg-muted text-muted-foreground border-white/5"
    default:
      return "bg-muted text-muted-foreground border-white/5"
  }
}

export function RecentScansTable({ scans }: RecentScansTableProps) {
  // Show only last 5 scans
  const recentScans = scans.slice(0, 5)

  if (recentScans.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No scans yet</h3>
        <p className="text-muted-foreground mb-6">
          Upload your first project to start scanning for vulnerabilities
        </p>
        <Button onClick={() => window.location.href = '/scan'}>
          Start Your First Scan
        </Button>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h3 className="text-lg font-semibold">Recent Scans</h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Project</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Summary</TableHead>
              <TableHead className="text-muted-foreground text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentScans.map((scan, index) => (
              <motion.tr
                key={scan.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-white/5 hover:bg-white/2"
              >
                <TableCell className="font-medium">
                  <div>
                    <p>{scan.scan_name}</p>
                    <p className="text-xs text-muted-foreground">{scan.repository_name}</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(scan.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={
                      scan.status === 'completed' ? 'bg-primary/10 text-primary border-primary/20' :
                      scan.status === 'failed' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                      'bg-accent/10 text-accent border-accent/20'
                    }
                  >
                    {scan.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 flex-wrap">
                    {scan.critical_count > 0 && (
                      <Badge variant="outline" className={getSeverityColor("critical")}>
                        {scan.critical_count} Critical
                      </Badge>
                    )}
                    {scan.high_count > 0 && (
                      <Badge variant="outline" className={getSeverityColor("high")}>
                        {scan.high_count} High
                      </Badge>
                    )}
                    {scan.vulnerabilities_found === 0 && scan.status === 'completed' && (
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        ✓ No Issues
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Link href={`/reports/${scan.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                      disabled={scan.status !== 'completed'}
                    >
                      View <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}