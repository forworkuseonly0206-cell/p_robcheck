// app/page.tsx
'use client'

import Script from 'next/script'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import { HeroSection } from "@/components/landing/hero-section"
import { TrustedBySection } from "@/components/landing/trusted-by-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { AttackStorySection } from "@/components/landing/attack-story-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ProbCheck",
    description:
      "AI-powered vulnerability scanner for developers. Find security bugs in your code before hackers do.",
    url: "https://ProbCheck.ai",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "127",
    },
  }

  return (
    <>
      {/* SEO: Schema.org JSON-LD */}
      <Script
        id="schema-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BackgroundGrid />
      <Header />

      <main>
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <AttackStorySection />
        <HowItWorksSection />
      </main>

      <Footer />
    </>
  )
}
