// app/layout.tsx
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
  metadataBase: new URL("https://probcheck.in"),
  
  title: {
    default: "ProbCheck - AI Vulnerability Scanner | Find Security Bugs in Code",
    template: "%s | ProbCheck",
  },
  
  description:
    "Free AI-powered vulnerability scanner that finds security bugs in your code instantly. Scan JavaScript, Python, Java, PHP & more. No signup required. Trusted by 10,000+ developers.",
  
  keywords: [
    "vulnerability scanner",
    "code security scanner",
    "AI security tool",
    "security testing",
    "find security bugs",
    "scan code for vulnerabilities",
    "probcheck",
    "free vulnerability scanner online",
    "AI powered code scanner",
    "automated security testing",
    "find bugs in code online",
    "security scanner for developers",
    "javascript security scanner",
    "python vulnerability scanner",
    "java code security",
    "php security checker",
  ],
  
  authors: [{ name: "ProbCheck" }],
  creator: "ProbCheck",
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://probcheck.in",
    siteName: "ProbCheck",
    title: "ProbCheck - Find Security Bugs in Code with AI",
    description: "Free AI-powered scanner that finds security vulnerabilities instantly. No signup required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ProbCheck - AI Security Scanner",
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "ProbCheck - AI Vulnerability Scanner",
    description: "Find security bugs in code instantly. Free AI-powered scanner.",
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
    icon: "/favicon.ico",
  },
  
  alternates: {
    canonical: "https://probcheck.in",
  },
}

export const viewport: Viewport = {
  themeColor: "#06B6D4",
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