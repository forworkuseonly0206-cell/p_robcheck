// components/ui/logo.tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  animated?: boolean
  className?: string
}

interface LogoLinkProps extends LogoProps {
  href?: string
}

/**
 * CONCEPT: "The Binary Convergence"
 * 
 * A sophisticated mark where binary paths (representing code execution)
 * converge into a single verified point. The negative space creates
 * a subtle "P" for Prob, while the convergence forms a checkmark.
 * 
 * Why this works:
 * - Shows code execution paths (multiple routes)
 * - Convergence = analysis bringing clarity
 * - Negative space intelligence = thoughtful design
 * - Geometric but organic flow = professional but approachable
 * - The "aha moment" when you see the P
 */
function BinaryConvergenceIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="36" 
      height="36" 
      viewBox="0 0 36 36" 
      fill="none" 
      className={cn("shrink-0", className)}
    >
      {/* Main converging paths - creates P in negative space */}
      <path
        d="M 8 6 Q 8 18 14 18 Q 20 18 20 12 Q 20 6 14 6 Z"
        fill="currentColor"
        className="text-primary"
        opacity="0.9"
      />
      
      {/* Bottom flowing path */}
      <path
        d="M 8 18 L 8 30 L 12 30"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Converging diagonal - creates checkmark effect */}
      <path
        d="M 12 30 L 18 24"
        stroke="currentColor"
        className="text-cyan"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Verification ascent */}
      <path
        d="M 18 24 L 28 10"
        stroke="currentColor"
        className="text-cyan"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Subtle flow indicators (binary paths) */}
      <circle cx="10" cy="12" r="1.5" fill="currentColor" className="text-cyan" opacity="0.4" />
      <circle cx="16" cy="21" r="1.5" fill="currentColor" className="text-cyan" opacity="0.4" />
      <circle cx="24" cy="15" r="1.5" fill="currentColor" className="text-cyan" opacity="0.4" />
    </svg>
  )
}

/**
 * CONCEPT: "The Helix Scan"
 * 
 * A DNA-like double helix that represents:
 * - Code structure (intertwined logic)
 * - Deep analysis (penetrating layers)
 * - Completeness (360° coverage)
 * 
 * The helix wraps around forming a check when viewed from certain angle.
 * Sophisticated, unique, biological precision meets digital analysis.
 */
function HelixScanIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="36" 
      height="36" 
      viewBox="0 0 36 36" 
      fill="none" 
      className={cn("shrink-0", className)}
    >
      {/* Left helix strand */}
      <path
        d="M 12 8 Q 8 12 10 18 Q 12 24 8 28"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Right helix strand - forms check shape */}
      <path
        d="M 18 8 Q 22 12 20 18 Q 18 24 28 14"
        stroke="url(#helix-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Connecting rungs (code connections) */}
      <line x1="12" y1="12" x2="18" y2="12" stroke="currentColor" className="text-primary/30" strokeWidth="1.5" />
      <line x1="10" y1="18" x2="20" y2="18" stroke="currentColor" className="text-cyan/30" strokeWidth="1.5" />
      <line x1="8" y1="24" x2="18" y2="24" stroke="currentColor" className="text-primary/30" strokeWidth="1.5" />
      
      {/* Scan indicator */}
      <circle cx="18" cy="18" r="2" fill="currentColor" className="text-cyan">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      
      <defs>
        <linearGradient id="helix-gradient" x1="18" y1="8" x2="28" y2="14">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * CONCEPT: "The Pulse Wave Check" (PRIMARY RECOMMENDATION)
 * 
 * An elegant waveform (like heartbeat/signal) that flows through
 * code space and resolves into a checkmark - representing:
 * - Active monitoring (pulse/heartbeat)
 * - Signal analysis (waveform)
 * - Health check → verification
 * 
 * The curve is deliberate and mathematical (bezier perfection)
 * NOT random lines - this is intentional flow.
 */
function PulseWaveIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="36" 
      height="36" 
      viewBox="0 0 36 36" 
      fill="none" 
      className={cn("shrink-0", className)}
    >
      {/* Baseline */}
      <line 
        x1="4" 
        y1="24" 
        x2="32" 
        y2="24" 
        stroke="currentColor" 
        className="text-primary/20" 
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      
      {/* The pulse wave flowing into checkmark */}
      <path
        d="M 4 24 L 8 24 Q 10 24 11 20 L 13 12 L 15 28 L 17 22 Q 18 20 20 20 L 28 8"
        stroke="url(#pulse-gradient)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Checkmark resolution (the final verification) */}
      <path
        d="M 16 22 L 18 24 L 22 18"
        stroke="currentColor"
        className="text-cyan"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Subtle scan points */}
      <circle cx="11" cy="20" r="1.5" fill="currentColor" className="text-primary">
        <animate attributeName="r" values="1.5;2;1.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-cyan" opacity="0.6"/>
      
      <defs>
        <linearGradient id="pulse-gradient" x1="4" y1="24" x2="28" y2="8">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * CONCEPT: "The Pathfinder"
 * 
 * Multiple code execution paths finding the optimal route.
 * Shows AI/algorithm intelligence - not random, but calculated.
 * Forms a subtle arrow/check when paths converge.
 */
function PathfinderIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="36" 
      height="36" 
      viewBox="0 0 36 36" 
      fill="none" 
      className={cn("shrink-0", className)}
    >
      {/* Multiple potential paths (code branches) */}
      <path
        d="M 6 28 Q 10 24 10 20 Q 10 16 14 14"
        stroke="currentColor"
        className="text-primary/30"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="3 3"
      />
      
      <path
        d="M 6 28 Q 10 24 14 22 Q 18 20 22 16"
        stroke="currentColor"
        className="text-primary/40"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="3 3"
      />
      
      {/* The optimal path (AI found the best route) */}
      <path
        d="M 6 28 L 14 20 L 18 22 L 30 8"
        stroke="url(#path-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Decision nodes */}
      <circle cx="6" cy="28" r="2.5" fill="currentColor" className="text-primary" />
      <circle cx="14" cy="20" r="2.5" fill="currentColor" className="text-cyan" />
      <circle cx="30" cy="8" r="2.5" fill="currentColor" className="text-purple" />
      
      {/* Checkmark overlay at convergence */}
      <path
        d="M 12 22 L 15 24 L 20 18"
        stroke="currentColor"
        className="text-cyan"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
      />
      
      <defs>
        <linearGradient id="path-gradient" x1="6" y1="28" x2="30" y2="8">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="50%" stopColor="#06b6d4"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * CONCEPT: "The Fractal Check"
 * 
 * A checkmark made of smaller checks - representing:
 * - Multiple layers of verification
 * - Thoroughness (checking the checks)
 * - Recursive analysis
 * - Mathematical precision
 */
function FractalCheckIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="36" 
      height="36" 
      viewBox="0 0 36 36" 
      fill="none" 
      className={cn("shrink-0", className)}
    >
      {/* Large outer checkmark */}
      <path
        d="M 8 18 L 14 24 L 28 8"
        stroke="url(#fractal-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Medium inner checks */}
      <path
        d="M 10 16 L 12 18 L 16 13"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />
      
      <path
        d="M 16 20 L 18 22 L 22 17"
        stroke="currentColor"
        className="text-cyan"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.6"
      />
      
      {/* Tiny verification points */}
      <circle cx="10" cy="16" r="1.5" fill="currentColor" className="text-primary" opacity="0.8"/>
      <circle cx="16" cy="20" r="1.5" fill="currentColor" className="text-cyan" opacity="0.8"/>
      <circle cx="24" cy="12" r="1.5" fill="currentColor" className="text-purple" opacity="0.8"/>
      
      <defs>
        <linearGradient id="fractal-gradient" x1="8" y1="18" x2="28" y2="8">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="50%" stopColor="#06b6d4"/>
          <stop offset="100%" stopColor="#8b5cf6"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * Main Logo - Using Pulse Wave as default (most sophisticated)
 */
export function Logo({ size = "md", animated = true, className }: LogoProps) {
  const sizes = {
    sm: { 
      container: "gap-2.5",
      icon: "w-7 h-7",
      prob: "text-lg",
      check: "text-lg"
    },
    md: { 
      container: "gap-3",
      icon: "w-9 h-9",
      prob: "text-2xl",
      check: "text-2xl"
    },
    lg: { 
      container: "gap-3.5",
      icon: "w-11 h-11",
      prob: "text-3xl",
      check: "text-3xl"
    },
  }

  const LogoContent = (
    <div className={cn("flex items-center", sizes[size].container, className)}>
      <PulseWaveIcon className={sizes[size].icon} />
      
      <div className="inline-flex items-baseline -space-x-0.5">
        <span className={cn(
          sizes[size].prob,
          "font-bold tracking-tight text-foreground"
        )}>
          Prob
        </span>
        
        <span className={cn(
          sizes[size].check,
          "font-bold tracking-tight",
          "bg-gradient-to-r from-primary via-cyan to-purple bg-clip-text text-transparent"
        )}>
          Check
        </span>
      </div>
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {LogoContent}
      </motion.div>
    )
  }

  return LogoContent
}

