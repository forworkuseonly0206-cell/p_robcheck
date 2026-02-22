// components/layout/dashboard-sidebar.tsx - WITH INTEGRATIONS
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, Scan, FileText, BookOpen, Settings, Menu, LogOut, CreditCard, Code2 } from "lucide-react"
import { useState, useCallback, memo } from "react"
import { Logo } from "@/components/ui/logo"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scan", label: "Run Scan", icon: Scan },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/integrations", label: "Integrations", icon: Code2 }, // ✅ ADDED
  { href: "/docs", label: "Documentation", icon: BookOpen },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
]

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
]

const SidebarContent = memo(({ onNavigate }: { onNavigate?: () => void }) => {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push('/')
    onNavigate?.()
  }, [router, onNavigate])

  return (
    <div className="flex flex-col h-full">
      <Link href="/" className="flex items-center gap-2 px-5 py-5 border-b border-white/5" onClick={onNavigate}>
        <Logo size="sm" animated={false} />
      </Link>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm",
                  isActive
                    ? "bg-primary/10 text-primary glow-sm"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-5 border-t border-white/5 space-y-1">
        {bottomItems.map((item) => (
          <Link key={item.label} href={item.href} onClick={onNavigate}>
            <motion.div
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all duration-200 font-medium text-sm"
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </motion.div>
          </Link>
        ))}
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all duration-200 font-medium text-sm"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign Out
        </button>
      </div>
    </div>
  )
})

SidebarContent.displayName = 'SidebarContent'

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleNavigate = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="glass border-white/10 bg-transparent">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 glass border-white/5">
            <SidebarContent onNavigate={handleNavigate} />
          </SheetContent>
        </Sheet>
      </div>

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 glass border-r border-white/5 flex-col">
        <SidebarContent />
      </aside>
    </>
  )
}