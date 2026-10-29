"use client"
import { motion } from "framer-motion"

// Original line-art shapes (viewBox 200x240), drawn as stacked shrinking slices for the contour look.
export const BUG = "M100 70 C140 70 150 120 150 150 C150 200 125 225 100 225 C75 225 50 200 50 150 C50 120 60 70 100 70 Z M80 70 C80 45 120 45 120 70 M88 52 L72 30 M112 52 L128 30 M52 120 L20 105 M50 150 L15 150 M54 185 L22 205 M148 120 L180 105 M150 150 L185 150 M146 185 L178 205 M100 70 V225"
export const KEY = "M65 65 a35 35 0 1 0 70 0 a35 35 0 1 0 -70 0 Z M100 100 V225 M100 175 H138 M100 205 H125"
export const LINK = "M60 70 h45 a28 28 0 0 1 0 56 h-45 a28 28 0 0 1 0 -56 Z M95 126 h45 a28 28 0 0 1 0 56 h-45 a28 28 0 0 1 0 -56 Z"

export function ContourArt({ d, slices = 8, className = "" }: { d: string; slices?: number; className?: string }) {
  return (
    <motion.svg viewBox="0 0 200 260" fill="none" stroke="currentColor" strokeWidth={1} className={`text-primary ${className}`}
      animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
      {Array.from({ length: slices }).map((_, i) => {
        const s = 1 - i * 0.045
        return (
          <g key={i} transform={`translate(${100 * (1 - s)} ${120 * (1 - s) + (slices - i) * 3}) scale(${s})`}>
            <motion.path d={d} vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 1.4 }} style={{ opacity: 1 - i * 0.07 }} />
          </g>
        )
      })}
    </motion.svg>
  )
}