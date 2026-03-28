// app/terms/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"

export const metadata = {
  title: "Terms of Service - ProbCheck",
  description: "ProbCheck terms of service and usage agreement.",
}

export default function TermsPage() {
  return (
    <>
      <BackgroundGrid />
      <Header />
      
      <main className="container px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: March 2025</p>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          
          <h2 className="text-2xl font-semibold text-foreground">Agreement to Terms</h2>
          <p>
            By using ProbCheck, you agree to these terms. If you don't agree, please don't use our service.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Use of Service</h2>
          <p>You may use ProbCheck to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Scan your own code for security vulnerabilities</li>
            <li>Scan code you have permission to analyze</li>
            <li>Use scan results to improve your code security</li>
          </ul>
          
          <p className="mt-4">You may NOT:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Scan code you don't have permission to analyze</li>
            <li>Use the service for illegal purposes</li>
            <li>Attempt to hack or abuse the service</li>
            <li>Resell or redistribute our service</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Free Tier Limits</h2>
          <p>
            Free accounts include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>10 scans per month</li>
            <li>Files up to 10MB</li>
            <li>Basic vulnerability detection</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Accuracy Disclaimer</h2>
          <p>
            While ProbCheck strives for accuracy, no security scanner is perfect. We provide scan results "as is" without guarantees. You are responsible for reviewing and validating all findings.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Account Termination</h2>
          <p>
            We reserve the right to terminate accounts that violate these terms or engage in abusive behavior.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Changes to Terms</h2>
          <p>
            We may update these terms. Continued use of the service means you accept the updated terms.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Contact</h2>
          <p>
            Questions? Email us at{" "}
            <a href="mailto:legal@probcheck.in" className="text-primary hover:underline">
              legal@probcheck.in
            </a>
          </p>
        </div>
      </main>
      
      <Footer />
    </>
  )
}