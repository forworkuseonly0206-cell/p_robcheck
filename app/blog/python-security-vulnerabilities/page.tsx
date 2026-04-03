// app/blog/python-security-vulnerabilities/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

export const metadata = {
  title: "Common Python Security Vulnerabilities and How to Fix Them",
  description: "Identify and fix the most common security issues in Python applications. Learn secure coding practices for Python developers.",
  keywords: "python security, secure python code, python vulnerabilities, python best practices, python security issues",
}

export default function BlogPost() {
  return (
    <>
      <BackgroundGrid />
      <Header />
      
      <main className="container px-4 py-20 max-w-4xl">
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <article className="prose prose-invert max-w-none">
          <div className="mb-8">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Python
            </span>
            <h1 className="text-4xl font-bold mt-4 mb-4">
              Common Python Security Vulnerabilities and How to Fix Them
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                March 12, 2025
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                9 min read
              </div>
            </div>
          </div>

          <div className="space-y-6 text-muted-foreground">
            <p className="text-lg">
              Python is one of the most popular programming languages, but even Python applications can have serious security vulnerabilities. This guide covers the most common Python security issues and how to fix them.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">1. Command Injection</h2>
            <p>
              Running shell commands with user input can allow attackers to execute arbitrary commands on your server. Always use subprocess with list arguments instead of shell commands.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">2. SQL Injection</h2>
            <p>
              Never concatenate user input into SQL queries. Use parameterized queries or ORMs like SQLAlchemy to prevent SQL injection attacks.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">3. Code Injection via eval() and exec()</h2>
            <p>
              Never use eval() or exec() with user input. These functions can execute arbitrary code. Use ast.literal_eval for safe evaluation of literals, or better yet, don&apos;t execute user code at all.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">4. Insecure Deserialization (Pickle)</h2>
            <p>
              Python&apos;s pickle module can execute arbitrary code during deserialization. Use JSON instead for untrusted data. If you must use pickle, validate the source with HMAC signatures.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">5. Path Traversal</h2>
            <p>
              Attackers can access files outside the intended directory using path traversal attacks. Always validate and normalize file paths, and check that resolved paths are within the allowed directory.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">6. Insecure Random Number Generation</h2>
            <p>
              Never use random.random() for security-sensitive operations like session tokens or encryption keys. Use the secrets module instead, which provides cryptographically secure random numbers.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">7. Weak Cryptography</h2>
            <p>
              Don&apos;t implement your own crypto or use weak algorithms like MD5. Use bcrypt or Argon2 for password hashing with proper salts and work factors.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">8. XML External Entity (XXE) Injection</h2>
            <p>
              Parsing untrusted XML can allow attackers to read local files. Use defusedxml library instead of standard XML parsers to prevent XXE attacks.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">9. Server-Side Request Forgery (SSRF)</h2>
            <p>
              Validate and restrict URLs before making requests. Whitelist allowed domains and prevent access to internal IPs to avoid SSRF vulnerabilities.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">10. Debug Mode in Production</h2>
            <p>
              Never run Flask or Django in debug mode in production. Debug mode exposes source code and allows code execution. Always set DEBUG=False in production.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Python Security Checklist</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>✅ Never use eval() or exec() with user input</li>
              <li>✅ Use parameterized queries for database operations</li>
              <li>✅ Validate file paths to prevent path traversal</li>
              <li>✅ Use secrets module for security tokens</li>
              <li>✅ Use bcrypt or Argon2 for password hashing</li>
              <li>✅ Avoid pickle for untrusted data</li>
              <li>✅ Disable debug mode in production</li>
              <li>✅ Validate and sanitize all user input</li>
              <li>✅ Use subprocess with list arguments, not shell=True</li>
              <li>✅ Keep dependencies updated with pip-audit</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Useful Security Tools</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Bandit:</strong> Security linter for Python</li>
              <li><strong>pip-audit:</strong> Find vulnerabilities in dependencies</li>
              <li><strong>Safety:</strong> Check dependencies for known issues</li>
              <li><strong>ProbCheck:</strong> AI-powered vulnerability scanner</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Conclusion</h2>
            <p>
              Python&apos;s simplicity can sometimes lead developers to overlook security considerations. By following these best practices and avoiding common pitfalls, you can write more secure Python applications.
            </p>
            <p>
              Remember: Security is not optional. Make it a habit to think about security from the start of your project.
            </p>

            <div className="glass-card p-6 rounded-xl mt-8">
              <h3 className="text-xl font-semibold mb-3">Scan Your Python Code for Vulnerabilities</h3>
              <p className="text-sm mb-4">
                ProbCheck automatically detects command injection, SQL injection, insecure deserialization, and 40+ other Python security issues. Get instant reports.
              </p>
              <Link 
                href="/scan"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Start Free Scan →
              </Link>
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </>
  )
}