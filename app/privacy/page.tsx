// app/privacy/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"

export const metadata = {
  title: "Privacy Policy - ProbCheck",
  description: "Learn how ProbCheck protects your data and respects your privacy.",
}

export default function PrivacyPage() {
  return (
    <>
      <BackgroundGrid />
      <Header />
      
      <main className="container px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 2025</p>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          
          <h2 className="text-2xl font-semibold text-foreground">Your Privacy Matters</h2>
          <p>
            At ProbCheck, we take your privacy seriously. This policy explains how we collect, use, and protect your information.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (email, name)</li>
            <li>Usage data (scans performed, features used)</li>
            <li>Technical data (IP address, browser type)</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and improve our security scanning service</li>
            <li>Send important updates about your account</li>
            <li>Analyze usage to improve our product</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Your Code is Private</h2>
          <p>
            <strong>We never store your source code permanently.</strong> Code is analyzed in memory and immediately deleted after scanning. We do not share, sell, or use your code for any purpose other than providing scan results.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Data Security</h2>
          <p>
            We use industry-standard encryption and security measures to protect your data. All connections are encrypted with HTTPS/TLS.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Delete your account and data</li>
            <li>Opt-out of marketing emails</li>
            <li>Export your scan history</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Contact Us</h2>
          <p>
            Questions about privacy? Contact us at{" "}
            <a href="mailto:privacy@probcheck.in" className="text-primary hover:underline">
              privacy@probcheck.in
            </a>
          </p>
        </div>
      </main>
      
      <Footer />
    </>
  )
}