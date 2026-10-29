// components/landing/attack-story-section.tsx
"use client"

import { motion, useInView } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { AttackGraph } from "@/components/common/attack-graph"
import { CheckCircle2 } from "lucide-react"
import { useRef } from "react"

const points = [
  "Trace how individual issues combine into a real exploit path",
  "Prioritize fixes based on exploitability, not just severity",
  "Communicate technical risk clearly to non-engineering stakeholders",
]

export function AttackStorySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.25 })

  return (
    <section ref={ref} className="py-20 md:py-24 border-t border-border">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Badge
              variant="outline"
              className="border-border text-muted-foreground"
            >
              Attack Chain Analysis
            </Badge>

            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Understand risk, not just findings
            </h2>

            <p className="text-muted-foreground leading-relaxed">
              Individual vulnerabilities rarely exist in isolation. ProbCheck maps how issues can be chained together
              into realistic attack paths — helping teams focus on what actually matters.
            </p>

            <ul className="space-y-3 pt-2">
              {points.map((point, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -12 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.1 + index * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{point}</span>
                </motion.li>
              ))}
            </ul>

            <p className="text-sm text-muted-foreground pt-4">
              Included automatically in every scan report.
            </p>
          </motion.div>

          {/* Right: Graph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="rounded-xl border border-border bg-card p-4"
          >
            <AttackGraph />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
