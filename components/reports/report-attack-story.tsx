"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Target, 
  Key, 
  Database, 
  AlertTriangle,
  ArrowRight,
  Skull,
  Server,
  Lock,
  Eye
} from "lucide-react"

interface Finding {
  id: string
  title: string
  severity: "critical" | "high" | "medium" | "low"
  description: string
  file: string
  cwe?: string | null
}

interface ReportAttackStoryProps {
  report: {
    findings: Finding[]
    summary: {
      critical: number
      high: number
      medium: number
      low: number
    }
  }
}

// Attack phase templates based on vulnerability types
const ATTACK_PHASES = {
  sqlInjection: {
    phase: "Initial Access",
    icon: Target,
    color: "text-red-500",
    description: "Attacker exploits SQL injection to bypass authentication and gain unauthorized database access",
    impact: "Direct database access, ability to read/modify/delete data",
    technique: "MITRE ATT&CK: T1190 - Exploit Public-Facing Application"
  },
  xss: {
    phase: "Session Hijacking",
    icon: Eye,
    color: "text-orange-500",
    description: "XSS vulnerability allows attacker to steal session cookies and impersonate legitimate users",
    impact: "Account takeover, user data theft, malicious script injection",
    technique: "MITRE ATT&CK: T1539 - Steal Web Session Cookie"
  },
  hardcodedCreds: {
    phase: "Credential Access",
    icon: Key,
    color: "text-yellow-500",
    description: "Hardcoded credentials discovered in source code provide direct system access",
    impact: "Full administrative access, bypass of all authentication",
    technique: "MITRE ATT&CK: T1552 - Unsecured Credentials"
  },
  commandInjection: {
    phase: "Command Execution",
    icon: Server,
    color: "text-purple-500",
    description: "Command injection allows arbitrary system command execution on the server",
    impact: "Remote code execution, server compromise, lateral movement",
    technique: "MITRE ATT&CK: T1059 - Command and Scripting Interpreter"
  },
  weakCrypto: {
    phase: "Data Decryption",
    icon: Lock,
    color: "text-blue-500",
    description: "Weak cryptography allows attacker to decrypt sensitive data",
    impact: "Exposure of encrypted data, password cracking",
    technique: "MITRE ATT&CK: T1552 - Unsecured Credentials"
  },
  pathTraversal: {
    phase: "File Access",
    icon: Database,
    color: "text-green-500",
    description: "Path traversal vulnerability enables access to sensitive system files",
    impact: "Configuration file exposure, source code theft",
    technique: "MITRE ATT&CK: T1083 - File and Directory Discovery"
  }
}

