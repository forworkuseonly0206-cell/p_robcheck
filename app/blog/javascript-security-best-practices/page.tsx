// app/blog/javascript-security-best-practices/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

export const metadata = {
  title: "JavaScript Security Best Practices: Protect Your Code from Attacks",
  description: "Essential security practices every JavaScript developer needs to follow to write secure code and prevent XSS, injection attacks, and vulnerabilities.",
  keywords: "javascript security, secure coding, js vulnerabilities, xss prevention, javascript best practices, web security",
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
              JavaScript
            </span>
            <h1 className="text-4xl font-bold mt-4 mb-4">
              JavaScript Security Best Practices: Protect Your Code from Attacks
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                March 20, 2025
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                10 min read
              </div>
            </div>
          </div>

          <div className="space-y-6 text-muted-foreground">
            <p className="text-lg">
              JavaScript powers most modern web applications, making it a prime target for attackers. Following security best practices is essential to protect your users and your application from vulnerabilities.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">1. Always Validate and Sanitize User Input</h2>
            <p>
              Never trust user input. All data coming from users, APIs, or external sources should be validated and sanitized.
            </p>
            <p>
              <strong>Bad Practice:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ Dangerous - No validation
const username = req.body.username;
document.getElementById('welcome').innerHTML = 'Hello ' + username;`}</code>
            </pre>
            <p>
              <strong>Good Practice:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ✅ Safe - Validate and escape
const username = sanitize(req.body.username);
document.getElementById('welcome').textContent = 'Hello ' + username;`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">2. Prevent Cross-Site Scripting (XSS)</h2>
            <p>
              XSS is one of the most common JavaScript vulnerabilities. Attackers inject malicious scripts that run in users' browsers.
            </p>
            <p>
              <strong>Prevention techniques:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use <code>textContent</code> instead of <code>innerHTML</code> when displaying user data</li>
              <li>Sanitize HTML with libraries like DOMPurify</li>
              <li>Implement Content Security Policy (CSP) headers</li>
              <li>Escape special characters in user input</li>
            </ul>
            <p>
              <strong>Example:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ Vulnerable to XSS
element.innerHTML = userInput;

// ✅ Safe from XSS
element.textContent = userInput;

// ✅ Safe HTML rendering with DOMPurify
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">3. Use Strict Mode</h2>
            <p>
              Always enable strict mode to catch common coding errors and prevent unsafe actions.
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`'use strict';

// This will now throw an error instead of silently failing
undeclaredVariable = 10; // ReferenceError`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">4. Secure Authentication and Session Management</h2>
            <p>
              Authentication vulnerabilities can lead to account takeovers and data breaches.
            </p>
            <p>
              <strong>Best practices:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Store tokens in httpOnly cookies (not localStorage)</li>
              <li>Implement proper session timeout</li>
              <li>Use secure, random session IDs</li>
              <li>Enable HTTPS for all authentication requests</li>
              <li>Implement rate limiting on login endpoints</li>
            </ul>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ Insecure - Token in localStorage
localStorage.setItem('token', authToken);

// ✅ Secure - httpOnly cookie
res.cookie('token', authToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 3600000
});`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">5. Avoid eval() and Similar Functions</h2>
            <p>
              Never use <code>eval()</code>, <code>Function()</code>, or <code>setTimeout()</code> with strings. They can execute arbitrary code.
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ Extremely dangerous
eval(userInput);

// ❌ Also dangerous
new Function(userInput)();
setTimeout(userInput, 1000);

// ✅ Use safe alternatives
const result = JSON.parse(userInput); // For data
const fn = myFunction; // Direct function reference`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">6. Implement Content Security Policy (CSP)</h2>
            <p>
              CSP helps prevent XSS attacks by controlling which resources can be loaded.
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// Set CSP headers in your server
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' https://trusted-cdn.com; 
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">7. Secure API Calls</h2>
            <p>
              When making API requests, implement proper security measures.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use HTTPS for all API calls</li>
              <li>Validate API responses</li>
              <li>Implement rate limiting</li>
              <li>Don't expose sensitive data in URLs</li>
              <li>Use proper CORS configuration</li>
            </ul>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ Bad - Sensitive data in URL
fetch('https://api.example.com/user?token=' + userToken);

// ✅ Good - Token in header
fetch('https://api.example.com/user', {
  headers: {
    'Authorization': 'Bearer ' + userToken,
    'Content-Type': 'application/json'
  }
});`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">8. Prevent Prototype Pollution</h2>
            <p>
              Prototype pollution can allow attackers to modify JavaScript object prototypes.
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ Vulnerable to prototype pollution
function merge(target, source) {
  for (let key in source) {
    target[key] = source[key];
  }
}

// ✅ Safe - Check for __proto__
function safeMerge(target, source) {
  for (let key in source) {
    if (key === '__proto__' || key === 'constructor') continue;
    target[key] = source[key];
  }
}

// ✅ Even better - Use Object.assign
const merged = Object.assign({}, target, source);`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">9. Use Security Linters</h2>
            <p>
              Automated tools can catch security issues during development.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>ESLint Security Plugin:</strong> Detects common security issues</li>
              <li><strong>npm audit:</strong> Finds vulnerabilities in dependencies</li>
              <li><strong>ProbCheck:</strong> AI-powered vulnerability scanner</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">10. Keep Dependencies Updated</h2>
            <p>
              Outdated packages are a major security risk. Regularly update your dependencies.
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# Check for vulnerabilities
npm audit

# Update packages
npm update

# Check for outdated packages
npm outdated`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">11. Secure File Uploads</h2>
            <p>
              File uploads can be exploited to upload malicious scripts.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Validate file types on the server</li>
              <li>Limit file size</li>
              <li>Rename uploaded files</li>
              <li>Store files outside web root</li>
              <li>Scan files for malware</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">12. Implement Rate Limiting</h2>
            <p>
              Prevent brute force attacks and DDoS with rate limiting.
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// Using express-rate-limit
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Quick Security Checklist</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>✅ All user input validated and sanitized</li>
              <li>✅ Using textContent instead of innerHTML</li>
              <li>✅ CSP headers implemented</li>
              <li>✅ HTTPS enabled everywhere</li>
              <li>✅ Tokens in httpOnly cookies</li>
              <li>✅ Dependencies up to date</li>
              <li>✅ Rate limiting on sensitive endpoints</li>
              <li>✅ Error messages don't leak sensitive info</li>
              <li>✅ Security linters configured</li>
              <li>✅ Regular security audits</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Conclusion</h2>
            <p>
              JavaScript security requires constant vigilance. By following these best practices, you can significantly reduce your application's attack surface and protect your users' data.
            </p>
            <p>
              Remember: Security is not a one-time effort. Regularly scan your code, update dependencies, and stay informed about new vulnerabilities.
            </p>

            <div className="glass-card p-6 rounded-xl mt-8">
              <h3 className="text-xl font-semibold mb-3">Scan Your JavaScript Code for Free</h3>
              <p className="text-sm mb-4">
                ProbCheck automatically detects XSS, injection vulnerabilities, and 40+ other security issues in your JavaScript code. Get instant security insights.
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