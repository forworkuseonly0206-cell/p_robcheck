// Scan log lines for terminal animation
export const scanLogLines = [
  { text: "> Initializing CipherGuard engine...", delay: 0 },
  { text: "> Loading vulnerability patterns...", delay: 500 },
  { text: "> Scanning for hardcoded secrets...", delay: 1000 },
  { text: "> Checking SQL injection patterns...", delay: 1500 },
  { text: "> Analyzing authentication flows...", delay: 2000 },
  { text: "> Detecting XSS vulnerabilities...", delay: 2500 },
  { text: "> Reviewing access control logic...", delay: 3000 },
  { text: "> Scan complete.", delay: 3500 },
  { text: "> Results: 2 critical, 5 high, 3 medium, 4 low issues found.", delay: 4000 },
]

// FAQ data - renamed to CipherGuard
export const faqData = [
  {
    question: "How does CipherGuard work?",
    answer:
      "CipherGuard combines static analysis security testing (SAST) with machine learning models trained on millions of vulnerabilities. When you upload code or connect a repository, our engine parses your source files, builds an abstract syntax tree, and runs multiple security checks including pattern matching, data flow analysis, and AI-powered vulnerability detection.",
  },
  {
    question: "Is this a replacement for bug bounty programs?",
    answer:
      "CipherGuard is designed to complement bug bounty programs, not replace them. Our tool catches the common 80% of vulnerabilities that automated scanners can detect—SQL injection, XSS, hardcoded secrets, etc. We recommend using CipherGuard to clean up your codebase first, then deploying a bug bounty program to find the sophisticated edge cases that require human creativity.",
  },
  {
    question: "What kinds of vulnerabilities can it find?",
    answer:
      "CipherGuard detects OWASP Top 10 vulnerabilities including SQL Injection, Cross-Site Scripting (XSS), Broken Authentication, Security Misconfigurations, and more. We also detect hardcoded credentials, insecure cryptographic implementations, path traversal vulnerabilities, and language-specific security anti-patterns for JavaScript, Python, Go, Java, and more.",
  },
  {
    question: "Can companies use this in CI/CD pipelines?",
    answer:
      "Yes! CipherGuard integrates with popular CI/CD platforms including GitHub Actions, GitLab CI, Jenkins, and CircleCI. You can configure automated scans on every pull request and block merges if critical vulnerabilities are detected. Our Pro plan includes API access for custom integrations.",
  },
  {
    question: "Is my code stored securely?",
    answer:
      "Your code security is our top priority. Uploaded code is encrypted in transit and at rest, processed in isolated containers, and automatically deleted after scan completion unless you explicitly choose to retain it. We never train our AI models on customer code. CipherGuard is SOC 2 Type II compliant.",
  },
  {
    question: "What programming languages are supported?",
    answer:
      "CipherGuard currently supports JavaScript/TypeScript, Python, Go, Java, Ruby, PHP, and C#. We're continuously adding support for more languages. Each language has specialized detection rules and AI models trained on language-specific vulnerability patterns.",
  },
]

// Dashboard statistics
export const dashboardStats = {
  totalScans: 47,
  criticalIssues: 12,
  projectsMonitored: 8,
  lastScanScore: 78,
}

// Trend data for chart
export const trendData = [
  { month: "Jan", critical: 5, high: 12, medium: 8, low: 15 },
  { month: "Feb", critical: 4, high: 10, medium: 9, low: 12 },
  { month: "Mar", critical: 3, high: 8, medium: 7, low: 10 },
  { month: "Apr", critical: 2, high: 6, medium: 5, low: 8 },
  { month: "May", critical: 2, high: 5, medium: 4, low: 6 },
  { month: "Jun", critical: 1, high: 4, medium: 3, low: 5 },
]

// Vulnerability interface
export interface Vulnerability {
  id: string
  title: string
  severity: "critical" | "high" | "medium" | "low"
  category: string
  file: string
  line: number
  description: string
  codeSnippet: string
  suggestedFix: string
  tags: string[]
}

