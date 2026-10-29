"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Bug, AlertTriangle, KeyRound, Bomb } from "lucide-react"

// Illustrative chips only, not real scan data.
const chips = [
  { icon: Bug, text: "BUG · off-by-one in loop", pos: "left-[6%] top-[14%]" },
  { icon: AlertTriangle, text: "ERR · null pointer", pos: "right-[8%] top-[18%]" },
  { icon: KeyRound, text: "SECRET · exposed token", pos: "left-[10%] bottom-[16%]" },
  { icon: Bomb, text: "WARN · eval() on user input", pos: "right-[6%] bottom-[14%]" },
  { icon: Bug, text: "BUG · race condition", pos: "left-[40%] top-[6%]" },
]

export function StatementBlock() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const opacity = useTransform(scrollYProgress, [0.15, 0.4, 0.7, 0.9], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [60, -60])

  return (
    <section className="px-4 py-16 md:px-6">
      <div ref={ref} className="halftone relative mx-auto flex min-h-[520px] max-w-6xl items-center justify-center overflow-hidden rounded-4xl bg-[#102a0c] p-8">
        {chips.map((c, i) => (
          <motion.div key={c.text} style={{ opacity }}
            animate={{ x: [0, i % 2 ? -26 : 26, 0], y: [0, -20, 0] }}
            transition={{ duration: 8 + i * 1.4, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute ${c.pos} z-10 flex items-center gap-2 rounded-md border border-primary/30 bg-[#0a1808] px-3 py-1.5 font-mono text-[11px] text-primary`}>
            <c.icon className="h-3.5 w-3.5" />{c.text}
          </motion.div>
        ))}
        <motion.h2 style={{ opacity, y }} className="relative z-20 max-w-3xl text-center text-4xl md:text-6xl">
          Every codebase hides bugs, <span className="text-primary">but most of them are hard to see</span> until someone exploits them.
        </motion.h2>
      </div>
    </section>
  )
}