//components/layout/smooth-scroll.tsx
"use client"
import { useEffect } from "react"
import Lenis from "@studio-freight/lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Smooth, eased scrolling (the "glide" feel) kept in sync with GSAP ScrollTrigger.
export function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ lerp: 0.1 })
    lenis.on("scroll", ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => { gsap.ticker.remove(tick); lenis.destroy() }
  }, [])
  return null
}