// Scan report interface
export interface ScanReport {
  id: string
  project: string
  environment: string
  date: string
  duration: string
  status: "completed" | "in-progress" | "failed"
  summary: {
    critical: number
    high: number
    medium: number
    low: number
  }
  overallRisk: "critical" | "high" | "medium" | "low"
  findings: Vulnerability[]
  attackStory: {
    nodes: { id: string; label: string; type: string }[]
    edges: { from: string; to: string }[]
  }
}

// Mock scan reports
export const mockScanReports: ScanReport[] = [
  {
    id: "scan-001",
    project: "ecommerce-api",
    environment: "Production",
    date: "2025-01-15T14:30:00Z",
    duration: "2m 34s",
    status: "completed",
    summary: {
      critical: 2,
      high: 5,
      medium: 3,
      low: 4,
    },
    overallRisk: "critical",
    findings: [
      {
        id: "vuln-001",
        title: "SQL Injection in /auth/login",
        severity: "critical",
        category: "Injection",
        file: "src/controllers/auth.js",
        line: 45,
        description:
          "User input from the login form is directly concatenated into an SQL query without proper sanitization or parameterized queries. An attacker could inject malicious SQL code to bypass authentication, extract sensitive data, or modify database records.",
        codeSnippet: `const query = "SELECT * FROM users WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "'";
db.query(query);`,
        suggestedFix: `const query = "SELECT * FROM users WHERE email = ? AND password = ?";
db.query(query, [req.body.email, hashedPassword]);`,
        tags: ["SQLInjection", "Backend", "Authentication"],
      },
      {
        id: "vuln-002",
        title: "Hardcoded API Key in Source",
        severity: "critical",
        category: "Secrets",
        file: "src/config/api.js",
        line: 12,
        description:
          "A production API key for a third-party payment service is hardcoded in the source code. If this code is committed to a public repository or accessed by unauthorized personnel, the API key could be compromised, leading to financial fraud or data breaches.",
        codeSnippet: `const STRIPE_SECRET_KEY = "sk_live_51ABC123XYZ789...";`,
        suggestedFix: `const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;`,
        tags: ["HardcodedSecrets", "Configuration", "Payment"],
      },
      {
        id: "vuln-003",
        title: "Cross-Site Scripting (XSS) in Comments",
        severity: "high",
        category: "XSS",
        file: "src/components/CommentList.jsx",
        line: 28,
        description:
          "User-submitted comment content is rendered using dangerouslySetInnerHTML without sanitization. An attacker could inject malicious JavaScript that executes in other users' browsers, potentially stealing session tokens or performing actions on behalf of victims.",
        codeSnippet: `<div dangerouslySetInnerHTML={{ __html: comment.content }} />`,
        suggestedFix: `import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.content) }} />`,
        tags: ["XSS", "Frontend", "React"],
      },
      {
        id: "vuln-004",
        title: "Insecure Direct Object Reference (IDOR)",
        severity: "high",
        category: "Access Control",
        file: "src/routes/orders.js",
        line: 67,
        description:
          "The order detail endpoint retrieves orders based solely on the ID parameter without verifying that the requesting user owns that order. An attacker could enumerate order IDs to access other users' order information including personal and payment details.",
        codeSnippet: `router.get('/orders/:id', async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
});`,
        suggestedFix: `router.get('/orders/:id', async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user.id
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});`,
        tags: ["IDOR", "AccessControl", "Backend"],
      },
      {
        id: "vuln-005",
        title: "Missing Rate Limiting on Login",
        severity: "high",
        category: "Authentication",
        file: "src/controllers/auth.js",
        line: 12,
        description:
          "The login endpoint lacks rate limiting, making it vulnerable to brute force attacks. An attacker could attempt thousands of password combinations to gain unauthorized access to user accounts.",
        codeSnippet: `router.post('/login', async (req, res) => {
  // No rate limiting
  const user = await authenticate(req.body);
});`,
        suggestedFix: `import rateLimit from 'express-rate-limit';
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});
router.post('/login', loginLimiter, async (req, res) => {
  const user = await authenticate(req.body);
});`,
        tags: ["BruteForce", "Authentication", "RateLimiting"],
      },
      {
        id: "vuln-006",
        title: "Weak Password Requirements",
        severity: "medium",
        category: "Authentication",
        file: "src/validators/user.js",
        line: 34,
        description:
          "The password validation only requires a minimum of 6 characters with no complexity requirements. This allows users to set weak passwords that are easily guessable or susceptible to dictionary attacks.",
        codeSnippet: `const passwordSchema = Joi.string().min(6);`,
        suggestedFix: `const passwordSchema = Joi.string()
  .min(12)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])/)
  .message('Password must contain uppercase, lowercase, number, and special character');`,
        tags: ["PasswordPolicy", "Authentication"],
      },
    ],
    attackStory: {
      nodes: [
        { id: "1", label: "/auth/login", type: "endpoint" },
        { id: "2", label: "SQL Injection", type: "vulnerability" },
        { id: "3", label: "Database", type: "asset" },
        { id: "4", label: "User Data", type: "data" },
        { id: "5", label: "API Keys", type: "secret" },
      ],
      edges: [
        { from: "1", to: "2" },
        { from: "2", to: "3" },
        { from: "3", to: "4" },
        { from: "3", to: "5" },
      ],
    },
  },
  {
    id: "scan-002",
    project: "mobile-backend",
    environment: "Staging",
    date: "2025-01-14T09:15:00Z",
    duration: "1m 45s",
    status: "completed",
    summary: {
      critical: 0,
      high: 2,
      medium: 4,
      low: 6,
    },
    overallRisk: "high",
    findings: [
      {
        id: "vuln-007",
        title: "Missing CORS Configuration",
        severity: "high",
        category: "Configuration",
        file: "src/app.js",
        line: 8,
        description:
          "The API server has CORS configured to allow all origins (*). This permits any website to make requests to your API, potentially enabling cross-site request forgery attacks or data exfiltration.",
        codeSnippet: `app.use(cors({ origin: '*' }));`,
        suggestedFix: `app.use(cors({ 
  origin: ['https://yourapp.com', 'https://staging.yourapp.com'],
  credentials: true 
}));`,
        tags: ["CORS", "Configuration", "Security"],
      },
    ],
    attackStory: {
      nodes: [
        { id: "1", label: "External Site", type: "endpoint" },
        { id: "2", label: "CORS Bypass", type: "vulnerability" },
        { id: "3", label: "API Server", type: "asset" },
      ],
      edges: [
        { from: "1", to: "2" },
        { from: "2", to: "3" },
      ],
    },
  },
  {
    id: "scan-003",
    project: "admin-dashboard",
    environment: "Development",
    date: "2025-01-13T16:45:00Z",
    duration: "3m 12s",
    status: "completed",
    summary: {
      critical: 1,
      high: 3,
      medium: 5,
      low: 8,
    },
    overallRisk: "critical",
    findings: [],
    attackStory: {
      nodes: [],
      edges: [],
    },
  },
]