export function ReportAttackStory({ report }: ReportAttackStoryProps) {
  // Generate attack chain based on actual vulnerabilities
  const generateAttackChain = () => {
    const chain: any[] = []
    const findings = report.findings || []

    // Map vulnerabilities to attack phases
    findings.forEach((finding) => {
      const title = finding.title.toLowerCase()
      
      if (title.includes('sql injection') || title.includes('sql')) {
        chain.push({ ...ATTACK_PHASES.sqlInjection, finding })
      } else if (title.includes('xss') || title.includes('cross-site')) {
        chain.push({ ...ATTACK_PHASES.xss, finding })
      } else if (title.includes('hardcoded') || title.includes('credential')) {
        chain.push({ ...ATTACK_PHASES.hardcodedCreds, finding })
      } else if (title.includes('command injection') || title.includes('exec')) {
        chain.push({ ...ATTACK_PHASES.commandInjection, finding })
      } else if (title.includes('weak') && (title.includes('hash') || title.includes('crypto'))) {
        chain.push({ ...ATTACK_PHASES.weakCrypto, finding })
      } else if (title.includes('path traversal') || title.includes('file')) {
        chain.push({ ...ATTACK_PHASES.pathTraversal, finding })
      }
    })

    // If no specific matches, create generic phases based on severity
    if (chain.length === 0) {
      if (report.summary.critical > 0 || report.summary.high > 0) {
        chain.push({
          phase: "Initial Compromise",
          icon: Target,
          color: "text-red-500",
          description: "Attacker exploits critical vulnerabilities to gain initial system access",
          impact: "Unauthorized access to application resources",
          technique: "MITRE ATT&CK: T1190 - Exploit Public-Facing Application",
          finding: findings[0]
        })
      }
    }

    // Add final phase - Data Exfiltration
    if (chain.length > 0) {
      chain.push({
        phase: "Data Exfiltration",
        icon: Database,
        color: "text-red-600",
        description: "With elevated access, attacker extracts sensitive data from the system",
        impact: "Complete data breach, customer data theft, intellectual property loss",
        technique: "MITRE ATT&CK: T1041 - Exfiltration Over C2 Channel",
        finding: null
      })
    }

    return chain
  }

  const attackChain = generateAttackChain()
  const totalVulns = report.summary.critical + report.summary.high + report.summary.medium + report.summary.low

  if (totalVulns === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-card/50 border-border p-12 text-center">
          <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Attack Vectors Identified</h3>
          <p className="text-muted-foreground">
            No vulnerabilities were found that could be chained into an attack scenario.
            Your application appears well-protected against common attack patterns.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="bg-linear-to-br from-red-950/20 to-orange-950/20 border-red-500/30 p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="h-8 w-8 text-red-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Potential Attack Scenario</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Based on the {totalVulns} vulnerabilities discovered, an attacker could exploit these 
              weaknesses in sequence to compromise your system. Below is a realistic attack chain 
              showing how these vulnerabilities could be weaponized.
            </p>
          </div>
        </div>
      </Card>

      {/* Attack Chain Visualization */}
      <Card className="bg-card/50 border-border p-6">
        <h3 className="text-lg font-semibold font-mono mb-6">Attack Chain Progression</h3>

        <div className="space-y-6">
          {attackChain.map((step, index) => {
            const Icon = step.icon
            const isLast = index === attackChain.length - 1
            
            return (
              <div key={index}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Phase Card */}
                  <div className="flex gap-4">
                    {/* Step Number */}
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full bg-linear-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/50 flex items-center justify-center ${step.color} shrink-0`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-full bg-linear-to-b from-red-500/50 to-transparent min-h-[60px] my-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-semibold text-lg">
                          Step {index + 1}: {step.phase}
                        </h4>
                        {step.finding && (
                          <Badge variant="outline" className="text-xs">
                            {step.finding.severity.toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                        {step.description}
                      </p>

                      {step.finding && (
                        <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 mb-3">
                          <p className="text-xs font-mono text-accent mb-1">
                            Exploited Vulnerability:
                          </p>
                          <p className="text-sm font-medium">{step.finding.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Location: {step.finding.file}
                          </p>
                          {step.finding.cwe && (
                            <p className="text-xs text-muted-foreground">
                              {step.finding.cwe}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="bg-destructive/5 border border-destructive/20 rounded p-3">
                          <p className="font-mono text-xs text-destructive mb-1">
                            💥 Impact
                          </p>
                          <p className="text-xs text-muted-foreground">{step.impact}</p>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded p-3">
                          <p className="font-mono text-xs text-primary mb-1">
                            🎯 Technique
                          </p>
                          <p className="text-xs text-muted-foreground">{step.technique}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Final Impact Assessment */}
      <Card className="bg-linear-to-br from-red-950/30 to-black border-red-500/50 p-6">
        <div className="flex items-start gap-4">
          <Skull className="h-8 w-8 text-red-500 shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-500 mb-3">
              Critical Impact Assessment
            </h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                If this attack chain is successfully executed, the consequences could include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                <li>Complete compromise of application security</li>
                <li>Unauthorized access to sensitive user data</li>
                <li>Potential regulatory compliance violations (GDPR, HIPAA, etc.)</li>
                <li>Reputational damage and loss of customer trust</li>
                <li>Financial losses from data breach response and legal fees</li>
              </ul>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mt-4">
                <p className="text-yellow-500 font-semibold text-xs mb-1">
                  ⚠️ IMMEDIATE ACTION REQUIRED
                </p>
                <p className="text-xs text-muted-foreground">
                  Address {report.summary.critical + report.summary.high} high-priority 
                  vulnerabilities immediately to prevent this attack scenario.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}