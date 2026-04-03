// app/blog/sql-injection-prevention-guide/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

export const metadata = {
  title: "SQL Injection Prevention: A Complete Developer's Guide",
  description: "Everything you need to know about preventing SQL injection attacks in your applications. Learn how to write secure database queries.",
  keywords: "sql injection, database security, prevent sql attacks, prepared statements, sql security, web security",
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
              SQL Injection Prevention: A Complete Developer's Guide
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                March 18, 2025
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                15 min read
              </div>
            </div>
          </div>

          <div className="space-y-6 text-muted-foreground">
            <p className="text-lg">
              SQL injection is one of the oldest and most dangerous web vulnerabilities. Despite being well-known, it's still responsible for countless data breaches. This guide will teach you how to prevent it completely.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">What is SQL Injection?</h2>
            <p>
              SQL injection occurs when an attacker manipulates database queries by injecting malicious SQL code through user input. This can allow them to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access, modify, or delete data</li>
              <li>Bypass authentication</li>
              <li>Execute administrative operations</li>
              <li>Read sensitive files from the server</li>
              <li>In some cases, execute system commands</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Real-World Example</h2>
            <p>
              Consider this vulnerable login code:
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ VULNERABLE CODE - DO NOT USE
const username = req.body.username;
const password = req.body.password;

const query = "SELECT * FROM users WHERE username = '" + username + 
              "' AND password = '" + password + "'";
              
const result = db.execute(query);`}</code>
            </pre>
            <p>
              An attacker could enter this as the username:
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`admin' --`}</code>
            </pre>
            <p>
              This creates the query:
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`SELECT * FROM users WHERE username = 'admin' --' AND password = ''`}</code>
            </pre>
            <p>
              The <code>--</code> comments out the password check, allowing the attacker to log in as admin without a password!
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Prevention Method 1: Prepared Statements (Parameterized Queries)</h2>
            <p>
              The most effective defense against SQL injection is using prepared statements.
            </p>
            <p>
              <strong>Node.js (MySQL):</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ✅ SAFE - Using prepared statements
const mysql = require('mysql2');

const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
const values = [username, password];

connection.execute(query, values, (err, results) => {
  // Handle results
});`}</code>
            </pre>
            <p>
              <strong>Python (SQLite):</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ✅ SAFE - Using parameterized query
import sqlite3

query = "SELECT * FROM users WHERE username = ? AND password = ?"
cursor.execute(query, (username, password))
results = cursor.fetchall()`}</code>
            </pre>
            <p>
              <strong>PHP (PDO):</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ✅ SAFE - Using PDO prepared statements
$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ? AND password = ?');
$stmt->execute([$username, $password]);
$results = $stmt->fetchAll();`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Prevention Method 2: ORM (Object-Relational Mapping)</h2>
            <p>
              ORMs like Sequelize, TypeORM, SQLAlchemy automatically handle parameterization.
            </p>
            <p>
              <strong>Sequelize (Node.js):</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ✅ SAFE - ORM handles parameterization
const user = await User.findOne({
  where: {
    username: username,
    password: password
  }
});`}</code>
            </pre>
            <p>
              <strong>Prisma (Node.js):</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ✅ SAFE - Prisma uses prepared statements
const user = await prisma.user.findFirst({
  where: {
    username: username,
    password: password
  }
});`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Prevention Method 3: Stored Procedures</h2>
            <p>
              Stored procedures can provide an additional layer of security when properly implemented.
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`-- Create stored procedure
CREATE PROCEDURE GetUser(IN user_name VARCHAR(50), IN user_pass VARCHAR(50))
BEGIN
  SELECT * FROM users WHERE username = user_name AND password = user_pass;
END;

