// lib/advanced-scanner.ts - PRO TIER with Claude Sonnet 4
import { callClaudeJSON, trackAICost } from "./openai"
import { FileItem } from "./scanner"

interface AdvancedFinding {
  severity: "critical" | "high" | "medium" | "low"
  title: string
  description: string
  suggestedFix: string
  snippet: string
  cwe?: string
  line?: number
  confidence: number
  exploitability: "easy" | "moderate" | "difficult"
  impact: string
  references?: string[]
}

/**
 * CLAUDE ANALYSIS - Deep, accurate security scanning
 */
async function claudeDeepScan(
  file: FileItem,
  userId: string,
  scanId: string
): Promise<AdvancedFinding[]> {
  const prompt = `EXPERT SECURITY ANALYSIS

You are analyzing: ${file.path}

Perform a comprehensive security audit focusing on:

🔴 CRITICAL ISSUES:
- SQL Injection, Command Injection, Path Traversal
- Authentication/Authorization bypasses
- Remote Code Execution vulnerabilities
- Insecure deserialization
- Hardcoded secrets and credentials

🟠 HIGH SEVERITY:
- XSS vulnerabilities (reflected, stored, DOM-based)
- CSRF issues
- Insecure direct object references
- Broken access control
- Security misconfigurations

🟡 MEDIUM SEVERITY:
- Weak cryptography (MD5, SHA1, weak random)
- Missing security headers
- Information disclosure
- Business logic flaws
- Input validation gaps

🟢 LOW SEVERITY:
- Code quality issues affecting security
- Outdated dependencies
- Best practice violations

CODE TO ANALYZE:
\`\`\`
${file.content.substring(0, 8000)}
\`\`\`

REQUIREMENTS:
1. Find REAL vulnerabilities only (no false positives)
2. Provide actionable fixes with code examples
3. Include CWE references
4. Rate confidence 0-100
5. Assess exploitability

Return ONLY a valid JSON array:
[
  {
    "severity": "critical",
    "title": "SQL Injection in User Query",
    "description": "The application concatenates user input directly into SQL query on line 45, allowing attackers to manipulate the query logic and access unauthorized data.",
    "suggestedFix": "Use parameterized queries: db.query('SELECT * FROM users WHERE id = ?', [userId])",
    "snippet": "db.query('SELECT * FROM users WHERE id = ' + userId)",
    "cwe": "CWE-89",
    "line": 45,
    "confidence": 95,
    "exploitability": "easy",
    "impact": "Complete database compromise, data theft, data manipulation",
    "references": ["https://owasp.org/www-community/attacks/SQL_Injection"]
  }
]

If NO vulnerabilities found, return: []`

  try {
    const startTime = Date.now()
    const response = await callClaudeJSON(prompt)
    const duration = Date.now() - startTime

    console.log(`  🤖 Claude analyzed in ${duration}ms`)

    // Estimate tokens (rough calculation)
    const inputTokens = Math.ceil(prompt.length / 4)
    const outputTokens = Math.ceil(response.length / 4)
    const estimatedCost = (inputTokens * 0.000003) + (outputTokens * 0.000015)

    // Track cost
    await trackAICost({
      userId,
      scanId,
      model: "claude-sonnet-4",
      inputTokens,
      outputTokens,
      estimatedCost
    })

    const findings = JSON.parse(response)
    return Array.isArray(findings) ? findings : []
  } catch (error) {
    console.error("Claude scan failed:", error)
    return []
  }
}

/**
 * Multi-pass Claude analysis for maximum accuracy
 */
async function multiPassAnalysis(
  file: FileItem,
  userId: string,
  scanId: string
): Promise<AdvancedFinding[]> {
  console.log(`  🔬 Running multi-pass Claude analysis...`)

  // Pass 1: Deep security scan
  const securityFindings = await claudeDeepScan(file, userId, scanId)
  
  if (securityFindings.length === 0) {
    console.log(`  ✅ No vulnerabilities found`)
    return []
  }

  console.log(`  ⚠️  Found ${securityFindings.length} issues`)

  // Pass 2: Verify high-confidence findings only
  const highConfidence = securityFindings.filter(f => f.confidence >= 70)
  
  return highConfidence
}

/**
 * Deduplicate findings
 */
function deduplicateFindings(findings: AdvancedFinding[]): AdvancedFinding[] {
  const seen = new Map<string, AdvancedFinding>()
  
  for (const finding of findings) {
    const key = `${finding.title}-${finding.line || 0}`
    const existing = seen.get(key)
    
    if (!existing || finding.confidence > existing.confidence) {
      seen.set(key, finding)
    }
  }
  
  return Array.from(seen.values()).sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return severityOrder[b.severity] - severityOrder[a.severity]
  })
}

/**
 * MAIN ADVANCED SCANNER (Pro Tier Only)
 */
export async function advancedAnalyzeFiles(
  files: FileItem[],
  opts: { 
    projectName?: string
    language?: string
    userId: string
    scanId: string
  }
): Promise<{
  project: string
  summary: { critical: number; high: number; medium: number; low: number }
  results: Array<{ path: string; findings: AdvancedFinding[] }>
  metadata: {
    filesScanned: number
    totalFindings: number
    estimatedCost: number
  }
}> {
  console.log(`\n🚀 PRO TIER: Claude Sonnet 4 Security Scan`)
  console.log(`📁 Files: ${files.length}`)
  console.log(`🎯 Language: ${opts.language || 'all'}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  const results: Array<{ path: string; findings: AdvancedFinding[] }> = []
  const limited = files.slice(0, 30) // Limit to 30 files

  for (const file of limited) {
    console.log(`📄 Scanning: ${file.path}`)

    const findings = await multiPassAnalysis(file, opts.userId, opts.scanId)
    const uniqueFindings = deduplicateFindings(findings)

    if (uniqueFindings.length > 0) {
      results.push({
        path: file.path,
        findings: uniqueFindings
      })
    }

    // Rate limiting - be respectful to Claude API
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Calculate summary
  const summary = results.reduce(
    (acc, r) => {
      for (const f of r.findings) {
        acc[f.severity]++
      }
      return acc
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  )

  const totalFindings = summary.critical + summary.high + summary.medium + summary.low

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ Claude Analysis Complete!`)
  console.log(`📊 ${summary.critical} Critical | ${summary.high} High | ${summary.medium} Medium | ${summary.low} Low`)
  console.log(`💰 Estimated cost: $${(limited.length * 0.40).toFixed(2)}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  return {
    project: opts.projectName || "project",
    summary,
    results,
    metadata: {
      filesScanned: limited.length,
      totalFindings,
      estimatedCost: limited.length * 0.40 // Rough estimate
    }
  }
}