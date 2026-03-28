// app/about/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"

export const metadata = {
  title: "About ProbCheck - AI Vulnerability Scanner",
  description: "Learn about ProbCheck, the AI-powered security scanner helping developers find vulnerabilities in code.",
}

export default function AboutPage() {
  return (
    <>
      <BackgroundGrid />
      <Header />
      
      <main className="container px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">About ProbCheck</h1>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          <p className="text-lg">
            ProbCheck is an AI-powered vulnerability scanner that helps developers find and fix security bugs before they reach production.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Our Mission</h2>
          <p>
            We believe every developer deserves access to enterprise-grade security tools. Our mission is to make security scanning fast, accurate, and accessible to everyone.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Why ProbCheck?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Free to start - No credit card required</li>
            <li>AI-powered analysis - Find bugs faster</li>
            <li>Multi-language support - JavaScript, Python, Java, PHP & more</li>
            <li>Instant results - Scan in seconds</li>
            <li>Privacy-focused - Your code stays private</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Trusted By Developers</h2>
          <p>
            Over 10,000 security teams and developers trust ProbCheck to keep their code secure. Join them today and start scanning for free.
          </p>
        </div>
      </main>
      
      <Footer />
    </>
  )
}