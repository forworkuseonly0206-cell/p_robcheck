// lib/scanner.ts - PRODUCTION-READY VERSION
import { callGeminiJSON } from "./openai"

const MAX_SCAN_FILES = parseInt(process.env.MAX_SCAN_FILES || "30")
const MAX_FILE_BYTES = parseInt(process.env.MAX_FILE_BYTES || "50000")

export type FileItem = { path: string; content: string }

/* =====================================
   REAL VULNERABILITY PATTERNS
   These are actual security patterns
===================================== */

interface VulnerabilityPattern {
  id: string
  name: string
  severity: "critical" | "high" | "medium" | "low"
  pattern: RegExp
  languages: string[]
  cwe?: string
  description: string
  fix: string
}

const VULNERABILITY_PATTERNS: VulnerabilityPattern[] = [
  // SQL Injection
  {
    id: "sql-injection-concat",
    name: "SQL Injection via String Concatenation",
    severity: "critical",
    pattern: /(SELECT|INSERT|UPDATE|DELETE|DROP).*?(\+|&|\|\|).*?(req\.|request\.|params\.|query\.|body\.|\$_GET|\$_POST|input\()/i,
    languages: ["javascript", "typescript", "python", "php", "java"],
    cwe: "CWE-89",
    description: "SQL query is constructed using string concatenation with user input, allowing SQL injection attacks",
    fix: "Use parameterized queries or prepared statements. Never concatenate user input into SQL queries."
  },
  {
    id: "sql-injection-format",
    name: "SQL Injection via String Formatting",
    severity: "critical",
    pattern: /(SELECT|INSERT|UPDATE|DELETE).*?(%s|%d|\{|\$\{|f"|f')/i,
    languages: ["python", "php", "javascript", "typescript"],
    cwe: "CWE-89",
    description: "SQL query uses string formatting with potentially unsafe user input",
    fix: "Use parameterized queries with placeholders (?, $1, :param) instead of string formatting."
  },

  // XSS Vulnerabilities
  {
    id: "xss-dangerously-set-html",
    name: "Cross-Site Scripting (XSS) via dangerouslySetInnerHTML",
    severity: "high",
    pattern: /dangerouslySetInnerHTML.*?(\{|=).*?(__html|html).*?:/i,
    languages: ["javascript", "typescript"],
    cwe: "CWE-79",
    description: "Using dangerouslySetInnerHTML without proper sanitization can lead to XSS attacks",
    fix: "Sanitize HTML using DOMPurify before rendering, or avoid dangerouslySetInnerHTML entirely."
  },
  {
    id: "xss-innerhtml",
    name: "XSS via innerHTML",
    severity: "high",
    pattern: /\.innerHTML\s*=\s*[^'"]*?(req\.|params\.|query\.|body\.|input\(|\$_GET|\$_POST)/i,
    languages: ["javascript", "typescript", "php"],
    cwe: "CWE-79",
    description: "Setting innerHTML with user input without sanitization enables XSS attacks",
    fix: "Use textContent for plain text, or sanitize HTML with DOMPurify before using innerHTML."
  },
  {
    id: "xss-eval",
    name: "Code Injection via eval()",
    severity: "critical",
    pattern: /eval\s*\([^)]*?(req\.|params\.|query\.|body\.|input\(|\$_GET|\$_POST)/i,
    languages: ["javascript", "typescript", "python", "php"],
    cwe: "CWE-94",
    description: "Using eval() with user input allows arbitrary code execution",
    fix: "Never use eval() with user input. Use JSON.parse() for data or safer alternatives."
  },

  // Authentication & Authorization
  {
    id: "hardcoded-credentials",
    name: "Hardcoded Credentials",
    severity: "critical",
    pattern: /(password|passwd|pwd|api_key|apikey|secret|token)\s*=\s*["'][^"'\n]{8,}["']/i,
    languages: ["javascript", "typescript", "python", "java", "php", "go", "ruby"],
    cwe: "CWE-798",
    description: "Hardcoded credentials in source code can be extracted by attackers",
    fix: "Use environment variables (.env) for all secrets and credentials. Never commit secrets to version control."
  },
  {
    id: "weak-hash-md5",
    name: "Weak Cryptographic Hash (MD5)",
    severity: "high",
    pattern: /(md5|MD5)\s*\(/i,
    languages: ["javascript", "typescript", "python", "php", "java", "go"],
    cwe: "CWE-327",
    description: "MD5 is cryptographically broken and should not be used for security",
    fix: "Use SHA-256, SHA-3, or bcrypt/argon2 for password hashing."
  },
  {
    id: "weak-hash-sha1",
    name: "Weak Cryptographic Hash (SHA1)",
    severity: "medium",
    pattern: /(sha1|SHA1)\s*\(/i,
    languages: ["javascript", "typescript", "python", "php", "java", "go"],
    cwe: "CWE-327",
    description: "SHA1 is deprecated and vulnerable to collision attacks",
    fix: "Use SHA-256 or stronger hashing algorithms."
  },

  // Path Traversal
  {
    id: "path-traversal",
    name: "Path Traversal Vulnerability",
    severity: "critical",
    pattern: /(readFile|readFileSync|open|fopen|file_get_contents).*?(\+|&|\|\||f"|f').*?(req\.|params\.|query\.|input\(|\$_GET|\$_POST)/i,
    languages: ["javascript", "typescript", "python", "php"],
    cwe: "CWE-22",
    description: "File path constructed from user input without validation allows path traversal attacks",
    fix: "Validate and sanitize file paths. Use path.join() with a safe base directory and reject '..' sequences."
  },

  // Command Injection
  {
    id: "command-injection",
    name: "OS Command Injection",
    severity: "critical",
    pattern: /(exec|system|shell_exec|passthru|popen|spawn|spawnSync)\s*\([^)]*?(req\.|params\.|query\.|body\.|input\(|\$_GET|\$_POST|\$\{)/i,
    languages: ["javascript", "typescript", "python", "php", "ruby"],
    cwe: "CWE-78",
    description: "Executing system commands with user input allows command injection attacks",
    fix: "Avoid executing shell commands with user input. If necessary, use parameterized APIs and validate input strictly."
  },

  // Insecure Deserialization
  {
    id: "unsafe-pickle",
    name: "Insecure Deserialization (pickle)",
    severity: "critical",
    pattern: /pickle\.(loads|load)\s*\(/i,
    languages: ["python"],
    cwe: "CWE-502",
    description: "Deserializing untrusted data with pickle can execute arbitrary code",
    fix: "Use JSON for data serialization. If pickle is required, sign/encrypt data and never deserialize untrusted input."
  },
  {
    id: "unsafe-unserialize",
    name: "Insecure PHP Deserialization",
    severity: "critical",
    pattern: /unserialize\s*\(/i,
    languages: ["php"],
    cwe: "CWE-502",
    description: "PHP unserialize() on untrusted data can lead to remote code execution",
    fix: "Use JSON for data exchange. If serialization is needed, validate data signatures first."
  },

  // Weak Randomness
  {
    id: "weak-random",
    name: "Cryptographically Weak Random Number Generator",
    severity: "medium",
    pattern: /(Math\.random|random\.random|rand\(|mt_rand)\s*\(/i,
    languages: ["javascript", "typescript", "python", "php"],
    cwe: "CWE-338",
    description: "Using predictable random number generators for security-sensitive operations",
    fix: "Use crypto.randomBytes() (Node.js), secrets module (Python), or random_bytes() (PHP) for cryptographic randomness."
  },

  // CSRF
  {
    id: "missing-csrf",
    name: "Missing CSRF Protection",
    severity: "medium",
    pattern: /(app\.post|router\.post|@app\.route.*methods.*POST|Route::post)(?!.*csrf)/i,
    languages: ["javascript", "typescript", "python", "php"],
    cwe: "CWE-352",
    description: "POST endpoint without CSRF token validation is vulnerable to CSRF attacks",
    fix: "Implement CSRF tokens for all state-changing requests. Use middleware like csurf (Express) or built-in framework protection."
  },

  // Insecure Cookies
  {
    id: "insecure-cookie",
    name: "Insecure Cookie Configuration",
    severity: "medium",
    pattern: /setCookie|set-cookie|setcookie(?!.*secure.*httponly)/i,
    languages: ["javascript", "typescript", "php", "python"],
    cwe: "CWE-614",
    description: "Cookies without Secure and HttpOnly flags are vulnerable to theft",
    fix: "Set cookies with Secure, HttpOnly, and SameSite flags: { secure: true, httpOnly: true, sameSite: 'strict' }"
  },

  // Regex DoS
  {
    id: "regex-dos",
    name: "Regular Expression Denial of Service (ReDoS)",
    severity: "medium",
    pattern: /new RegExp\(.*?(\+|\*|\{.*?,).*?(\+|\*|\{.*?,)/i,
    languages: ["javascript", "typescript", "python", "java"],
    cwe: "CWE-400",
    description: "Complex regex patterns with nested quantifiers can cause catastrophic backtracking",
    fix: "Simplify regex patterns, avoid nested quantifiers, or use regex timeout limits."
  },

  // Information Disclosure
  {
    id: "error-stack-trace",
    name: "Stack Trace Exposure",
    severity: "low",
    pattern: /(console\.error|print|echo|log\.error).*?(error\.stack|err\.stack|\$e->getMessage)/i,
    languages: ["javascript", "typescript", "python", "php"],
    cwe: "CWE-209",
    description: "Exposing detailed error messages and stack traces to users reveals system internals",
    fix: "Log errors server-side only. Return generic error messages to users in production."
  },

  // Dependency Issues
  {
    id: "outdated-dependency",
    name: "Potentially Outdated Dependencies",
    severity: "low",
    pattern: /"(react|vue|angular|express|django|flask|rails)":\s*"[~^]?\d+\.\d+\.\d+"/i,
    languages: ["javascript", "typescript"],
    cwe: "CWE-1104",
    description: "Using pinned dependency versions without regular updates may include known vulnerabilities",
    fix: "Regularly run 'npm audit' or 'yarn audit' and update dependencies. Use tools like Dependabot."
  }
]

/* =====================================
   LANGUAGE DETECTION
===================================== */

function detectLanguage(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  const langMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'php': 'php',
    'go': 'go',
    'rs': 'rust',
    'rb': 'ruby',
    'cs': 'csharp',
  }
  return langMap[ext || ''] || 'unknown'
}

/* =====================================
   STATIC ANALYSIS - FIND REAL ISSUES
===================================== */

function performStaticAnalysis(file: FileItem, selectedLanguage?: string): Array<{
  severity: string
  description: string
  suggestedFix: string
  snippet: string
  cwe?: string
  line?: number
}> {
  const detectedLang = detectLanguage(file.path)
  const findings: any[] = []

  // If user selected a language, only scan files matching that language
  if (selectedLanguage && selectedLanguage !== 'javascript' && detectedLang !== selectedLanguage) {
    console.log(`  ⏭️ Skipping ${file.path} (${detectedLang}) - doesn't match selected language (${selectedLanguage})`)
    return []
  }

  const lines = file.content.split('\n')

  for (const pattern of VULNERABILITY_PATTERNS) {
    // Check if pattern applies to this language
    if (!pattern.languages.includes(detectedLang)) continue

    // Search in full content for multi-line patterns
    const matches = file.content.match(pattern.pattern)
    if (matches) {
      // Find line number
      let lineNum = 0
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(pattern.pattern)) {
          lineNum = i + 1
          break
        }
      }

      findings.push({
        severity: pattern.severity,
        description: `${pattern.name}: ${pattern.description}`,
        suggestedFix: pattern.fix,
        snippet: lines[lineNum - 1]?.trim() || matches[0].substring(0, 100),
        cwe: pattern.cwe,
        line: lineNum
      })
    }
  }

  return findings
}

/* =====================================
   AI ENHANCEMENT - ADD CONTEXT
===================================== */

async function enhanceWithAI(
  file: FileItem,
  staticFindings: any[],
  projectName?: string
): Promise<any[]> {
  // If no static findings, optionally do a light AI check
  if (staticFindings.length === 0) {
    return []
  }

  // Let AI provide better explanations and context-specific fixes
  const prompt = `You are a security expert. A static analyzer found these potential issues in ${file.path}:

${staticFindings.map((f, i) => `${i + 1}. ${f.description} (${f.severity})`).join('\n')}

CODE SNIPPET:
\`\`\`
${file.content.substring(0, 3000)}
\`\`\`

For each finding, provide:
1. A clear explanation in plain English
2. A specific fix with example code
3. Why this is important

Return ONLY valid JSON array:
[
  {
    "severity": "critical|high|medium|low",
    "title": "Short title",
    "description": "Clear explanation",
    "suggestedFix": "How to fix with code example",
    "snippet": "The vulnerable line",
    "cwe": "CWE-XXX"
  }
]`

  try {
    const aiResponse = await callGeminiJSON(prompt)
    const parsed = JSON.parse(aiResponse)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn("  ⚠️ AI enhancement failed, using static findings")
    // Return static findings as fallback
    return staticFindings.map(f => ({
      severity: f.severity,
      title: f.description.split(':')[0],
      description: f.description,
      suggestedFix: f.suggestedFix,
      snippet: f.snippet,
      cwe: f.cwe
    }))
  }
}

/* =====================================
   MAIN ANALYSIS FUNCTION
===================================== */

export async function analyzeFiles(
  files: FileItem[],
  opts: { projectName?: string; language?: string } = {}
) {
  const limited = files.slice(0, MAX_SCAN_FILES)
  const results: Array<{
    path: string
    findings: Array<{
      severity: string
      title?: string
      description: string
      suggestedFix?: string
      snippet?: string
      cwe?: string
      line?: number
    }>
  }> = []

  console.log(`\n🔍 Starting Professional Security Scan`)
  console.log(`📁 Files to scan: ${limited.length}`)
  console.log(`🎯 Target language: ${opts.language || 'all languages'}`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  for (const file of limited) {
    let snippet = file.content
    if (snippet.length > MAX_FILE_BYTES) {
      snippet = snippet.slice(0, MAX_FILE_BYTES)
    }

    const detectedLang = detectLanguage(file.path)
    console.log(`📄 Scanning: ${file.path} [${detectedLang}]`)

    // STEP 1: Static Analysis (Real vulnerability detection)
    const staticFindings = performStaticAnalysis(file, opts.language)
    
    if (staticFindings.length === 0) {
      console.log(`  ✅ No issues detected\n`)
      continue
    }

    console.log(`  🔴 Found ${staticFindings.length} potential issue(s)`)

    // STEP 2: AI Enhancement (Better explanations and fixes)
    const enhancedFindings = await enhanceWithAI({ path: file.path, content: snippet }, staticFindings, opts.projectName)

    if (enhancedFindings.length > 0) {
      results.push({
        path: file.path,
        findings: enhancedFindings
      })
      console.log(`  ✨ Enhanced with AI insights\n`)
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  // Calculate summary
  const summary = results.reduce(
    (acc, r) => {
      for (const f of r.findings) {
        const s = (f.severity || '').toLowerCase()
        if (s.includes("crit")) acc.critical++
        else if (s.includes("high")) acc.high++
        else if (s.includes("med")) acc.medium++
        else acc.low++
      }
      return acc
    },
    { critical: 0, high: 0, medium: 0, low: 0 }
  )

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  console.log(`✅ Scan Complete!`)
  console.log(`📊 Found: ${summary.critical} Critical | ${summary.high} High | ${summary.medium} Medium | ${summary.low} Low`)
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)

  return {
    project: opts.projectName || "project",
    summary,
    results,
  }
}