// app/contact/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import { Mail, MessageSquare, HelpCircle } from "lucide-react"

export const metadata = {
  title: "Contact Us - ProbCheck Support",
  description: "Get help with ProbCheck. Contact our support team for questions about vulnerability scanning.",
}

export default function ContactPage() {
  return (
    <>
      <BackgroundGrid />
      <Header />
      
      <main className="container px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Need help? We're here for you. Choose the best way to reach us.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Email Support */}
          <div className="glass-card p-6 rounded-xl">
            <Mail className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get help via email. We typically respond within 24 hours.
            </p>
            <a 
              href="mailto:support@probcheck.in"
              className="text-primary hover:underline text-sm font-medium"
            >
              support@probcheck.in
            </a>
          </div>
          
          {/* Documentation */}
          <div className="glass-card p-6 rounded-xl">
            <HelpCircle className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Documentation</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Find answers in our comprehensive docs and guides.
            </p>
            <a 
              href="/docs"
              className="text-primary hover:underline text-sm font-medium"
            >
              View Documentation →
            </a>
          </div>
          
          {/* Community */}
          <div className="glass-card p-6 rounded-xl">
            <MessageSquare className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join our community and get help from other developers.
            </p>
            <a 
              href="https://github.com/yourusername/probcheck/discussions"
              className="text-primary hover:underline text-sm font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Discussion →
            </a>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Is ProbCheck really free?</h3>
              <p className="text-muted-foreground">
                Yes! You can start scanning for free with no credit card required. We offer paid plans for teams that need advanced features.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">What languages does ProbCheck support?</h3>
              <p className="text-muted-foreground">
                We support JavaScript, Python, Java, PHP, Ruby, Go, C#, and more. Check our documentation for the full list.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Is my code kept private?</h3>
              <p className="text-muted-foreground">
                Absolutely. Your code is never shared or stored permanently. We take privacy seriously.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  )
}