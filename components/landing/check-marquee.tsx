"use client"
import { motion } from "framer-motion"

// Replaces trusted-by-section.tsx. Confirm this list matches what your scanner really detects.
const checks = ["SQL injection", "Cross-site scripting", "Hardcoded secrets", "Path traversal", "Insecure deserialization", "Broken authentication", "SSRF", "Outdated dependencies"]

export function CheckMarquee() {
  const row = [...checks, ...checks]
  return (
    <section className="overflow-hidden border-b border-border py-10">
      <p className="mono-label mb-6 text-center">[ What ProbCheck looks for ]</p>
      <motion.div
        className="flex w-max gap-12 font-mono text-sm uppercase tracking-wider text-muted-foreground"
        animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {row.map((c, i) => (
          <span key={i} className="whitespace-nowrap"><span className="mr-12 text-primary">+</span>{c}</span>
        ))}
      </motion.div>
    </section>
  )
}