// Detailed scan logs for the scan page animation - renamed to CipherGuard
export const detailedScanLogs = [
  { text: "[INIT] CipherGuard v2.4.1 starting...", type: "info", delay: 0 },
  { text: "[INIT] Loading security modules...", type: "info", delay: 300 },
  { text: "[INIT] Parsing source files...", type: "info", delay: 600 },
  { text: "[SCAN] Running static analysis...", type: "info", delay: 1000 },
  { text: "[SCAN] Checking for hardcoded secrets...", type: "info", delay: 1500 },
  { text: "[WARN] Found potential secret in src/config/api.js:12", type: "warning", delay: 2000 },
  { text: "[SCAN] Analyzing SQL queries...", type: "info", delay: 2500 },
  { text: "[CRIT] SQL injection detected in src/controllers/auth.js:45", type: "critical", delay: 3000 },
  { text: "[SCAN] Checking XSS patterns...", type: "info", delay: 3500 },
  { text: "[HIGH] Unsafe innerHTML usage in CommentList.jsx:28", type: "high", delay: 4000 },
  { text: "[SCAN] Verifying access control...", type: "info", delay: 4500 },
  { text: "[HIGH] Missing authorization check in orders.js:67", type: "high", delay: 5000 },
  { text: "[SCAN] Analyzing authentication flows...", type: "info", delay: 5500 },
  { text: "[MED] Weak password policy detected", type: "medium", delay: 6000 },
  { text: "[SCAN] Generating attack story graph...", type: "info", delay: 6500 },
  { text: "[DONE] Scan complete. Report generated.", type: "success", delay: 7000 },
]
