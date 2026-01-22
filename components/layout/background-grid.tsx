"use client"

import { motion } from "framer-motion"

export function BackgroundGrid() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Premium gradient orbs - more subtle */}
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan/5 rounded-full blur-[100px]"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Subtle scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/10 to-transparent"
        animate={{
          top: ["-5%", "105%"],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </div>
  )
}
