// componets/layout/dasboard-layout.tsx
import type React from "react"
import { memo } from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { BackgroundGrid } from "./background-grid"

// ✅ Memoize to prevent unnecessary re-renders
const MemoizedSidebar = memo(DashboardSidebar)
const MemoizedGrid = memo(BackgroundGrid)

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <MemoizedGrid />
      <MemoizedSidebar />
      <main className="lg:pl-64">
        <div className="container px-4 md:px-8 py-8 pt-16 lg:pt-8">{children}</div>
      </main>
    </div>
  )
}