-- Call from application
CALL GetUser(?, ?);`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">What NOT to Do</h2>
            <p>
              These methods are NOT sufficient to prevent SQL injection:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Escaping characters:</strong> Easy to bypass</li>
              <li><strong>Blacklisting keywords:</strong> Can be circumvented</li>
              <li><strong>Client-side validation:</strong> Easily bypassed by attackers</li>
              <li><strong>String concatenation with sanitization:</strong> Still risky</li>
            </ul>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ❌ NOT SAFE ENOUGH
const sanitized = username.replace(/'/g, "''");
const query = "SELECT * FROM users WHERE username = '" + sanitized + "'";

// Still vulnerable to other attack vectors!`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Advanced Attack Techniques</h2>
            <p>
              <strong>1. Union-based injection:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`' UNION SELECT username, password FROM users--`}</code>
            </pre>
            <p>
              <strong>2. Boolean-based blind injection:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`' AND 1=1--  (returns results)
' AND 1=2--  (returns no results)`}</code>
            </pre>
            <p>
              <strong>3. Time-based blind injection:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`' AND SLEEP(5)--`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Additional Security Layers</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Principle of Least Privilege:</strong> Database users should only have necessary permissions</li>
              <li><strong>Input Validation:</strong> Validate data types and formats</li>
              <li><strong>Web Application Firewall (WAF):</strong> Filter malicious requests</li>
              <li><strong>Error Handling:</strong> Don't expose database errors to users</li>
              <li><strong>Regular Security Audits:</strong> Scan code regularly</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Testing for SQL Injection</h2>
            <p>
              Test your application with these inputs:
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`' OR '1'='1
' OR '1'='1'--
' OR '1'='1'/*
admin'--
' UNION SELECT NULL--
1' AND '1'='2
' AND SLEEP(5)--`}</code>
            </pre>
            <p>
              If any of these cause unexpected behavior, you have a SQL injection vulnerability.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Framework-Specific Protection</h2>
            <p>
              <strong>Laravel (PHP):</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`// ✅ SAFE - Eloquent ORM
$user = User::where('username', $username)
            ->where('password', $password)
            ->first();

// ✅ SAFE - Query builder with bindings
$user = DB::table('users')
          ->where('username', $username)
          ->first();`}</code>
            </pre>
            <p>
              <strong>Django (Python):</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ✅ SAFE - Django ORM
user = User.objects.filter(username=username, password=password).first()

# ✅ SAFE - Raw queries with parameters
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT * FROM users WHERE username = %s", [username])`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Real-World Data Breach Examples</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>TalkTalk (2015):</strong> 157,000 customers affected, £400,000 fine</li>
              <li><strong>Heartland Payment Systems (2008):</strong> 130 million credit cards stolen</li>
              <li><strong>Sony Pictures (2011):</strong> 1 million accounts compromised</li>
            </ul>
            <p>
              All were preventable with proper SQL injection protection.
            </p>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Security Checklist</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>✅ Use prepared statements or ORM everywhere</li>
              <li>✅ Never concatenate user input into SQL queries</li>
              <li>✅ Validate all input (type, format, length)</li>
              <li>✅ Use principle of least privilege for database users</li>
              <li>✅ Don't expose database errors to users</li>
              <li>✅ Implement WAF for additional protection</li>
              <li>✅ Regular security scans and penetration testing</li>
              <li>✅ Keep frameworks and libraries updated</li>
              <li>✅ Log and monitor suspicious queries</li>
            </ul>

            <h2 className="text-2xl font-semibold text-foreground mt-8">Conclusion</h2>
            <p>
              SQL injection is 100% preventable. By using prepared statements or ORMs consistently, you can eliminate this vulnerability entirely. There's no excuse for SQL injection in modern applications.
            </p>

            <div className="glass-card p-6 rounded-xl mt-8">
              <h3 className="text-xl font-semibold mb-3">Scan Your Code for SQL Injection</h3>
              <p className="text-sm mb-4">
                ProbCheck automatically detects SQL injection vulnerabilities in your code. Get instant security reports and fix recommendations.
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