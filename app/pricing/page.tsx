// app/pricing/page.tsx
"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Zap, Building, Sparkles } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for individual developers and side projects.",
    badge: "Current",
    features: [
      { text: "5 scans per month", included: true },
      { text: "Basic vulnerability detection", included: true },
      { text: "Standard reports", included: true },
      { text: "Email support", included: true },
      { text: "GitHub integration", included: true },
      { text: "Team collaboration", included: false },
      { text: "CI/CD integration", included: false },
      { text: "Priority support", included: false },
      { text: "Custom rules", included: false },
    ],
    cta: "Get Started",
    href: "/scan",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For teams and growing companies with security needs.",
    badge: "Coming Soon",
    features: [
      { text: "Unlimited scans", included: true },
      { text: "Advanced AI detection", included: true },
       { text: "3x more accurate detection", included: true },
      { text: "Detailed reports with fixes", included: true },
      { text: "Priority email support", included: false },
      { text: "GitHub, GitLab, Bitbucket", included: true },
      { text: "Team collaboration (5 seats)", included: true },
      { text: "CI/CD pipeline integration", included: true },
      { text: "Priority support", included: true },
      { text: "Custom rules", included: false },
    ],
    cta: "Join Waitlist",
    href: "#",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations requiring maximum security and compliance.",
    badge: "Contact Us",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited team seats", included: true },
      { text: "Custom rule configuration", included: true },
      { text: "On-premise deployment option", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA guarantee", included: true },
      { text: "SSO/SAML integration", included: true },
      { text: "Compliance reports", included: true },
      { text: "24/7 phone support", included: true },
    ],
    cta: "Contact Sales",
    href: "#",
    highlighted: false,
  },
]

export default function PricingPage() {
  return (
    <>
      <BackgroundGrid />
      <Header />
      <main className="py-24 md:py-36">
        <div className="container px-4 md:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20 max-w-3xl mx-auto"
          >
            <Badge
              variant="outline"
              className="px-4 py-1.5 border-primary/30 bg-primary/5 text-primary font-medium mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Simple Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Start free, scale as you <span className="text-gradient">grow</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Begin securing your code for free. Upgrade when you need more power.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`glass-card rounded-2xl p-8 h-full flex flex-col relative ${
                    plan.highlighted ? "glow-md ring-1 ring-primary/30" : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-lg">Most Popular</Badge>
                    </div>
                  )}

                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      {plan.name === "Starter" && <Zap className="h-5 w-5 text-primary" />}
                      {plan.name === "Pro" && <Sparkles className="h-5 w-5 text-primary" />}
                      {plan.name === "Enterprise" && <Building className="h-5 w-5 text-primary" />}
                      <h2 className="text-xl font-bold">{plan.name}</h2>
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-4xl font-bold text-gradient">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                    <Badge variant="outline" className="mt-4 bg-white/5 text-muted-foreground border-white/10">
                      {plan.badge}
                    </Badge>
                  </div>

                  <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-3">
                        {feature.included ? (
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                            <X className="h-3 w-3 text-muted-foreground/50" />
                          </div>
                        )}
                        <span
                          className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/50"}`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.href}>
                    <Button
                      className={`w-full h-11 ${
                        plan.highlighted
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-sm"
                          : "bg-white/5 text-foreground hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* SEO Content */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-28 max-w-3xl mx-auto text-center"
          >
            <h2 className="text-2xl font-bold mb-5">More Affordable Than Traditional Bug Bounty Programs</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bug bounty programs typically cost thousands of dollars per vulnerability discovered. ProbCheck provides
              continuous, automated security scanning that catches common vulnerabilities before you need to pay bounty
              hunters. Use ProbCheck to maintain baseline security, then deploy targeted bug bounties for edge-case
              testing. It's the cost-effective, layered approach to application security.
            </p>
          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  )
}
