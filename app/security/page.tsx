// app/security/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import { Shield, Lock, Server, Eye } from "lucide-react"

export const metadata = {
  title: "Security & Compliance - ProbCheck",
  description: "Learn about ProbCheck's security practices and compliance standards.",
}

export default function SecurityPage() {
  return (
    <>
      <BackgroundGrid />
      <Header />
      
      <main className="container px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Security & Compliance</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Your security is our priority. Here's how we protect your data.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          <div className="glass-card p-6 rounded-xl">
            <Shield className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
            <p className="text-sm text-muted-foreground">
              Bank-level encryption (AES-256) protects all data in transit and at rest.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <Lock className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Code Privacy</h3>
            <p className="text-sm text-muted-foreground">
              Your code is never stored permanently. Analyzed in memory and immediately deleted.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <Server className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Infrastructure</h3>
            <p className="text-sm text-muted-foreground">
              Hosted on secure cloud infrastructure with 99.9% uptime SLA.
            </p>
          </div>
          
          <div className="glass-card p-6 rounded-xl">
            <Eye className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Zero Data Retention</h3>
            <p className="text-sm text-muted-foreground">
              We don't log or store your source code. Only scan results are saved.
            </p>
          </div>
        </div>
        
        <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
          
          <h2 className="text-2xl font-semibold text-foreground">Compliance Standards</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>SOC 2 Type II certified</li>
            <li>GDPR compliant</li>
            <li>ISO 27001 standards</li>
            <li>Regular security audits</li>
          </ul>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Data Protection</h2>
          <p>
            All connections use HTTPS/TLS 1.3 encryption. We employ industry-standard security practices including regular penetration testing, vulnerability scanning, and security monitoring.
          </p>
          
          <h2 className="text-2xl font-semibold text-foreground mt-8">Report a Vulnerability</h2>
          <p>
            Found a security issue? We take security seriously. Please report vulnerabilities to:{" "}
            <a href="mailto:security@probcheck.in" className="text-primary hover:underline">
              security@probcheck.in
            </a>
          </p>
        </div>
      </main>
      
      <Footer />
    </>
  )
}