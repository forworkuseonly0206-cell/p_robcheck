// app/scan/page.tsx  (COMPLETE FILE - replace the old one)
"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ScanForm } from "@/components/scan/scan-form"
import { ScanTerminal } from "@/components/scan/scan-terminal"
import { ScanResults } from "@/components/scan/scan-results"
import { supabase, isSupabaseReady } from "@/lib/supabase"
import { AuthDialog } from "@/components/auth/auth-dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert, Sparkles } from "lucide-react"

const isDev = process.env.NEXT_PUBLIC_APP_ENV !== "production"

export default function ScanPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanId, setScanId] = useState<string | null>(null)
  const [lastReport, setLastReport] = useState<any | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseReady() || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    if (!supabase) return
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    setProfile(data)
  }

  const handleStartScan = async (formData: FormData, scanType: 'upload' | 'repository') => {
    if (!user || !supabase) {
      setScanError("Please sign in to start scanning")
      setShowAuthDialog(true)
      return
    }

    // Get the login token. The server uses it to know who you are (it does not trust a userId from here).
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token
    if (!token) {
      setScanError("Your session has expired. Please sign in again.")
      setShowAuthDialog(true)
      return
    }
    const authHeader = { Authorization: `Bearer ${token}` }

    if (
      !isDev &&
      profile?.plan_type === "free" &&
      profile?.scans_remaining <= 0
    ) {
      setScanError(
        "You've used your free scan. Upgrade to Pro for unlimited scans."
      )
      return
    }

    setIsScanning(true)
    setScanComplete(false)
    setScanId(null)
    setLastReport(null)
    setScanError(null)

    try {
      let response: Response

      if (scanType === 'repository') {
        const repositoryUrl = formData.get('repositoryUrl') as string
        const projectName = formData.get('projectName') as string
        const language = formData.get('language') as string

        response = await fetch('/api/scan/repository', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeader },
          body: JSON.stringify({
            repositoryUrl,
            projectName,
            language,
            // TEMPORARY: the repository route still reads userId from here.
            // Remove this line once that route is updated to use the token.
            userId: user.id,
          }),
        })
      } else {
        // Do NOT set Content-Type for file uploads; the browser sets it correctly
        response = await fetch('/api/scan', {
          method: "POST",
          headers: authHeader,
          body: formData,
        })
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null)

        if (response.status === 401) {
          setShowAuthDialog(true)
        }

        throw new Error(payload?.error || "Scan failed. Please try again.")
      }

      const report = await response.json()
      const id = report.scanId || `scan-${Date.now()}`

      setScanId(id)
      setLastReport(report)
      setScanComplete(true)

      loadProfile(user.id)
    } catch (error) {
      console.error('Scan error:', error)
      // Show the error and keep the form so the user can try again.
      // (No fake "report" is created, so a failed scan can never look like a clean one.)
      setScanError(error instanceof Error ? error.message : "Scan failed. Please try again.")
      setScanComplete(false)
      setLastReport(null)
      if (user) loadProfile(user.id)
    } finally {
      setIsScanning(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-8">
          <div className="space-y-4">
            <ShieldAlert className="h-16 w-16 mx-auto text-primary" />
            <h2 className="text-2xl font-bold">Sign in to start scanning</h2>
            <p className="text-muted-foreground">
              Create a free account to scan your code for security vulnerabilities
            </p>
          </div>

          <Button onClick={() => setShowAuthDialog(true)} size="lg">
            Sign In / Sign Up
          </Button>

          <AuthDialog
            open={showAuthDialog}
            onOpenChange={setShowAuthDialog}
            mode="signin"
          />
        </div>
      </DashboardLayout>
    )
  }

  const scansRemaining =
    isDev && profile?.plan_type === "free"
      ? Infinity
      : profile?.scans_remaining ?? 0

  const isPro = profile?.plan_type === 'pro' || profile?.plan_type === 'enterprise'

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono">New Security Scan</h1>
            <p className="text-muted-foreground">
              Upload your code to start scanning for vulnerabilities.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Scanner Tier Badge */}
            {isPro ? (
              <div className="glass-card px-4 py-2 rounded-lg border border-primary/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Advanced Scanner
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Deep analysis active
                </p>
              </div>
            ) : (
              <div className="glass-card px-4 py-2 rounded-lg border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="text-sm font-medium">
                    Basic Scanner
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Standard scanning
                </p>
              </div>
            )}

            {/* Scans Remaining (Free tier only) */}
            {profile?.plan_type === "free" && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Scans remaining</p>
                <p className="text-2xl font-bold text-primary">
                  {isDev ? "∞ (dev)" : scansRemaining}
                </p>

                {!isDev && scansRemaining <= 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => (window.location.href = "/pricing")}
                    className="mt-2"
                  >
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {scanError && (
          <Alert variant="destructive">
            <AlertDescription>{scanError}</AlertDescription>
          </Alert>
        )}

        {!scanComplete && (
          <div className="grid lg:grid-cols-2 gap-6">
            <ScanForm onStartScan={handleStartScan} isScanning={isScanning} />
            <ScanTerminal isScanning={isScanning} />
          </div>
        )}

        {scanComplete && lastReport && (
          <ScanResults
            scanId={scanId || `scan-${Date.now()}`}
            report={lastReport}
            scannerTier={lastReport.scannerTier}
          />
        )}
      </div>
    </DashboardLayout>
  )
}