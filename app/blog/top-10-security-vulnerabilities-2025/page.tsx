// app/blog/top-10-security-vulnerabilities-2025/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

export const metadata = {
  title: "Top 10 Security Vulnerabilities Every Developer Should Know in 2025",
  description: "Learn about the most critical security vulnerabilities affecting modern applications in 2025 and how to prevent them.",
  keywords: "security vulnerabilities 2025, OWASP top 10, code security, web security, application security",
}

export default function BlogPost() {
  return (
    <>
      <BackgroundGrid />
      <Header />
      
      <main className="container px-4 py-20 max-w-4xl">
        {/* Back Button */}
        <Link 
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <article className="prose prose-invert max-w-none">
          <div className="mb-8">
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              Security
            </span>
            <h1 className="text-4xl font-bold mt-4 mb-4">
              Top 10 Security Vulnerabilities Every Developer Should Know in 2025
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                March 25, 2025
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                8 min read
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6 text-muted-foreground">
            <p className="text-lg">
              Security vulnerabilities are a constant threat to modern applications. Understanding the most common security flaws can help you write more secure code and protect your users' data.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">1. SQL Injection</h2>
            <p>
              SQL injection remains one of the most dangerous vulnerabilities. Attackers can manipulate database queries by injecting malicious SQL code through user input fields.
            </p>
            <p>
              <strong>How to prevent:</strong> Always use parameterized queries or prepared statements. Never concatenate user input directly into SQL queries.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">2. Cross-Site Scripting (XSS)</h2>
            <p>
              XSS attacks allow attackers to inject malicious scripts into web pages viewed by other users. This can lead to session hijacking, data theft, and more.
            </p>
            <p>
              <strong>How to prevent:</strong> Always sanitize and escape user input. Use Content Security Policy (CSP) headers to restrict script execution.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">3. Broken Authentication</h2>
            <p>
              Weak authentication mechanisms allow attackers to compromise user accounts, steal session tokens, or bypass authentication entirely.
            </p>
            <p>
              <strong>How to prevent:</strong> Implement multi-factor authentication, use strong password policies, and properly manage session tokens.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">4. Sensitive Data Exposure</h2>
            <p>
              Failing to properly protect sensitive data like passwords, credit card numbers, or personal information can lead to serious breaches.
            </p>
            <p>
              <strong>How to prevent:</strong> Encrypt sensitive data both at rest and in transit. Use HTTPS for all connections. Never store passwords in plain text.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">5. Broken Access Control</h2>
            <p>
              Access control vulnerabilities allow users to access resources or perform actions they shouldn't be authorized to do.
            </p>
            <p>
              <strong>How to prevent:</strong> Implement proper role-based access control (RBAC). Always verify user permissions on the server side.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">6. Security Misconfiguration</h2>
            <p>
              Default configurations, incomplete setups, or verbose error messages can expose vulnerabilities to attackers.
            </p>
            <p>
              <strong>How to prevent:</strong> Remove default accounts, disable unnecessary features, and implement proper error handling.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">7. Cross-Site Request Forgery (CSRF)</h2>
            <p>
              CSRF attacks trick users into performing unwanted actions on applications where they're authenticated.
            </p>
            <p>
              <strong>How to prevent:</strong> Use anti-CSRF tokens for all state-changing operations. Implement SameSite cookie attributes.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">8. Insecure Deserialization</h2>
            <p>
              Deserializing untrusted data can lead to remote code execution, injection attacks, and privilege escalation.
            </p>
            <p>
              <strong>How to prevent:</strong> Avoid deserializing untrusted data. Implement integrity checks and use serialization formats that don't allow arbitrary code execution.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">9. Using Components with Known Vulnerabilities</h2>
            <p>
              Outdated libraries and frameworks often contain known security vulnerabilities that attackers can exploit.
            </p>
            <p>
              <strong>How to prevent:</strong> Regularly update dependencies. Use tools like ProbCheck to scan for vulnerable components.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">10. Insufficient Logging and Monitoring</h2>
            <p>
              Without proper logging and monitoring, security breaches can go undetected for long periods.
            </p>
            <p>
              <strong>How to prevent:</strong> Implement comprehensive logging for all security-relevant events. Set up alerts for suspicious activities.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Conclusion</h2>
            <p>
              Understanding these common vulnerabilities is the first step toward writing more secure code. Use automated security scanning tools like <Link href="/" className="text-primary hover:underline">ProbCheck</Link> to identify vulnerabilities early in your development process.
            </p>

            <div className="glass-card p-6 rounded-xl mt-8">
              <h3 className="text-xl font-semibold mb-3">Start Scanning Your Code for Free</h3>
              <p className="text-sm mb-4">
                Find security vulnerabilities in your code before they become problems. Scan your code with ProbCheck in seconds.
              </p>
              <Link 
                href="/scan"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Start Free Scan
              </Link>
            </div>
          </div>
        </article>
      </main>
      
      <Footer />
    </>
  )
}