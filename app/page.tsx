// app/page.tsx (COMPLETE FILE - replace the old one)
'use client'

import Script from 'next/script'
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BackgroundGrid } from "@/components/layout/background-grid"
import { SmoothScroll } from "@/components/layout/smooth-scroll"
import { HeroSection } from "@/components/landing/hero-section"
import { CheckMarquee } from "@/components/landing/check-marquee"
import { FeaturesSection } from "@/components/landing/features-section"
import { ScrollStory } from "@/components/landing/scroll-story"
import { AttackStorySection } from "@/components/landing/attack-story-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { ExtensionSection } from "@/components/landing/extension-section"

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ProbCheck",
    description: "AI-powered vulnerability scanner for developers. Find security bugs in your code before hackers do.",
    url: "https://probcheck.in",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  }

  return (
    <>
      <Script id="schema-org" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SmoothScroll />
      <BackgroundGrid />
      <Header />
      <main>
        <HeroSection />
        <CheckMarquee />
        <ScrollStory />
        <FeaturesSection />
        <AttackStorySection />
        <ExtensionSection />
        <HowItWorksSection />
      </main>
      <Footer />
    </>
  )
}