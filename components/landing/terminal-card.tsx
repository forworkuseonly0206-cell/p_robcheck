// components/landing/terminal-card.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { scanLogLines } from "@/lib/mock-data"

export function TerminalCard() {
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [typingText, setTypingText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    scanLogLines.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(index + 1)
        
        // Add typing effect for current line
        setIsTyping(true)
        let charIndex = 0
        const typingTimer = setInterval(() => {
          if (charIndex <= line.text.length) {
            setTypingText(line.text.slice(0, charIndex))
            charIndex++
          } else {
            clearInterval(typingTimer)
            setIsTyping(false)
          }
        }, 30)
        timers.push(setTimeout(() => clearInterval(typingTimer), line.text.length * 30 + 100))
      }, line.delay)
      timers.push(timer)
    })

    const resetTimer = setTimeout(() => {
      setVisibleLines(0)
      setTypingText("")
    }, 8500)
    timers.push(resetTimer)

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [visibleLines === 0])

  return (
    <motion.div 
      className="glass-card rounded-2xl overflow-hidden shadow-2xl border-white/10 hover:border-white/20 transition-all duration-500"
      whileHover={{ scale: 1.01, boxShadow: "0 20px 40px rgba(16, 185, 129, 0.1)" }}
    >
      {/* Terminal header with glassmorphism */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-linear-to-r from-white/5 to-transparent backdrop-blur-sm">
        <div className="flex gap-2">
          {[
            { color: "bg-red-500/80", hover: "group-hover:bg-red-500" },
            { color: "bg-yellow-500/80", hover: "group-hover:bg-yellow-500" },
            { color: "bg-green-500/80", hover: "group-hover:bg-green-500" }
          ].map((dot, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full ${dot.color} group cursor-pointer transition-all duration-300`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
        <div className="flex-1 text-center">
          <motion.span 
            className="text-xs font-mono text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            ProbCheck scan --deep
          </motion.span>
        </div>
        <div className="w-16 flex justify-end">
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              opacity: [1, 0.5, 1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </div>

      {/* Terminal content with enhanced styling */}
      <div className="p-6 font-mono text-sm space-y-2.5 h-80 overflow-hidden bg-black/30 backdrop-blur-sm relative">
        {/* Scanline effect */}
        <motion.div
          className="absolute inset-0 bg-linear-to-b from-transparent via-primary/5 to-transparent pointer-events-none"
          animate={{ y: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        <AnimatePresence mode="sync">
          {scanLogLines.slice(0, visibleLines).map((line, index) => {
            const isLastLine = index === visibleLines - 1
            const displayText = isLastLine && isTyping ? typingText : line.text

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex items-start gap-2 relative group ${
                  line.text.includes("critical") || line.text.includes("high")
                    ? "text-red-400"
                    : line.text.includes("complete") || line.text.includes("✓")
                      ? "text-primary"
                      : line.text.includes("medium")
                        ? "text-yellow-400"
                        : "text-muted-foreground"
                }`}
              >
                {/* Line number */}
                <span className="text-muted-foreground/30 select-none text-xs w-4 text-right">
                  {index + 1}
                </span>

                {/* Prompt symbol */}
                <motion.span 
                  className="text-primary/70 select-none"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  $
                </motion.span>

                {/* Line content */}
                <span className="flex-1">
                  {displayText}
                  {isLastLine && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="inline-block w-2 h-4 bg-primary/80 ml-1 align-middle"
                    />
                  )}
                </span>

                {/* Hover effect line highlight */}
                <motion.div
                  className="absolute -left-2 top-0 bottom-0 w-0.5 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId={`line-${index}`}
                />
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Empty state */}
        {visibleLines === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground/50 flex items-center gap-2"
          >
            <span>Initializing scanner</span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}