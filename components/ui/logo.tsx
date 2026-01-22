"use client"

import { motion } from "framer-motion"
import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  animated?: boolean
}

export function Logo({ size = "md", showText = true, animated = true }: LogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-lg" },
    md: { icon: 36, text: "text-xl" },
    lg: { icon: 48, text: "text-2xl" },
  }

  const iconSize = sizes[size].icon

  const ShieldIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="relative"
    >
      {/* Outer shield shape with gradient */}
      <defs>
        <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="innerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Main shield */}
      <path
        d="M24 4L6 12V22C6 33.1 13.8 43.4 24 46C34.2 43.4 42 33.1 42 22V12L24 4Z"
        fill="url(#innerGradient)"
        stroke="url(#shieldGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner checkmark/lock symbol */}
      <path
        d="M17 24L22 29L31 19"
        stroke="url(#shieldGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  const content = (
    <div className="flex items-center gap-2.5">
      <motion.div
        whileHover={animated ? { scale: 1.05, rotate: 3 } : undefined}
        whileTap={animated ? { scale: 0.95 } : undefined}
        className="relative"
      >
        <div className="absolute inset-0 blur-lg bg-primary/30 rounded-full" />
        <ShieldIcon />
      </motion.div>
      {showText && (
        <span className={`font-semibold tracking-tight ${sizes[size].text}`}>
          <span className="text-foreground">Cipher</span>
          <span className="text-gradient">Guard</span>
        </span>
      )}
    </div>
  )

  return content
}

export function LogoLink({ size = "md", showText = true }: LogoProps) {
  return (
    <Link href="/" className="flex items-center group">
      <Logo size={size} showText={showText} />
    </Link>
  )
}
