"use client"

import { motion } from "framer-motion"

const companies = [
  { name: "Microsoft", type: "microsoft" },
  { name: "Accenture" },
  { name: "Deloitte" },
  { name: "PwC" },
  { name: "McKinsey", type: "mckinsey" },
]

export function TrustedBySection() {
  return (
    <section className="py-16 border-y border-white/5 bg-black/10 relative overflow-hidden">
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-xs tracking-widest text-muted-foreground uppercase mb-10"
        >
          Used in production by security-conscious team(*Our Aim)
        </motion.p>

        {/* Logos / Wordmarks */}
        <div className="flex flex-wrap justify-center items-center gap-x-14 gap-y-6">
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="select-none"
            >
              {/* Microsoft special case */}
              {company.type === "microsoft" ? (
                <span className="brand-wordmark microsoft">
                  <span className="grid grid-cols-2 gap-0.5">
                    <span className="w-2.5 h-2.5 bg-[#F25022]" />
                    <span className="w-2.5 h-2.5 bg-[#7FBA00]" />
                    <span className="w-2.5 h-2.5 bg-[#00A4EF]" />
                    <span className="w-2.5 h-2.5 bg-[#FFB900]" />
                  </span>
                  <span>Microsoft</span>
                </span>
              ) : (
                <span
                  className={`brand-wordmark ${
                    company.type === "mckinsey" ? "mckinsey" : ""
                  }`}
                >
                  {company.name}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
