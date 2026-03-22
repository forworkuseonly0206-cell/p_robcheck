// app/layout.tsx - FIXED
import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { AiTutor } from "@/components/common/ai-tutor"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://probcheck.in"),  // ✅ FIXED - correct domain
  title: {
    default: "ProbCheck – AI-Powered Vulnerability Scanner",
    template: "%s | ProbCheck",
  },
  description:
    "ProbCheck helps developers and companies find security bugs in source code using AI and vulnerability scanning. Upload your code, scan for vulnerabilities, and fix them before attackers exploit them.",
  keywords: [
    "AI vulnerability scanner",
    "bug bounty alternative",
    "scan code for security bugs",
    "AI security tool for developers",
    "code security",
    "vulnerability detection",
    "probcheck",
    "security scanner",
    "code scanner",
  ],
  authors: [{ name: "ProbCheck" }],
  creator: "ProbCheck",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://probcheck.in",  // ✅ FIXED
    siteName: "ProbCheck",
    title: "ProbCheck – AI-Powered Vulnerability Scanner",
    description: "Find security bugs in your code before hackers do. AI-powered vulnerability scanning for developers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ProbCheck",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProbCheck – AI-Powered Vulnerability Scanner",
    description: "Find security bugs in your code before hackers do. AI-powered vulnerability scanning for developers.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/icon.svg",
  },
  alternates: {
    canonical: "https://probcheck.in",  // ✅ ADDED
  },
}

export const viewport: Viewport = {
  themeColor: "#05070C",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <AiTutor />
      </body>
    </html>
  )
}