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

export function Logo({ size = "md", animated = true, className }: LogoProps) {
  const sizes = {
    sm: { 
      container: "gap-2.5",
      icon: "w-7 h-7",
      text: "text-lg"
    },
    md: { 
      container: "gap-3",
      icon: "w-9 h-9",
      text: "text-2xl"
    },
    lg: { 
      container: "gap-3.5",
      icon: "w-11 h-11",
      text: "text-3xl"
    },
  }

  const LogoContent = (
    <div className={cn("flex items-center", sizes[size].container, className)}>
      
      {/* 🔥 YOUR NEW LOGO IMAGE */}
      <img 
        src="/icon.png" 
        alt="ProbCheck Logo" 
        className={cn(
          "object-contain rounded-md", // rounded since square logo
          sizes[size].icon
        )}
      />

      {/* TEXT (optional but looks premium) */}
      <span className={cn(
        sizes[size].text,
        "font-bold tracking-tight bg-gradient-to-r from-primary via-cyan to-purple bg-clip-text text-transparent"
      )}>
        ProbCheck
      </span>
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