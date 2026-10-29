// app/pricing/page.tsx  (COMPLETE FILE - replace the old one)
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckoutButton } from "@/components/pricing/checkout-button"
import { PLANS, formatPrice, type Currency } from "@/lib/plans"
import { Check, X, Zap, Building, Sparkles } from "lucide-react"

type Feature = { text: string; included: boolean; soon?: boolean }

// Only list what really exists. Features still being built are marked "coming soon".
const starterFeatures: Feature[] = [
  { text: "1 free scan", included: true },
  { text: "Basic vulnerability detection", included: true },
  { text: "ZIP uploads and public repositories", included: true },
  { text: "Standard reports", included: true },
  { text: "Advanced AI scanner", included: false },
  { text: "Priority support", included: false },
]

const proFeatures: Feature[] = [
  { text: "Unlimited scans", included: true },
  { text: "Advanced AI scanner", included: true },
  { text: "Detailed reports with fixes", included: true },
  { text: "GitHub, GitLab and Bitbucket repositories", included: true },
  { text: "Priority support", included: true },
  { text: "Team collaboration", included: true, soon: true },
  { text: "CI/CD integration", included: true, soon: true },
]

const enterpriseFeatures: Feature[] = [
  { text: "Everything in Pro", included: true },
  { text: "Custom needs and integrations (on request)", included: true },
  { text: "Dedicated support", included: true },
]

function FeatureList({ features }: { features: Feature[] }) {
  return (
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feature) => (
        <li key={feature.text} className="flex items-start gap-3">
          {feature.included ? (
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="h-3 w-3 text-primary" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
              <X className="h-3 w-3 text-muted-foreground/50" />
            </div>
          )}
          <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground/60"}`}>
            {feature.text}
            {feature.soon && <span className="ml-2 text-xs text-muted-foreground">(coming soon)</span>}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function PricingPage() {
  const [currency, setCurrency] = useState<Currency>("USD")
  const [period, setPeriod] = useState<"pro_monthly" | "pro_yearly">("pro_monthly")

  // Default to rupees for visitors in India. They can switch at any time.
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz === "Asia/Calcutta" || tz === "Asia/Kolkata") setCurrency("INR")
    } catch {}
  }, [])

  const plan = PLANS[period]
  const price = formatPrice(plan.prices[currency], currency)

  const toggle = (active: boolean) =>
    `px-3 py-1 text-xs rounded-md transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`

  return (
    <>
      <BackgroundGrid />
      <Header />
      <main className="py-24 md:py-36">
        <div className="container px-4 md:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20 max-w-3xl mx-auto">
            <Badge variant="outline" className="px-4 py-1.5 border-primary/30 bg-primary/5 text-primary font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Simple Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl mb-6">Start free, upgrade when you need more</h1>
            <p className="text-xl text-muted-foreground">Try ProbCheck with one free scan. Go Pro for unlimited scans.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* STARTER */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="glass-card rounded-2xl p-8 h-full flex flex-col">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Starter</h2>
                  </div>
                  <div className="text-4xl font-bold mb-3">Free</div>
                  <p className="text-muted-foreground text-sm">For trying out ProbCheck on a project.</p>
                </div>
                <FeatureList features={starterFeatures} />
                <Link href="/scan">
                  <Button variant="outline" className="w-full h-11">Get started</Button>
                </Link>
              </div>
            </motion.div>

            {/* PRO */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="glass-card rounded-2xl p-8 h-full flex flex-col relative ring-1 ring-primary/30">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground shadow-lg">Most popular</Badge>
                </div>
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Pro</h2>
                  </div>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-4xl font-bold">{price}</span>
                    <span className="text-muted-foreground">{period === "pro_monthly" ? "/month" : "/year"}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">One-time payment. It does not renew by itself.</p>

                  <div className="flex flex-wrap gap-2">
                    <div className="inline-flex rounded-lg border border-border p-0.5">
                      <button className={toggle(period === "pro_monthly")} onClick={() => setPeriod("pro_monthly")}>Monthly</button>
                      <button className={toggle(period === "pro_yearly")} onClick={() => setPeriod("pro_yearly")}>Yearly</button>
                    </div>
                    <div className="inline-flex rounded-lg border border-border p-0.5">
                      <button className={toggle(currency === "INR")} onClick={() => setCurrency("INR")}>₹ INR</button>
                      <button className={toggle(currency === "USD")} onClick={() => setCurrency("USD")}>$ USD</button>
                    </div>
                  </div>
                </div>
                <FeatureList features={proFeatures} />
                <CheckoutButton planKey={period} currency={currency} label={`Get Pro for ${price}`} />
              </div>
            </motion.div>

            {/* ENTERPRISE */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="glass-card rounded-2xl p-8 h-full flex flex-col">
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Enterprise</h2>
                  </div>
                  <div className="text-4xl font-bold mb-3">Custom</div>
                  <p className="text-muted-foreground text-sm">For organizations with special requirements.</p>
                </div>
                <FeatureList features={enterpriseFeatures} />
                <Link href="/contact">
                  <Button variant="outline" className="w-full h-11">Contact us</Button>
                </Link>
              </div>
            </motion.div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-10 max-w-2xl mx-auto">
            Payments are processed securely by Razorpay. ProbCheck never sees or stores your card details.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}