// components/landing/hero-section.tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TerminalCard } from "./terminal-card"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-24 md:py-32 border-b border-white/5">
      <div className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT CONTENT */}
          <div className="space-y-8 max-w-xl">
            {/* Quiet trust badge */}
            <Badge
              variant="outline"
              className="w-fit px-3 py-1 text-xs text-muted-foreground border-white/10"
            >
              Trusted by security-conscious engineering teams
            </Badge>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-semibold tracking-tight"
            >
              Understand your security risk
              <br />
              before attackers do.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              ProbCheck analyzes your codebase to identify exploitable vulnerabilities,
              prioritize risk, and guide remediation — without slowing down development.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <Link href="/scan">
                <Button size="lg" className="px-6">
                  Start free scan
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link
                href="/docs"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View documentation
              </Link>
            </motion.div>

            {/* Subtle reassurance */}
            <p className="text-xs text-muted-foreground pt-2">
              No credit card required • Your code stays private
            </p>
          </div>

          {/* RIGHT — TERMINAL (UNCHANGED, BUT CALMER CONTEXT) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="hidden lg:block"
          >
            <TerminalCard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
