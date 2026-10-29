// components/landing/hero-section.tsx
"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CornerBrackets } from "@/components/ui/corner-brackets"
import { WireShield } from "./wire-shield"
import Matter from "matter-js"

// Sample findings for illustration only
const chips = [
  { label: "SQL injection", sev: "HIGH", pos: "left-[4%] top-[14%]", delay: 0 },
  { label: "Hardcoded API key", sev: "CRITICAL", pos: "right-[4%] top-[38%]", delay: 1.2 },
  { label: "Outdated dependency", sev: "MEDIUM", pos: "left-[8%] bottom-[12%]", delay: 2.4 },
]

export function HeroSection() {
  const sceneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sceneRef.current) return

    // Matter.js Module Aliases
    const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Bodies = Matter.Bodies,
      Composite = Matter.Composite,
      Mouse = Matter.Mouse,
      MouseConstraint = Matter.MouseConstraint

    // Setup Engine & Render
    const engine = Engine.create()
    const width = sceneRef.current.clientWidth
    const height = 420

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        background: "transparent",
        wireframes: false,
      },
    })

    // Create Boundaries (Floor and invisible walls)
    const ground = Bodies.rectangle(width / 2, height + 25, width, 50, { isStatic: true })
    const wallLeft = Bodies.rectangle(-25, height / 2, 50, height, { isStatic: true })
    const wallRight = Bodies.rectangle(width + 25, height / 2, 50, height, { isStatic: true })

    // Create 20 falling cyber-tokens (circles and polygons)
    const shapes = Array.from({ length: 20 }).map(() => {
      const isCircle = Math.random() > 0.5
      const size = Math.random() * 15 + 10 // Random sizes
      const x = Math.random() * (width - 100) + 50
      const y = Math.random() * -500 - 50 // Drop from above the container
      
      const options = {
        restitution: 0.7, // Bounciness
        friction: 0.1,
        render: {
          fillStyle: Math.random() > 0.5 ? '#c8f56a' : '#1e2d10',
          strokeStyle: '#c8f56a',
          lineWidth: 2
        }
      }
      
      return isCircle 
        ? Bodies.circle(x, y, size, options)
        : Bodies.polygon(x, y, Math.floor(Math.random() * 3) + 3, size, options)
    })

    // Enable Mouse Interaction
    const mouse = Mouse.create(render.canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    })
    
// Prevent the canvas from hijacking normal page scrolling
    const matterMouse = mouseConstraint.mouse as any;
    matterMouse.element.removeEventListener("mousewheel", matterMouse.mousewheel);
    matterMouse.element.removeEventListener("DOMMouseScroll", matterMouse.mousewheel);

    // Add everything to the world
    Composite.add(engine.world, [ground, wallLeft, wallRight, ...shapes, mouseConstraint])

    // Run the engine
    Render.run(render)
    const runner = Runner.create()
    Runner.run(runner, engine)

    // Cleanup on unmount
    return () => {
      Render.stop(render)
      Runner.stop(runner)
      if (render.canvas) render.canvas.remove()
      Matter.World.clear(engine.world, false)
      Matter.Engine.clear(engine)
    }
  }, [])

  return (
    <section className="relative border-b border-border py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mono-label mb-6">[ AI code vulnerability scanner ]</p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl"
          >
            Find security holes
            <br />
            before attackers do
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
          >
            ProbCheck scans your codebase, shows how issues chain into real attack paths, and tells you what to fix first.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="mt-8 flex items-center justify-center gap-5"
          >
            <Link href="/scan">
              <Button size="lg" className="px-6">Start free scan <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
            <Link href="/docs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              View documentation
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <CornerBrackets>
            {/* Added ref={sceneRef} here to bind the Matter.js canvas */}
            <div ref={sceneRef} className="halftone relative flex h-[420px] items-center justify-center overflow-hidden rounded-3xl bg-[#143010]">
              
              {/* Ensure HTML elements are above the canvas physics layer */}
              <div className="pointer-events-none absolute inset-0 z-10">
                <div className="absolute inset-0 grid-pattern opacity-60" />
                <WireShield />
                {chips.map((c) => (
                  <motion.div
                    key={c.label}
                    animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, delay: c.delay, ease: "easeInOut" }}
                    className={`absolute ${c.pos} rounded-md bg-[#eaf5e4] px-3 py-2 font-mono text-[11px] text-[#050a04] shadow-xl`}
                  >
                    <span className="font-bold">{c.sev}</span> &middot; {c.label}
                  </motion.div>
                ))}
              </div>

            </div>
          </CornerBrackets>
          <p className="mono-label mt-3 text-center">Illustration. Sample findings only.</p>
        </motion.div>
      </div>
    </section>
  )
}