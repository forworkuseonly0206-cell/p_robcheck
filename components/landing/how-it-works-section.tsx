"use client"

import { motion, useInView } from "framer-motion"
import { Upload, Scan, FileCheck } from "lucide-react"
import { useRef } from "react"

const steps = [
  {
    icon: Upload,
    title: "Submit codebase",
    description:
      "Upload your repository as a ZIP file or connect a source control provider. Your code is processed securely and never stored permanently.",
  },
  {
    icon: Scan,
    title: "Automated security analysis",
    description:
      "CipherGuard analyzes your code using static analysis and AI models trained on real-world vulnerabilities and exploit patterns.",
  },
  {
    icon: FileCheck,
    title: "Actionable report",
    description:
      "Receive a clear vulnerability report with severity, impact context, and recommended remediation steps.",
  },
]

export function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.25 })

  return (
    <section ref={ref} className="py-20 md:py-24 border-t border-border">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            How CipherGuard works
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A straightforward workflow designed for engineering teams. No agents, no configuration,
            no disruption to your development process.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + index * 0.1, duration: 0.4 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-sm text-muted-foreground mt-12 max-w-xl"
        >
          Designed to fit into existing security reviews, CI pipelines, and engineering workflows.
        </motion.p>
      </div>
    </section>
  )
}
