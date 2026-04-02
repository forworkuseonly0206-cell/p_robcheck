// app/blog/how-to-scan-code-for-vulnerabilities/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

export const metadata = {
  title: "How to Scan Your Code for Security Vulnerabilities (Complete Guide)",
  description: "Learn how to scan your code for security bugs using AI-powered vulnerability scanners. Step-by-step tutorial for developers.",
  keywords: "scan code for vulnerabilities, security scanner tutorial, code security, vulnerability detection, static code analysis",
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
              Tutorial
            </span>
            <h1 className="text-4xl font-bold mt-4 mb-4">
              How to Scan Your Code for Security Vulnerabilities (Complete Guide)
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                March 22, 2025
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                12 min read
              </div>
            </div>
          </div>

          <div className="space-y-6 text-muted-foreground">
            <p className="text-lg">
              Security vulnerabilities in code can lead to data breaches, financial losses, and damaged reputation. This guide will show you how to scan your code for vulnerabilities using modern tools and techniques.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Why Scan Your Code?</h2>
            <p>
              Manual code reviews can miss critical security flaws. Automated vulnerability scanners can:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Find security bugs in seconds</li>
              <li>Detect vulnerabilities 24/7</li>
              <li>Check thousands of lines of code instantly</li>
              <li>Identify known CVEs in dependencies</li>
              <li>Save time and reduce human error</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Step 1: Choose a Security Scanner</h2>
            <p>
              Select a vulnerability scanner that supports your programming language. Good options include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>ProbCheck</strong> - AI-powered scanner for multiple languages</li>
              <li><strong>Snyk</strong> - Focuses on open-source dependencies</li>
              <li><strong>SonarQube</strong> - Comprehensive code quality tool</li>
              <li><strong>Checkmarx</strong> - Enterprise-grade SAST tool</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Step 2: Scan Your Code</h2>
            <p>
              Most modern scanners are easy to use. Here's how to scan with ProbCheck:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Go to <Link href="/" className="text-primary hover:underline">probcheck.in</Link></li>
              <li>Upload your code or repository</li>
              <li>Click "Start Scan"</li>
              <li>Wait for results (usually 10-30 seconds)</li>
              <li>Review vulnerabilities found</li>
            </ol>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Step 3: Understand the Results</h2>
            <p>
              Scanners typically categorize vulnerabilities by severity:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Critical:</strong> Immediate security risk (fix ASAP)</li>
              <li><strong>High:</strong> Serious vulnerability (fix soon)</li>
              <li><strong>Medium:</strong> Potential security issue (fix when possible)</li>
              <li><strong>Low:</strong> Minor concern (fix eventually)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Step 4: Fix the Vulnerabilities</h2>
            <p>
              Once you've identified vulnerabilities, fix them systematically:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Start with critical and high-severity issues</li>
              <li>Read the vulnerability description carefully</li>
              <li>Follow the recommended fix</li>
              <li>Test your fixes thoroughly</li>
              <li>Re-scan to verify the fix worked</li>
            </ol>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Step 5: Automate Scanning</h2>
            <p>
              Don't just scan once! Set up automated scanning:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Integrate scanner into your CI/CD pipeline</li>
              <li>Scan on every commit or pull request</li>
              <li>Set up alerts for new vulnerabilities</li>
              <li>Schedule regular scans (weekly or monthly)</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Common Vulnerabilities to Look For</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>SQL Injection</li>
              <li>Cross-Site Scripting (XSS)</li>
              <li>Insecure authentication</li>
              <li>Sensitive data exposure</li>
              <li>Outdated dependencies</li>
              <li>Hardcoded credentials</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Best Practices</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Scan early and often:</strong> Don't wait until production</li>
              <li><strong>Use multiple tools:</strong> Different scanners find different issues</li>
              <li><strong>Review false positives:</strong> Not every alert is a real vulnerability</li>
              <li><strong>Keep dependencies updated:</strong> Regularly update libraries</li>
              <li><strong>Educate your team:</strong> Train developers on secure coding</li>
            </ol>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Conclusion</h2>
            <p>
              Regular code scanning is essential for maintaining secure applications. By following this guide and using tools like ProbCheck, you can identify and fix vulnerabilities before they become security breaches.
            </p>

            <div className="glass-card p-6 rounded-xl mt-8">
              <h3 className="text-xl font-semibold mb-3">Ready to Scan Your Code?</h3>
              <p className="text-sm mb-4">
                Try ProbCheck for free. No credit card required. Scan your code in seconds and get actionable security insights.
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