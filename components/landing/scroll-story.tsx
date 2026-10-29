"use client"
import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion"
import { CornerBrackets } from "@/components/ui/corner-brackets"

type P = MotionValue<number>

function Pop({ p, at, out, className = "", drift = false, children }: { p: P; at: number; out?: number; className?: string; drift?: boolean; children: React.ReactNode }) {
  const opacity = useTransform(p, out ? [at, at + 0.05, out - 0.05, out] : [at, at + 0.05], out ? [0, 1, 1, 0] : [0, 1])
  const y = useTransform(p, [at, at + 0.06], [18, 0])
  const scale = useTransform(p, [at, at + 0.06], [0.95, 1])
  
  return (
    <motion.div style={{ opacity, y, scale }} className={`absolute ${className}`}>
      <motion.div animate={drift ? { x: [0, 14, 0], y: [0, -10, 0] } : undefined} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}>
        {children}
      </motion.div>
    </motion.div>
  )
}

const Chip = ({ t, v }: { t: string; v: string }) => (
  <div className="flex items-center gap-3 rounded-md border border-[#c8f56a]/30 bg-[#16220b] px-3 py-2 font-mono text-[11px] text-[#c8f56a]">
    <span className="h-5 w-5 rounded bg-[#c8f56a]/90" /> <span>{t}</span> <span className="opacity-70">{v}</span>
  </div>
)

const Box = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <CornerBrackets className="border border-[#1e2d10]/10 bg-white/80 px-3 py-2 font-mono text-[10px] leading-relaxed text-[#1e2d10]">
    <div className="mb-1 opacity-50">▸ {label}</div>{children}
  </CornerBrackets>
)

export function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null)
  
  // 1. Get the raw scroll progress
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  
  // 2. Wrap it in a physics-based spring to eliminate jitter caused by Lenis conflicts
  const p = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  })

  // Transforms driven by the smoothed spring value
  const panel = useTransform(p, [0.4, 0.56], ["#1e2d10", "rgba(30,45,16,0)"])
  const h1 = useTransform(p, [0.05, 0.12, 0.4, 0.5], [0, 1, 1, 0])
  const h2 = useTransform(p, [0.52, 0.6], [0, 1])
  const h2y = useTransform(p, [0.52, 0.6], [24, 0])

  return (
    <section ref={ref} className="relative h-[360vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center p-4">
        <motion.div style={{ backgroundColor: panel }} className="relative h-full w-full max-w-7xl overflow-hidden rounded-4xl">
          
          {/* Stage 1: dark, drifting data */}
          <Pop p={p} at={0.1} out={0.48} drift className="left-[8%] top-[18%]"><Chip t="BUG · off-by-one" v="loop.ts:88" /></Pop>
          <Pop p={p} at={0.16} out={0.48} drift className="right-[10%] top-[24%]"><Chip t="ERR · null pointer" v="auth.ts:14" /></Pop>
          <Pop p={p} at={0.22} out={0.48} drift className="left-[14%] bottom-[22%]"><Chip t="SECRET · exposed token" v=".env.local" /></Pop>
          <Pop p={p} at={0.28} out={0.48} drift className="right-[8%] bottom-[18%]"><Chip t="WARN · eval(input)" v="api/run.js:7" /></Pop>
          <Pop p={p} at={0.12} out={0.45} className="left-[44%] top-[9%] font-mono text-[9px] uppercase text-[#c8f56a]/40">category: injection · risk: high</Pop>
          <Pop p={p} at={0.2} out={0.45} className="right-[30%] bottom-[10%] font-mono text-[9px] uppercase text-[#c8f56a]/40">file: routes/users.js · line 42</Pop>

          <motion.h2 style={{ opacity: h1 }} className="absolute inset-0 m-auto h-fit max-w-3xl px-6 text-center text-4xl text-white md:text-6xl">
            Codebases change every day, <span className="text-[#c8f56a]">but most security flaws are hard to see</span> until it&apos;s too late.
          </motion.h2>

          {/* Stage 2: light, headline + bracketed data boxes */}
          <motion.h2 style={{ opacity: h2, y: h2y }} className="absolute inset-0 m-auto h-fit max-w-3xl px-6 text-center text-4xl text-[#101a0a] md:text-6xl">
            ProbCheck traces every input to the line where it becomes a risk.
          </motion.h2>
          <Pop p={p} at={0.6} className="left-[5%] top-[12%] w-[270px]"><Box label="CODE">{`db.query(\n  "SELECT * FROM users"\n  + " WHERE id=" + id\n)`}</Box></Pop>
          <Pop p={p} at={0.68} className="right-[6%] top-[14%] w-[200px]"><Box label="FILE">routes/users.js<br />line 42</Box></Pop>
          <Pop p={p} at={0.76} className="left-[8%] bottom-[16%] w-[220px]"><Box label="CATEGORY">Injection<br />input reaches a query</Box></Pop>
          <Pop p={p} at={0.84} className="right-[8%] bottom-[16%]">
            <div className="rounded-xl bg-[#1e2d10] px-5 py-4 text-[#c8f56a]">
              <div className="font-mono text-[10px] opacity-70">FINDING · HIGH</div>
              <div className="mt-1 text-xl font-semibold">SQL injection</div>
              <div className="font-mono text-[10px] opacity-70">fix suggested</div>
            </div>
          </Pop>

        </motion.div>
      </div>
    </section>
  )
}