export function LogoLink({ size = "md", animated = true, href = "/", className }: LogoLinkProps) {
  const LinkContent = (
    <Link 
      href={href} 
      className={cn("flex items-center no-underline group", className)}
    >
      <Logo size={size} animated={false} />
    </Link>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {LinkContent}
      </motion.div>
    )
  }

  return LinkContent
}

// Alternative versions for easy testing

export function LogoWithBinaryConvergence({ size = "md", className }: LogoProps) {
  const sizes = {
    sm: { container: "gap-2.5", icon: "w-7 h-7", text: "text-lg" },
    md: { container: "gap-3", icon: "w-9 h-9", text: "text-2xl" },
    lg: { container: "gap-3.5", icon: "w-11 h-11", text: "text-3xl" },
  }

  return (
    <div className={cn("flex items-center", sizes[size].container, className)}>
      <BinaryConvergenceIcon className={sizes[size].icon} />
      <div className="inline-flex items-baseline -space-x-0.5">
        <span className={cn(sizes[size].text, "font-bold tracking-tight text-foreground")}>Prob</span>
        <span className={cn(sizes[size].text, "font-bold tracking-tight bg-gradient-to-r from-primary via-cyan to-purple bg-clip-text text-transparent")}>Check</span>
      </div>
    </div>
  )
}

export function LogoWithHelix({ size = "md", className }: LogoProps) {
  const sizes = {
    sm: { container: "gap-2.5", icon: "w-7 h-7", text: "text-lg" },
    md: { container: "gap-3", icon: "w-9 h-9", text: "text-2xl" },
    lg: { container: "gap-3.5", icon: "w-11 h-11", text: "text-3xl" },
  }

  return (
    <div className={cn("flex items-center", sizes[size].container, className)}>
      <HelixScanIcon className={sizes[size].icon} />
      <div className="inline-flex items-baseline -space-x-0.5">
        <span className={cn(sizes[size].text, "font-bold tracking-tight text-foreground")}>Prob</span>
        <span className={cn(sizes[size].text, "font-bold tracking-tight bg-gradient-to-r from-primary via-cyan to-purple bg-clip-text text-transparent")}>Check</span>
      </div>
    </div>
  )
}

export function LogoWithPathfinder({ size = "md", className }: LogoProps) {
  const sizes = {
    sm: { container: "gap-2.5", icon: "w-7 h-7", text: "text-lg" },
    md: { container: "gap-3", icon: "w-9 h-9", text: "text-2xl" },
    lg: { container: "gap-3.5", icon: "w-11 h-11", text: "text-3xl" },
  }

  return (
    <div className={cn("flex items-center", sizes[size].container, className)}>
      <PathfinderIcon className={sizes[size].icon} />
      <div className="inline-flex items-baseline -space-x-0.5">
        <span className={cn(sizes[size].text, "font-bold tracking-tight text-foreground")}>Prob</span>
        <span className={cn(sizes[size].text, "font-bold tracking-tight bg-gradient-to-r from-primary via-cyan to-purple bg-clip-text text-transparent")}>Check</span>
      </div>
    </div>
  )
}

export function LogoWithFractal({ size = "md", className }: LogoProps) {
  const sizes = {
    sm: { container: "gap-2.5", icon: "w-7 h-7", text: "text-lg" },
    md: { container: "gap-3", icon: "w-9 h-9", text: "text-2xl" },
    lg: { container: "gap-3.5", icon: "w-11 h-11", text: "text-3xl" },
  }

  return (
    <div className={cn("flex items-center", sizes[size].container, className)}>
      <FractalCheckIcon className={sizes[size].icon} />
      <div className="inline-flex items-baseline -space-x-0.5">
        <span className={cn(sizes[size].text, "font-bold tracking-tight text-foreground")}>Prob</span>
        <span className={cn(sizes[size].text, "font-bold tracking-tight bg-gradient-to-r from-primary via-cyan to-purple bg-clip-text text-transparent")}>Check</span>
      </div>
    </div>
  )
}

export default Logo