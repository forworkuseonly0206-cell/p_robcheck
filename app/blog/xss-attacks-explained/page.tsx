// app/blog/xss-attacks-explained/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

export const metadata = {
  title: "XSS Attacks Explained: How to Protect Your Web Applications",
  description: "Understanding Cross-Site Scripting (XSS) attacks and implementing effective prevention strategies to secure your web applications.",
  keywords: "xss attacks, cross-site scripting, web security, xss prevention, javascript security, dom xss",
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
              Security
            </span>
            <h1 className="text-4xl font-bold mt-4 mb-4">
              XSS Attacks Explained: How to Protect Your Web Applications
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                March 15, 2025
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                11 min read
              </div>
            </div>
          </div>

          <div className="space-y-6 text-muted-foreground">
            <p className="text-lg">
              Cross-Site Scripting (XSS) is one of the most common web vulnerabilities. Understanding how XSS works and how to prevent it is essential for every web developer.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">What is XSS?</h2>
            <p>
              XSS occurs when an attacker injects malicious JavaScript code into a web application, which then executes in other users&apos; browsers. This allows attackers to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Steal session cookies and tokens</li>
              <li>Capture keystrokes and form data</li>
              <li>Redirect users to malicious sites</li>
              <li>Deface websites</li>
              <li>Spread malware</li>
              <li>Perform actions on behalf of the victim</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Types of XSS Attacks</h2>
            
            <h3 className="text-xl font-semibold text-foreground mt-6">1. Stored XSS (Persistent)</h3>
            <p>
              The malicious script is permanently stored on the server (database, file system, etc.) and served to users when they view the affected page.
            </p>
            <p>
              <strong>Example scenario:</strong>
            </p>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-300">
                Attacker posts a comment with malicious script. When other users view the comment, the script executes and their cookies are stolen.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mt-6">2. Reflected XSS (Non-Persistent)</h3>
            <p>
              The malicious script is reflected off a web server, typically in search results or error messages.
            </p>
            <p>
              <strong>Example scenario:</strong>
            </p>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-300">
                Vulnerable search page reflects the search term without sanitization, allowing script execution.
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground mt-6">3. DOM-based XSS</h3>
            <p>
              The vulnerability exists in client-side JavaScript code that improperly handles user input.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Real-World Example: Cookie Theft</h2>
            <p>
              Here&apos;s how an attacker might steal session cookies using XSS:
            </p>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-gray-300">
                The attacker injects a script that steals the user&apos;s session cookie and sends it to their server, allowing them to hijack the user&apos;s session.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Prevention Method 1: Output Encoding</h2>
            <p>
              Always encode user input before displaying it in HTML. Use textContent instead of innerHTML when possible.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Prevention Method 2: Content Security Policy (CSP)</h2>
            <p>
              CSP is a powerful defense-in-depth mechanism against XSS. It controls which resources can be loaded and prevents inline scripts from executing.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Prevention Method 3: Sanitization Libraries</h2>
            <p>
              Use trusted libraries like DOMPurify to sanitize HTML when you need to display rich content. These libraries remove dangerous elements and attributes while preserving safe HTML.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Prevention Method 4: HTTPOnly Cookies</h2>
            <p>
              Set the HTTPOnly flag on session cookies to prevent JavaScript from accessing them. This way, even if XSS occurs, attackers cannot steal session tokens.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Framework-Specific Protection</h2>
            
            <p>
              <strong>React:</strong> React automatically escapes content by default. Only use dangerouslySetInnerHTML when absolutely necessary, and always sanitize first with DOMPurify.
            </p>

            <p>
              <strong>Vue:</strong> Vue escapes by default with double curly braces. Avoid v-html unless you sanitize the content first.
            </p>

            <p>
              <strong>Angular:</strong> Angular sanitizes content automatically. Use DomSanitizer for trusted HTML when needed.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Common Mistakes</h2>
            
            <p>
              <strong>1. Client-side validation only:</strong> Client-side checks can be bypassed. Always validate and sanitize on the server too.
            </p>

            <p>
              <strong>2. Incomplete sanitization:</strong> Simple string replacement is not enough. Use proper sanitization libraries.
            </p>

            <p>
              <strong>3. Trusting user input in URLs:</strong> Validate URL schemes to prevent javascript: protocol attacks.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Testing for XSS</h2>
            <p>
              Test your application with common XSS payloads to ensure proper protection. Look for places where user input is displayed without encoding.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Defense-in-Depth Strategy</h2>
            <p>
              Use multiple layers of protection:
            </p>
            <ol className="list-decimal pl-6 space-y-2">
              <li><strong>Input Validation:</strong> Validate on both client and server</li>
              <li><strong>Output Encoding:</strong> Encode all user input before display</li>
              <li><strong>CSP Headers:</strong> Implement strict Content Security Policy</li>
              <li><strong>HTTPOnly Cookies:</strong> Protect session cookies</li>
              <li><strong>Sanitization:</strong> Use DOMPurify for rich content</li>
              <li><strong>Regular Scanning:</strong> Automated security testing</li>
            </ol>

            <h2 className="text-2xl font-semibold text-foreground mt-8">XSS Security Checklist</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>✅ Never use innerHTML with user input</li>
              <li>✅ Use textContent or framework escaping</li>
              <li>✅ Implement CSP headers</li>
              <li>✅ Set HTTPOnly on session cookies</li>
              <li>✅ Sanitize rich content with DOMPurify</li>
              <li>✅ Validate URLs before href assignment</li>
              <li>✅ Don&apos;t use eval() or similar functions</li>
              <li>✅ Encode user input in different contexts</li>
              <li>✅ Regular security audits and testing</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Conclusion</h2>
            <p>
              XSS is preventable with proper input handling and output encoding. By following these best practices and using modern frameworks correctly, you can eliminate XSS vulnerabilities from your applications.
            </p>
            <p>
              Remember: Never trust user input, always encode output, and use defense-in-depth strategies.
            </p>

            <div className="glass-card p-6 rounded-xl mt-8">
              <h3 className="text-xl font-semibold mb-3">Detect XSS Vulnerabilities Automatically</h3>
              <p className="text-sm mb-4">
                ProbCheck scans your code for XSS vulnerabilities and provides detailed fix recommendations. Find and fix XSS before attackers exploit it.
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