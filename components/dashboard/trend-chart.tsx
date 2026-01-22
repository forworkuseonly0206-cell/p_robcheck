"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { trendData } from "@/lib/mock-data"

/* ===============================
   TYPES
================================ */

interface Scan {
  created_at: string
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
}

interface TrendPoint {
  month: string
  critical: number
  high: number
  medium: number
  low: number
}

interface TrendChartProps {
  scans?: Scan[]
}

/* ===============================
   HELPERS
================================ */

function groupScansByMonth(scans: Scan[]): TrendPoint[] {
  const map = new Map<string, TrendPoint>()

  for (const scan of scans) {
    const date = new Date(scan.created_at)
    const month = date.toLocaleString("en-US", { month: "short" })

    if (!map.has(month)) {
      map.set(month, {
        month,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      })
    }

    const entry = map.get(month)!
    entry.critical += scan.critical_count || 0
    entry.high += scan.high_count || 0
    entry.medium += scan.medium_count || 0
    entry.low += scan.low_count || 0
  }

  return Array.from(map.values())
}

/* ===============================
   COMPONENT
================================ */

export function TrendChart({ scans = [] }: TrendChartProps) {
  const data =
    scans.length > 0 ? groupScansByMonth(scans) : trendData

  const maxValue = Math.max(
    ...data.flatMap(d => [d.critical, d.high, d.medium, d.low]),
    1
  )

  return (
    <Card className="bg-card/50 border-border p-6">
      <h3 className="text-lg font-semibold font-mono mb-6">
        Vulnerability Trend
      </h3>

      <div className="space-y-4">
        <div className="flex items-end gap-2 h-40">
          {data.map((item, index) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col gap-0.5">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.critical / maxValue) * 100}%` }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full bg-destructive/80 rounded-t min-h-0.5"
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.high / maxValue) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.1 }}
                  className="w-full bg-chart-4/80 min-h-0.5"
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.medium / maxValue) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="w-full bg-accent/80 min-h-0.5"
                />
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(item.low / maxValue) * 100}%` }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="w-full bg-muted-foreground/50 rounded-b min-h-0.5"
                />
              </div>

              <span className="text-xs text-muted-foreground mt-2">
                {item.month}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border">
          <Legend label="Critical" color="bg-destructive" />
          <Legend label="High" color="bg-chart-4" />
          <Legend label="Medium" color="bg-accent" />
          <Legend label="Low" color="bg-muted-foreground/50" />
        </div>
      </div>
    </Card>
  )
}

/* ===============================
   LEGEND
================================ */

function Legend({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded ${color}`} />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
