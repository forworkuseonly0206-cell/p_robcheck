"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { BookOpen, Scan, Lock, Rocket, ChevronRight, Terminal, AlertTriangle, Code, GitBranch } from "lucide-react"

const docSections = [
  {
    id: "what-is-ProbCheck",
    title: "What is ProbCheck?",
    icon: BookOpen,
    content: `ProbCheck is an AI-powered vulnerability scanner designed for modern development teams. It analyzes your source code to detect security vulnerabilities, misconfigurations, and potential attack vectors before they reach production.

Unlike traditional static analysis tools that rely solely on pattern matching, ProbCheck uses machine learning models trained on millions of real-world vulnerabilities. This allows it to understand context, reduce false positives, and catch subtle security issues that rule-based scanners miss.

Key capabilities include:
• SQL Injection detection
• Cross-Site Scripting (XSS) identification
• Hardcoded secrets and credential exposure
• Authentication and authorization flaws
• Insecure dependencies
• Configuration vulnerabilities
• And 50+ additional vulnerability categories

ProbCheck integrates seamlessly into your development workflow, supporting file uploads, Git repository connections, and CI/CD pipeline integration (coming soon).`,
  },
  {
    id: "what-we-scan",
    title: "What We Scan For (MVP)",
    icon: Scan,
    content: `In this MVP release, ProbCheck focuses on the most critical and common vulnerability categories:

**Injection Vulnerabilities**
• SQL Injection (SQLi) - Detecting unsanitized database queries
• NoSQL Injection - MongoDB and other NoSQL database issues
• Command Injection - OS command execution vulnerabilities
• LDAP Injection - Directory service exploitation

**Cross-Site Scripting (XSS)**
• Reflected XSS - User input reflected in responses
• Stored XSS - Persistent malicious scripts
• DOM-based XSS - Client-side script manipulation

**Authentication & Session Management**
• Weak password policies
• Insecure session handling
• Missing authentication checks
• Broken access control

**Sensitive Data Exposure**
• Hardcoded API keys and secrets
• Exposed credentials in source code
• Unencrypted sensitive data
• Verbose error messages

**Security Misconfigurations**
• Insecure default configurations
• Missing security headers
• Debug mode enabled in production
• Overly permissive CORS policies

More vulnerability categories are added with each release based on OWASP Top 10 and real-world threat intelligence.`,
  },
  {
    id: "how-to-scan",
    title: "How to Run a Scan",
    icon: Terminal,
    content: `Running a security scan with ProbCheck is simple and takes just a few steps:

**Step 1: Navigate to the Scan Page**
From your dashboard, click "Run Scan" in the sidebar or use the quick action button.

**Step 2: Configure Your Scan**
• Enter a project name to identify this scan
• Select the primary programming language of your codebase
• Choose your source: file upload or repository URL

**Step 3: Upload Code or Connect Repository**
For file upload:
• Prepare your code as a .zip file
• Drag and drop or click to browse
• Supported: up to 100MB archives

For repository connection:
• Paste your GitHub, GitLab, or Bitbucket URL
• Public repositories scan immediately
• Private repos require authentication (coming soon)

**Step 4: Start the Scan**
Click "Run Scan" to begin the analysis. You'll see real-time progress in the terminal view, including:
• Initialization status
• Files being analyzed
• Vulnerabilities as they're discovered
• Completion summary

**Step 5: Review Results**
Once complete, you'll see a summary with severity breakdown. Click "View Full Report" to access:
• Detailed vulnerability descriptions
• Affected files and line numbers
• Code snippets showing the issue
• Suggested fixes you can copy and apply`,
  },
  {
    id: "security-privacy",
    title: "Security & Privacy",
    icon: Lock,
    content: `At ProbCheck, we take the security of your code as seriously as we take finding vulnerabilities in it.

**Data Handling**
• Code is encrypted in transit using TLS 1.3
• Analysis happens in isolated, ephemeral containers
• Source code is automatically deleted after scan completion
• We never store your code long-term
• Scan results are encrypted at rest

**Privacy Commitments**
• We never share your code with third parties
• Your code is never used to train our AI models without explicit consent
• Scan results belong to you and are only accessible by your team
• You can request complete data deletion at any time

**Infrastructure Security**
• Hosted on enterprise-grade cloud infrastructure
• SOC 2 Type II compliance (in progress)
• Regular third-party security audits
• 24/7 security monitoring and incident response

**Access Control**
• Role-based access control for team features
• SSO/SAML support for enterprise customers
• Audit logs for all account activities
• Two-factor authentication available

For security concerns or to report vulnerabilities in our platform, contact security@ProbCheck.ai`,
  },
  {
    id: "roadmap",
    title: "Roadmap & Coming Features",
    icon: Rocket,
    content: `We're constantly improving ProbCheck based on user feedback and emerging security needs. Here's what's coming:

**Q1 2025**
• CI/CD Integration - GitHub Actions, GitLab CI, Jenkins support
• Private Repository Scanning - OAuth integration for private repos
• Team Collaboration - Share reports, assign vulnerabilities, track fixes
• Custom Rules - Define your own vulnerability patterns

**Q2 2025**
• API Access - Programmatic scanning via REST API
• IDE Plugins - VS Code and JetBrains integrations
• Compliance Reports - SOC 2, PCI-DSS, HIPAA mapping
• Dependency Scanning - Known vulnerability detection in packages

**Q3 2025**
• Runtime Analysis - Dynamic application security testing (DAST)
• Container Scanning - Docker image vulnerability detection
• Infrastructure as Code - Terraform, CloudFormation security
• AI-Powered Remediation - Automatic fix generation

**Future Vision**
• Real-time code protection during development
• Attack simulation and penetration testing
• Security posture scoring and benchmarking
• Enterprise on-premise deployment option

Have a feature request? We'd love to hear from you at feedback@ProbCheck.ai`,
  },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState(docSections[0].id)

  const activeDoc = docSections.find((s) => s.id === activeSection)

  return (
    <DashboardLayout>
      <div className="flex gap-10">
        {/* Sidebar Navigation */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block w-64 shrink-0"
        >
          <Card className="bg-card/50 border-border p-5 sticky top-8">
            <h2 className="font-mono font-semibold text-lg mb-5 px-2">Documentation</h2>
            <nav className="space-y-2">
              {docSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{section.title}</span>
                  {activeSection === section.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              ))}
            </nav>
          </Card>
        </motion.aside>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-w-0"
          key={activeSection}
        >
          {/* Mobile Section Selector */}
          <div className="lg:hidden mb-6">
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-2 font-mono text-sm"
            >
              {docSections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </div>

          <Card className="bg-card/50 border-border p-8 md:p-10">
            {activeDoc && (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <activeDoc.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold font-mono">{activeDoc.title}</h1>
                </div>

                <div className="prose prose-invert max-w-none">
                  {activeDoc.content.split("\n\n").map((paragraph, index) => {
                    // Handle headers
                    if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                      return (
                        <h3 key={index} className="text-lg font-semibold font-mono text-foreground mt-8 mb-4">
                          {paragraph.replace(/\*\*/g, "")}
                        </h3>
                      )
                    }

                    // Handle bullet lists
                    if (paragraph.startsWith("•")) {
                      const items = paragraph.split("\n").filter((line) => line.startsWith("•"))
                      return (
                        <ul key={index} className="space-y-3 mb-5">
                          {items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-muted-foreground">
                              <span className="text-primary mt-1">•</span>
                              <span>{item.replace("• ", "")}</span>
                            </li>
                          ))}
                        </ul>
                      )
                    }

                    // Regular paragraphs with bold text
                    const formattedText = paragraph.split("**").map((part, i) =>
                      i % 2 === 1 ? (
                        <strong key={i} className="text-foreground font-semibold">
                          {part}
                        </strong>
                      ) : (
                        part
                      ),
                    )

                    return (
                      <p key={index} className="text-muted-foreground leading-relaxed mb-5">
                        {formattedText}
                      </p>
                    )
                  })}
                </div>
              </>
            )}
          </Card>

          {/* Quick Links - increased gap and margin */}
          <div className="grid md:grid-cols-3 gap-5 mt-10">
            <Card className="bg-card/50 border-border p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-chart-4" />
                <div>
                  <h3 className="font-mono font-medium">OWASP Top 10</h3>
                  <p className="text-sm text-muted-foreground">Learn about common vulnerabilities</p>
                </div>
              </div>
            </Card>
            <Card className="bg-card/50 border-border p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <Code className="h-5 w-5 text-accent" />
                <div>
                  <h3 className="font-mono font-medium">API Reference</h3>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </div>
              </div>
            </Card>
            <Card className="bg-card/50 border-border p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-3">
                <GitBranch className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-mono font-medium">Integrations</h3>
                  <p className="text-sm text-muted-foreground">CI/CD setup guides</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.main>
      </div>
    </DashboardLayout>
  )
}
