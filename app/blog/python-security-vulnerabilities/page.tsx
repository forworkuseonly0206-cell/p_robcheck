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
                <Calendar className="w-4" />
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
              Running shell commands with user input can allow attackers to execute arbitrary commands on your server.
            </p>
            <p>
              <strong>Vulnerable code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ❌ DANGEROUS - Command injection risk
import os

filename = request.GET['file']
os.system(f'cat {filename}')

# Attacker sends: file=;rm -rf /
# Executes: cat ;rm -rf /
# Your server is destroyed!`}</code>
            </pre>
            <p>
              <strong>Secure code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ✅ SAFE - Use subprocess with list arguments
import subprocess

filename = request.GET['file']
# Validate filename first
if not filename.isalnum():
    raise ValueError('Invalid filename')

result = subprocess.run(
    ['cat', filename],  # List prevents injection
    capture_output=True,
    text=True,
    timeout=5  # Prevent hanging
)

# Even better: Don't use shell commands at all!
with open(filename, 'r') as f:
    content = f.read()`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">2. SQL Injection</h2>
            <p>
              Never concatenate user input into SQL queries.
            </p>
            <p>
              <strong>Vulnerable code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ❌ DANGEROUS - SQL injection
username = request.form['username']
query = f"SELECT * FROM users WHERE username = '{username}'"
cursor.execute(query)

# Attacker sends: admin'--
# Query becomes: SELECT * FROM users WHERE username = 'admin'--'
# Password check is bypassed!`}</code>
            </pre>
            <p>
              <strong>Secure code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ✅ SAFE - Parameterized query
username = request.form['username']
cursor.execute(
    "SELECT * FROM users WHERE username = ?",
    (username,)
)

# Or use an ORM like SQLAlchemy
from sqlalchemy import select
user = session.execute(
    select(User).where(User.username == username)
).first()`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">3. Code Injection via eval() and exec()</h2>
            <p>
              Never use eval() or exec() with user input.
            </p>
            <p>
              <strong>Vulnerable code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ❌ EXTREMELY DANGEROUS
user_code = request.form['code']
result = eval(user_code)

# Attacker sends: __import__('os').system('rm -rf /')
# Your server is destroyed!`}</code>
            </pre>
            <p>
              <strong>Secure alternatives:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ✅ Use ast.literal_eval for safe evaluation of literals
import ast

user_data = request.form['data']
try:
    safe_data = ast.literal_eval(user_data)  # Only allows literals
except (ValueError, SyntaxError):
    raise ValueError('Invalid input')

# ✅ For math expressions, use a safe parser
from simpleeval import simple_eval

result = simple_eval(user_expression, 
                     names={'x': 10, 'y': 20})

# ✅ Better yet: Don't execute user code at all!
# Use configuration or a DSL instead`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">4. Insecure Deserialization (Pickle)</h2>
            <p>
              Python's pickle module can execute arbitrary code during deserialization.
            </p>
            <p>
              <strong>Vulnerable code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ❌ DANGEROUS - Pickle can execute code
import pickle

user_data = request.body
obj = pickle.loads(user_data)  # Can execute malicious code!`}</code>
            </pre>
            <p>
              <strong>Secure alternatives:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ✅ Use JSON instead
import json

user_data = request.body
obj = json.loads(user_data)  # Much safer!

# ✅ If you MUST use pickle, validate the source
import hmac
import hashlib

def safe_pickle_loads(data, secret_key):
    # Verify HMAC signature first
    signature = data[:32]
    pickled = data[32:]
    
    expected_sig = hmac.new(
        secret_key,
        pickled,
        hashlib.sha256
    ).digest()
    
    if not hmac.compare_digest(signature, expected_sig):
        raise ValueError('Invalid signature')
    
    return pickle.loads(pickled)`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">5. Path Traversal</h2>
            <p>
              Attackers can access files outside the intended directory.
            </p>
            <p>
              <strong>Vulnerable code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ❌ DANGEROUS - Path traversal
filename = request.GET['file']
with open(f'/var/www/uploads/{filename}', 'r') as f:
    content = f.read()

# Attacker sends: file=../../etc/passwd
# Opens: /var/www/uploads/../../etc/passwd = /etc/passwd
# Attacker reads password file!`}</code>
            </pre>
            <p>
              <strong>Secure code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ✅ SAFE - Validate and normalize path
import os
from pathlib import Path

UPLOAD_DIR = Path('/var/www/uploads')
filename = request.GET['file']

# Resolve to absolute path and check it's within UPLOAD_DIR
file_path = (UPLOAD_DIR / filename).resolve()

if not file_path.is_relative_to(UPLOAD_DIR):
    raise ValueError('Invalid file path')

