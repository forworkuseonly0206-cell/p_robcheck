// components/dashboard/stats-cards.tsx
"use client"

import { motion } from "framer-motion"
import { Scan, AlertTriangle, FolderOpen, Shield } from "lucide-react"

interface StatsCardsProps {
  scans: any[]
}

export function StatsCards({ scans }: StatsCardsProps) {
  // Calculate real stats from scans
  const totalScans = scans.length
  const criticalIssues = scans.reduce((sum, scan) => sum + (scan.critical_count || 0), 0)
  const projectsMonitored = new Set(scans.map(s => s.repository_name)).size
  const completedScans = scans.filter(s => s.status === 'completed')
  const avgScore = completedScans.length > 0
    ? Math.round(
        (completedScans.reduce((sum, s) => {
          const total = s.vulnerabilities_found || 0
          return sum + (total === 0 ? 100 : Math.max(0, 100 - (total * 5)))
        }, 0) / completedScans.length)
      )
    : 0

  const stats = [
    {
      label: "Total Scans",
      value: totalScans,
      icon: Scan,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Critical Issues",
      value: criticalIssues,
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Projects Monitored",
      value: projectsMonitored,
      icon: FolderOpen,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Security Score",
      value: `${avgScore}%`,
      icon: Shield,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="glass-card rounded-2xl p-5 md:p-6 hover:glow-sm transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`p-2.5 md:p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
