"use client"

import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { RecentScansTable } from "@/components/dashboard/recent-scans-table"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { supabase, isSupabaseReady } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Define the Scan type
interface Scan {
  id: string
  user_id: string | null
  scan_name: string
  repository_name?: string
  status: string
  vulnerabilities_found: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  created_at: string
  [key: string]: any
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [scans, setScans] = useState<Scan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  // 🔥 AUTO-REFRESH WHEN SCANS ARE RUNNING OR PENDING
  useEffect(() => {
    if (!user) return

    if (scans.some(s => s.status === 'scanning' || s.status === 'pending')) {
      const interval = setInterval(() => {
        loadScans(user.id)
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [scans, user])

  const checkAuth = async () => {
    if (!isSupabaseReady() || !supabase) {
      setLoading(false)
      router.push('/')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      router.push('/')
      return
    }

    setUser(session.user)
    await loadProfile(session.user.id)
    await loadScans(session.user.id)
    setLoading(false)
  }

  const loadProfile = async (userId: string) => {
    if (!supabase) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    setProfile(data)
  }

  const loadScans = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/scans?userId=${userId}`)
      const data = await response.json()

      if (data.scans) {
        setScans(data.scans)
      }
    } catch (error) {
      console.error('Error loading scans:', error)
    }
  }

  const handleRefresh = async () => {
    if (!user) return

    setRefreshing(true)
    await loadScans(user.id)
    await loadProfile(user.id)
    setRefreshing(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold font-mono">
                  Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Operator'}.
                </h1>
              </div>
              <p className="text-muted-foreground mt-2">
                Monitor your projects and security posture from one console.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm text-muted-foreground font-mono">
                  Systems Operational
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="border-white/10 hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <StatsCards scans={scans} />

        {/* Quick Actions */}
        <QuickActions />

        {/* Charts and Tables */}
        <div className="grid lg:grid-cols-2 gap-6">
          <TrendChart scans={scans} />
          <div className="lg:col-span-2">
            <RecentScansTable scans={scans} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
