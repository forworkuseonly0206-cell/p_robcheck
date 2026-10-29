"use client"
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ContourArt, BUG, KEY, LINK } from "./contour-art"

const items = [
  { tag: "[ BUGS ]", title: "Catch the bug before it ships", body: "Surface injection flaws, unsafe input handling and risky patterns across your codebase.", d: BUG },
  { tag: "[ SECRETS ]", title: "Leaked keys, found early", body: "Hardcoded keys and tokens are flagged so you can rotate them before anyone else finds them.", d: KEY },
  { tag: "[ ATTACK CHAINS ]", title: "See how issues link together", body: "Attack chain analysis shows how separate issues combine into one real exploit path.", d: LINK },
]

// Pinned scroll: the page holds still while the art + text swap as you scroll.
export function PinnedLayers() {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const p = gsap.utils.toArray<HTMLElement>(".pl-panel")
      gsap.set(p, { autoAlpha: 0 }); gsap.set(p[0], { autoAlpha: 1 })
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=300%", pin: true, scrub: 0.6 } })
      p.forEach((el, i) => {
        if (!i) return
        tl.to(p[i - 1], { autoAlpha: 0, y: -40, duration: 1 })
          .fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1 }, "<0.3")
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="relative flex h-screen flex-col items-center justify-center border-t border-border px-4">
      <h2 className="mb-10 text-center text-4xl md:text-5xl">Built for every layer of your code</h2>
      <div className="relative h-[360px] w-full max-w-4xl">
        {items.map((it) => (
          <div key={it.tag} className="pl-panel absolute inset-0 grid items-center gap-8 md:grid-cols-2">
            <ContourArt d={it.d} className="mx-auto h-80" />
            <div>
              <p className="mono-label mb-3">{it.tag}</p>
              <h3 className="text-3xl md:text-4xl">{it.title}</h3>
              <p className="mt-4 text-muted-foreground">{it.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}