with open(file_path, 'r') as f:
    content = f.read()`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">6. Insecure Random Number Generation</h2>
            <p>
              Never use random.random() for security-sensitive operations.
            </p>
            <p>
              <strong>Vulnerable code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ❌ INSECURE - Predictable random numbers
import random

# Don't use for:
# - Session tokens
# - Password reset tokens
# - Encryption keys
# - CSRF tokens

session_id = random.randint(1000000, 9999999)  # Predictable!`}</code>
            </pre>
            <p>
              <strong>Secure code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ✅ SECURE - Cryptographically secure random
import secrets

# For tokens
session_id = secrets.token_urlsafe(32)
reset_token = secrets.token_hex(32)

# For random numbers
random_number = secrets.randbelow(1000000)

# For random choice
random_item = secrets.choice(my_list)`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">7. Weak Cryptography</h2>
            <p>
              Don't implement your own crypto or use weak algorithms.
            </p>
            <p>
              <strong>Vulnerable code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ❌ INSECURE - Weak hashing
import hashlib

password = 'user_password'
hashed = hashlib.md5(password.encode()).hexdigest()  # MD5 is broken!

# ❌ INSECURE - No salt
hashed = hashlib.sha256(password.encode()).hexdigest()  # Rainbow tables!`}</code>
            </pre>
            <p>
              <strong>Secure code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ✅ SECURE - Use bcrypt or Argon2
import bcrypt

password = 'user_password'
hashed = bcrypt.hashpw(
    password.encode(),
    bcrypt.gensalt(rounds=12)
)

# Verify password
if bcrypt.checkpw(password.encode(), hashed):
    print('Password correct')

# ✅ Or use Argon2 (even better!)
from argon2 import PasswordHasher

ph = PasswordHasher()
hashed = ph.hash(password)

# Verify
ph.verify(hashed, password)`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">8. XML External Entity (XXE) Injection</h2>
            <p>
              Parsing untrusted XML can allow attackers to read local files.
            </p>
            <p>
              <strong>Vulnerable code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ❌ VULNERABLE to XXE
import xml.etree.ElementTree as ET

xml_data = request.body
tree = ET.fromstring(xml_data)  # Unsafe!`}</code>
            </pre>
            <p>
              <strong>Secure code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ✅ SAFE - Use defusedxml
from defusedxml import ElementTree as ET

xml_data = request.body
tree = ET.fromstring(xml_data)  # Safe from XXE attacks

# Or disable external entities
import xml.etree.ElementTree as ET
from xml.sax import make_parser
from xml.sax.handler import feature_external_ges

parser = make_parser()
parser.setFeature(feature_external_ges, False)  # Disable XXE`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">9. Server-Side Request Forgery (SSRF)</h2>
            <p>
              Validate and restrict URLs before making requests.
            </p>
            <p>
              <strong>Vulnerable code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ❌ VULNERABLE - SSRF attack
import requests

url = request.GET['url']
response = requests.get(url)  # Can access internal services!

# Attacker sends: url=http://localhost:8080/admin
# Bypasses firewall!`}</code>
            </pre>
            <p>
              <strong>Secure code:</strong>
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ✅ SAFE - Validate URL
from urllib.parse import urlparse
import requests

url = request.GET['url']
parsed = urlparse(url)

# Whitelist allowed domains
ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com']

if parsed.hostname not in ALLOWED_DOMAINS:
    raise ValueError('Invalid domain')

# Prevent access to internal IPs
import ipaddress

try:
    ip = ipaddress.ip_address(parsed.hostname)
    if ip.is_private or ip.is_loopback:
        raise ValueError('Cannot access internal IP')
except ValueError:
    pass  # Not an IP, proceed

response = requests.get(url, timeout=5)`}</code>
            </pre>

            <h2 className="text-2xl font-semibold text-foreground mt-8">10. Debug Mode in Production</h2>
            <p>
              Never run Flask/Django in debug mode in production.
            </p>
            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code>{`# ❌ DANGEROUS in production
# Flask
app.run(debug=True)  # Exposes source code and allows code execution!

# Django
DEBUG = True  # Shows detailed error pages with sensitive info

# ✅ SAFE - Production settings
# Flask
app.run(debug=False)

# Django
DEBUG = False
ALLOWED_HOSTS = ['yourdomain.com']
SECRET_KEY = os.environ.get('SECRET_KEY')  # From environment`}</code>
            </pre>

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
              <li>✅ Keep dependencies updated (pip-audit)</li>
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
              Python's simplicity can sometimes lead developers to overlook security considerations. By following these best practices and avoiding common pitfalls, you can write more secure Python applications.
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