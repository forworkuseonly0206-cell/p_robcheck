"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Bot, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

const tutorQA = [
  {
    question: "What is SQL injection?",
    answer:
      "SQL injection is a code injection technique that exploits security vulnerabilities in an application's database layer. Attackers insert malicious SQL statements into entry fields, potentially gaining unauthorized access to data, modifying records, or even deleting entire databases. Always use parameterized queries and input validation to prevent it.",
  },
  {
    question: "How do I fix XSS vulnerabilities?",
    answer:
      "Cross-Site Scripting (XSS) can be prevented by: 1) Escaping all user input before rendering it in HTML, 2) Using Content Security Policy headers, 3) Sanitizing HTML with libraries like DOMPurify, 4) Using frameworks that auto-escape by default (React, Vue), and 5) Validating and encoding data on both client and server sides.",
  },
  {
    question: "What is the principle of least privilege?",
    answer:
      "The principle of least privilege means giving users, processes, and systems only the minimum permissions they need to perform their tasks. This limits the potential damage from accidents, errors, or unauthorized use. Apply it to database users, API keys, file permissions, and user roles throughout your application.",
  },
  {
    question: "What are secrets in code?",
    answer:
      "Secrets are sensitive data like API keys, passwords, tokens, and certificates that should never be hardcoded in source code. They can be discovered by attackers through code repositories, logs, or decompiled applications. Use environment variables, secret managers (like Vault or AWS Secrets Manager), and .gitignore to protect them.",
  },
  {
    question: "How does CipherGuard detect vulnerabilities?",
    answer:
      "CipherGuard combines static analysis, pattern matching, and AI-powered code understanding to detect vulnerabilities. It scans your codebase for known vulnerability patterns (OWASP Top 10), analyzes data flow for injection points, checks for hardcoded secrets, and uses machine learning to identify suspicious code patterns that traditional scanners might miss.",
  },
]

export function AiTutor() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null)

  return (
    <>
      {/* Floating Button - Premium design */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground glow-md group"
          size="icon"
        >
          <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
          <span className="sr-only">Open AI Security Tutor</span>
        </Button>
      </motion.div>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Panel - Glass design */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md glass border-l border-white/5 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 glow-sm">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">AI Security Tutor</h2>
                    <p className="text-xs text-muted-foreground">Learn about security concepts</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="h-[calc(100%-5rem)]">
                <div className="p-5">
                  <p className="mb-6 text-sm text-muted-foreground">
                    Select a topic to learn more about security concepts:
                  </p>

                  <div className="space-y-4">
                    {tutorQA.map((item, index) => (
                      <div key={index}>
                        {/* Question Button */}
                        <button
                          onClick={() => setSelectedQuestion(selectedQuestion === index ? null : index)}
                          className="flex w-full items-center gap-3 rounded-xl glass-card p-4 text-left transition-all hover:glow-sm"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-sm font-medium text-foreground">{item.question}</span>
                        </button>

                        {/* Answer */}
                        <AnimatePresence>
                          {selectedQuestion === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                                  <Bot className="h-4 w-4 text-primary" />
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {/* Footer Note */}
                  <div className="mt-8 rounded-xl glass-card p-4">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-primary">Coming Soon:</span> Full conversational AI with
                      interactive security learning and personalized recommendations.
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
