"use client"
import { motion } from "framer-motion"

// Original wireframe: one shield outline repeated as shrinking, stacked slices -> contour/3D look.
const SHIELD = "M100 10 L180 40 V120 C180 180 140 215 100 230 C60 215 20 180 20 120 V40 Z"
const SLICES = 16

export function WireShield() {
  return (
    <motion.svg
      viewBox="0 0 200 330" fill="none" stroke="currentColor" strokeWidth={1}
      className="w-full max-w-[230px] text-primary"
      animate={{ y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {Array.from({ length: SLICES }).map((_, i) => {
        const s = 1 - i * 0.04
        return (
          <g key={i} transform={`translate(${100 * (1 - s)} ${120 * (1 - s) + (SLICES - i) * 5}) scale(${s})`}>
            <motion.path
              d={SHIELD} vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 - i * 0.04 }}
              transition={{ delay: i * 0.07, duration: 1.2 }}
            />
          </g>
        )
      })}
    </motion.svg>
  )
}
