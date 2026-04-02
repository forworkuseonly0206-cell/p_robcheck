// app/blog/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Security Blog - ProbCheck | Vulnerability Scanner Guides & Tutorials",
  description: "Learn about code security, vulnerability scanning, and best practices. Expert guides on finding and fixing security bugs.",
  keywords: "security blog, vulnerability scanner guide, code security tips, security best practices",
}

const blogPosts = [
  {
    slug: "top-10-security-vulnerabilities-2025",
    title: "Top 10 Security Vulnerabilities Every Developer Should Know in 2025",
    excerpt: "Learn about the most critical security vulnerabilities affecting modern applications and how to prevent them.",
    date: "March 25, 2025",
    readTime: "8 min read",
    category: "Security",
  },
  {
    slug: "how-to-scan-code-for-vulnerabilities",
    title: "How to Scan Your Code for Security Vulnerabilities (Complete Guide)",
    excerpt: "Step-by-step guide to scanning your code for security bugs using AI-powered tools.",
    date: "March 22, 2025",
    readTime: "12 min read",
    category: "Tutorial",
  },
  {
    slug: "javascript-security-best-practices",
    title: "JavaScript Security Best Practices: Protect Your Code from Attacks",
    excerpt: "Essential security practices every JavaScript developer needs to follow to write secure code.",
    date: "March 20, 2025",
    readTime: "10 min read",
    category: "JavaScript",
  },
  {
    slug: "sql-injection-prevention-guide",
    title: "SQL Injection Prevention: A Complete Developer's Guide",
    excerpt: "Everything you need to know about preventing SQL injection attacks in your applications.",
    date: "March 18, 2025",
    readTime: "15 min read",
    category: "Security",
  },
  {
    slug: "xss-attacks-explained",
    title: "XSS Attacks Explained: How to Protect Your Web Applications",
    excerpt: "Understanding Cross-Site Scripting (XSS) attacks and implementing effective prevention strategies.",
    date: "March 15, 2025",
    readTime: "11 min read",
    category: "Security",
  },
  {
    slug: "python-security-vulnerabilities",
    title: "Common Python Security Vulnerabilities and How to Fix Them",
    excerpt: "Identify and fix the most common security issues in Python applications.",
    date: "March 12, 2025",
    readTime: "9 min read",
    category: "Python",
  },
]

export default function BlogPage() {
  return (
    <>
      <BackgroundGrid />
      <Header />
      
      <main className="container px-4 py-20 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Security Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert guides, tutorials, and best practices for code security and vulnerability scanning.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass-card p-6 rounded-xl hover:scale-[1.02] transition-transform"
            >
              <div className="mb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {post.category}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold mb-3 line-clamp-2">
                {post.title}
              </h2>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {post.date}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
                Read More
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </main>
      
      <Footer />
    </>
  )
}