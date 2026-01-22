"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { detailedScanLogs } from "@/lib/mock-data"

interface ScanTerminalProps {
  isScanning: boolean
}

function getLogColor(type: string) {
  switch (type) {
    case "critical":
      return "text-destructive"
    case "high":
      return "text-chart-4"
    case "warning":
      return "text-chart-4"
    case "medium":
      return "text-accent"
    case "success":
      return "text-primary"
    default:
      return "text-muted-foreground"
  }
}

export function ScanTerminal({ isScanning }: ScanTerminalProps) {
  const [visibleLogs, setVisibleLogs] = useState<typeof detailedScanLogs>([])
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isScanning) {
      setVisibleLogs([])
      return
    }

    const timers: NodeJS.Timeout[] = []

    detailedScanLogs.forEach((log) => {
      const timer = setTimeout(() => {
        setVisibleLogs((prev) => [...prev, log])

        // Auto-scroll
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight
        }
      }, log.delay)

      timers.push(timer)
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [isScanning])

  return (
    <Card className="bg-card/80 border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/80" />
          <div className="w-3 h-3 rounded-full bg-chart-4/80" />
          <div className="w-3 h-3 rounded-full bg-primary/80" />
        </div>
        <span className="text-xs font-mono text-muted-foreground ml-2">
          cipherguard --scan --verbose
        </span>
      </div>

      <div
        ref={terminalRef}
        className="p-5 font-mono text-sm space-y-2 h-[400px] overflow-y-auto"
      >
        {!isScanning && visibleLogs.length === 0 && (
          <div className="text-muted-foreground">
            <span className="text-primary">$</span> Waiting for scan to start...
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-2 h-4 bg-primary ml-1"
            />
          </div>
        )}

        <AnimatePresence>
          {visibleLogs.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={getLogColor(log.type)}
            >
              {log.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {isScanning && visibleLogs.length > 0 && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="inline-block w-2 h-4 bg-primary"
          />
        )}
      </div>
    </Card>
  )
}
