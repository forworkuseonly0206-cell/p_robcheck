// components/landing/extension-section.tsx (COMPLETE FILE)
// Showcases the VS Code extension on the website without storing extension scan data.
"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { CornerBrackets } from "@/components/ui/corner-brackets"

const points = [
  "Instant local checks as you type—runs 100% on your machine with zero lag.",
  "4-Gate AI Bug Bounty verification on save: filters out false positives and shows the exact Exploit PoC & Estimated Bounty Value ($).",
  "1-Click Lightbulb Quick Fixes right inside VS Code—zero code or scan clutter is ever saved to your website dashboard.",
]

export function ExtensionSection() {
  return (
    <section className="py-20 md:py-24 border-t border-border">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          <CornerBrackets>
            <div className="rounded-2xl bg-secondary p-8 md:p-12">
              <Badge variant="outline" className="mb-4 border-border text-muted-foreground">
                ProbCheck for VS Code &middot; Live AI Bug Bounty
              </Badge>
              <h2 className="text-3xl md:text-4xl mb-4">
                Your personal AI Bug Bounty Hunter—live while you code
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                Traditional bug bounties take weeks and cost thousands of dollars. ProbCheck for VS Code catches exploitable security holes as you write code, verifies them through a 4-Gate AI Triage engine, and lets you patch them in one click.
              </p>
              <ul className="space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CornerBrackets>
        </motion.div>
      </div>
    </section>
  )
}