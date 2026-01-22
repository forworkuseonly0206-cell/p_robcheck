import type React from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { BackgroundGrid } from "./background-grid"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <BackgroundGrid />
      <DashboardSidebar />
      <main className="lg:pl-64">
        <div className="container px-4 md:px-8 py-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  )
}
