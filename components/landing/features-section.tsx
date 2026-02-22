"use client"

import { motion, useInView } from "framer-motion"
import { Brain, GitBranch, FileText, Lightbulb, Shield, Zap } from "lucide-react"
import { useRef } from "react"

const features = [
  {
    icon: Brain,
    title: "Signal-First Detection",
    description:
      "Static analysis combined with ML-assisted pattern detection, tuned to minimize false positives in real production code.",
  },
  {
    icon: GitBranch,
    title: "Works With Your Workflow",
    description:
      "Scan ZIP uploads or repositories without changing your existing CI, branching, or release process.",
  },
  {
    icon: FileText,
    title: "Readable Reports",
    description:
      "Findings are grouped by exploitability and impact — not just severity labels.",
  },
  {
    icon: Lightbulb,
    title: "Actionable Fixes",
    description:
      "Each issue includes context-aware remediation guidance, not generic advice.",
  },
  {
    icon: Shield,
    title: "Built for Security Teams",
    description:
      "Designed with threat modeling, audit reviews, and stakeholder reporting in mind.",
  },
  {
    icon: Zap,
    title: "Fast by Design",
    description:
      "Optimized scanning pipelines deliver results in seconds, even for large codebases.",
  },
]

export function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="py-20 md:py-24 border-t border-border">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Built for real security work
          </h2>
          <p className="text-muted-foreground mt-4 text-base">
            ProbCheck focuses on clarity, signal quality, and speed — not dashboards that look impressive but say little.
          </p>
        </motion.div>

        {/* Grid */}
        <div
          ref={ref}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              className="group"
            >
              <div className="h-full rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/40 hover:-translate-y-1">
                <feature.icon className="h-5 w-5 text-primary mb-4" />

                <h3 className="text-base font-semibold mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
