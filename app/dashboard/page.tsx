// app/dashboard/page.tsx  (COMPLETE FILE - replace the old one)
"use client"

import { useState, useEffect, useRef } from 'react'
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { RecentScansTable } from "@/components/dashboard/recent-scans-table"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { supabase, isSupabaseReady } from '@/lib/supabase'
import { authFetch } from '@/lib/auth-fetch'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

  // Refs prevent multiple polling intervals
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const isPollingRef = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    checkAuth()

    return () => {
      isMountedRef.current = false
      isPollingRef.current = false

      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  // Poll for updates only while a scan is running
  useEffect(() => {
    if (!user?.id) return

    const activeCount = scans.filter(s => s.status === "scanning" || s.status === "pending").length
    const shouldPoll = activeCount > 0

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      isPollingRef.current = false
    }

    if (shouldPoll && !isPollingRef.current) {
      isPollingRef.current = true

      intervalRef.current = setInterval(() => {
        if (isMountedRef.current && user?.id) {
          loadScans()
        }
      }, 10000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        isPollingRef.current = false
      }
    }
  }, [user?.id, scans.length, scans.filter(s => s.status === "scanning" || s.status === "pending").length])

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
    await loadScans()
    setLoading(false)
  }

  const loadProfile = async (userId: string) => {
    if (!isMountedRef.current) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (isMountedRef.current) {
      setProfile(data)
    }
  }

  // CHANGED: no user id is sent. The server works out who you are from your login token.
  const loadScans = async () => {
    if (!isMountedRef.current) return

    try {
      const response = await authFetch('/api/user/scans', {
        headers: { 'Cache-Control': 'no-cache' },
      })

      if (response.status === 401) {
        router.push('/')
        return
      }

      if (!response.ok) {
        console.error('❌ Scan fetch failed:', response.status)
        return
      }

      const data = await response.json()

      if (data.scans && isMountedRef.current) {
        setScans(data.scans)
      }
    } catch (error) {
      console.error('❌ Error loading scans:', error)
    }
  }

  const handleRefresh = async () => {
    if (!user) return

    setRefreshing(true)
    await loadScans()
    await loadProfile(user.id)
    setRefreshing(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-mono">
              Welcome back, {profile?.full_name || user?.email?.split('@')[0]}
            </h1>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        <StatsCards scans={scans} />
        <QuickActions />

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