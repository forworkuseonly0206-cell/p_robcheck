// app/settings/page.tsx - WITH SUBSCRIPTION DISPLAY
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Trash2, 
  LogOut, 
  Save, 
  User, 
  Mail, 
  Shield, 
  Bell, 
  Key, 
  AlertTriangle,
  Smartphone,
  Monitor,
  CheckCircle,
  Crown,
  Zap
} from 'lucide-react'
import { PasswordChangeModal } from '@/components/settings/PasswordChangeModal'
import { ActiveSessionsModal } from '@/components/settings/ActiveSessionsModal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

interface UserSettings {
  email_notifications: boolean
  scan_complete_notifications: boolean
  scan_limit_notifications: boolean
  security_alerts: boolean
  weekly_summary: boolean
}

interface ProfileStats {
  total_scans: number
  files_scanned: number
  vulnerabilities_found: number
  created_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<ProfileStats>({
    total_scans: 0,
    files_scanned: 0,
    vulnerabilities_found: 0,
    created_at: new Date().toISOString()
  })
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    scan_complete_notifications: true,
    scan_limit_notifications: true,
    security_alerts: true,
    weekly_summary: false,
  })
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSessionsModal, setShowSessionsModal] = useState(false)
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadUserAndSettings()
  }, [])

  async function loadUserAndSettings() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)
      setEmail(user.email || '')

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || '')
        
        setStats(prev => ({
          ...prev,
          created_at: profileData.created_at || new Date().toISOString()
        }))
      }

      await loadStatsFromScans(user.id)

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error)
      }

      if (data) {
        setSettings({
          email_notifications: data.email_notifications ?? true,
          scan_complete_notifications: data.scan_complete_notifications ?? true,
          scan_limit_notifications: data.scan_limit_notifications ?? true,
          security_alerts: data.security_alerts ?? true,
          weekly_summary: data.weekly_summary ?? false,
        })
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadStatsFromScans(userId: string) {
    try {
      const { data: scans, error } = await supabase
        .from('scans')
        .select('*')
        .eq('user_id', userId)

      if (error || !scans || scans.length === 0) {
        return
      }

      const totalScans = scans.length
      
      const totalFiles = scans.reduce((sum, scan) => {
        const files = scan.total_files_scanned || 
                     scan.files_scanned || 
                     scan.filesScanned || 
                     0
        return sum + files
      }, 0)

      const totalVulns = scans.reduce((sum, scan) => {
        if (scan.vulnerabilities_found !== undefined) {
          return sum + (scan.vulnerabilities_found || 0)
        }
        
        if (scan.summary) {
          const vulns = (scan.summary.critical || 0) + 
                       (scan.summary.high || 0) + 
                       (scan.summary.medium || 0) + 
                       (scan.summary.low || 0)
          return sum + vulns
        }
        
        return sum
      }, 0)

      setStats(prev => ({
        ...prev,
        total_scans: totalScans,
        files_scanned: totalFiles,
        vulnerabilities_found: totalVulns
      }))
    } catch (error) {
      console.error('Error loading stats from scans:', error)
    }
  }

  async function handleSaveProfile() {
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveSettings() {
    if (!user) return

    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email_notifications: settings.email_notifications,
          scan_complete_notifications: settings.scan_complete_notifications,
          scan_limit_notifications: settings.scan_limit_notifications,
          security_alerts: settings.security_alerts,
          weekly_summary: settings.weekly_summary,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      setMessage({ type: 'error', text: 'Failed to sign out' })
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm' })
      return
    }

    if (!user) return

    try {
      setSaving(true)
      await supabase.from('profiles').delete().eq('id', user.id)
      await supabase.from('scans').delete().eq('user_id', user.id)
      await supabase.from('user_settings').delete().eq('user_id', user.id)
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      setMessage({ type: 'error', text: 'Failed to delete account' })
      setSaving(false)
    }
  }

  const toggleSetting = (key: keyof UserSettings) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [key]: !prevSettings[key]
    }))
  }

  // ✅ Get plan badge
  const getPlanBadge = () => {
    const planType = profile?.plan_type || 'free'
    switch (planType) {
      case 'pro':
        return <Badge className="bg-primary/10 text-primary border-primary/30"><Crown className="w-3 h-3 mr-1" />Pro</Badge>
      case 'enterprise':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30"><Zap className="w-3 h-3 mr-1" />Enterprise</Badge>
      default:
        return <Badge variant="outline">Free</Badge>
    }
  }

  // ✅ Get scans remaining text
  const getScansRemainingText = () => {
    const planType = profile?.plan_type || 'free'
    if (planType === 'pro' || planType === 'enterprise') {
      return 'Unlimited'
    }
    return `${profile?.scans_remaining || 0} / 1`
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

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold font-mono">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* ✅ Subscription Card - NEW */}
        <Card className="bg-card/50 border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 font-mono">
                <Crown className="w-5 h-5 text-primary" />
                Subscription Plan
              </h2>
              <div className="flex items-center gap-3 mt-3">
                <div className="text-3xl font-bold font-mono capitalize">
                  {profile?.plan_type || 'Free'}
                </div>
                {getPlanBadge()}
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span><strong>Scans:</strong> {getScansRemainingText()} this month</span>
                </div>
                {(profile?.plan_type === 'pro' || profile?.plan_type === 'enterprise') && (
                  <>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Advanced AI detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>CI/CD integration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span>Priority support (24hr response)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {profile?.plan_type === 'free' && (
              <div className="text-center">
                <Link href="/pricing">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-2">
                  Unlimited scans + more
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Profile Section */}
        <Card className="bg-card/50 border-border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 font-mono">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="font-mono">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 bg-secondary border-border"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label className="font-mono">Email Address</Label>
              <div className="mt-2 flex items-center gap-2 px-4 py-3 bg-secondary/50 border border-border rounded-lg">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{email}</span>
                <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Email cannot be changed for security reasons
              </p>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <Card className="bg-card/50 border-border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 font-mono">
            <Shield className="w-5 h-5 text-primary" />
            Account Statistics
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-primary font-mono">
                {stats.total_scans}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Total Scans</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-accent font-mono">
                {stats.files_scanned}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Files Scanned</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-4 border border-border">
              <div className="text-2xl font-bold text-chart-3 font-mono">
                {new Date(stats.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
              <div className="text-sm text-muted-foreground mt-1">Member Since</div>
            </div>
          </div>
        </Card>

        {/* Email Notifications - Keep existing code */}
        <Card className="bg-card/50 border-border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 font-mono">
              <Bell className="w-5 h-5 text-primary" />
              Email Notifications
            </h2>
            <p className="text-muted-foreground text-sm">
              Control when you receive email notifications
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 bg-secondary/30 rounded-lg border border-border">
              <div className="flex-1">
                <div className="font-medium mb-1 font-mono">Enable Email Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Master switch for all email notifications
                </div>
              </div>
              <button
                onClick={() => toggleSetting('email_notifications')}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.email_notifications ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                    settings.email_notifications ? 'translate-x-7' : ''
                  }`}
                />
              </button>
            </div>

            <div className={`space-y-3 ${!settings.email_notifications ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-start justify-between p-4 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors border border-border/50">
                <div className="flex-1">
                  <div className="font-medium mb-1 font-mono">Scan Complete Notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified when security scans finish
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('scan_complete_notifications')}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    settings.scan_complete_notifications ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.scan_complete_notifications ? 'translate-x-7' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between p-4 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors border border-border/50">
                <div className="flex-1">
                  <div className="font-medium mb-1 font-mono">Scan Limit Alerts</div>
                  <div className="text-sm text-muted-foreground">
                    Notifications when approaching scan limits
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('scan_limit_notifications')}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    settings.scan_limit_notifications ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.scan_limit_notifications ? 'translate-x-7' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-start justify-between p-4 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors border border-border/50">
                <div className="flex-1">
                  <div className="font-medium mb-1 flex items-center gap-2 font-mono">
                    Security Alerts
                    <Badge variant="destructive" className="text-xs">Recommended</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Immediate alerts for critical vulnerabilities
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('security_alerts')}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    settings.security_alerts ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                      settings.security_alerts ? 'translate-x-7' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </div>
        </Card>

        {/* Security & Privacy */}
        <Card className="bg-card/50 border-border p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 font-mono">
            <Key className="w-5 h-5 text-primary" />
            Security & Privacy
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
              <div>
                <div className="font-medium mb-1 font-mono">Password</div>
                <div className="text-sm text-muted-foreground">
                  Change your account password
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowPasswordModal(true)}
                className="border-border"
              >
                Change Password
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
              <div>
                <div className="font-medium mb-1 flex items-center gap-2 font-mono">
                  <Smartphone className="w-4 h-4" />
                  Two-Factor Authentication
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    Coming Soon
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Add an extra layer of security with 2FA
                </div>
              </div>
              <Button
                variant="outline"
                disabled
                className="border-border opacity-50 cursor-not-allowed"
              >
                Coming Soon
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
              <div>
                <div className="font-medium mb-1 flex items-center gap-2 font-mono">
                  <Monitor className="w-4 h-4" />
                  Active Sessions
                </div>
                <div className="text-sm text-muted-foreground">
                  Manage your active login sessions
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowSessionsModal(true)}
                className="border-border"
              >
                View Sessions
              </Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-destructive/5 border-destructive/20 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-destructive font-mono">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
              <div>
                <div className="font-medium mb-1 font-mono">Sign Out</div>
                <div className="text-sm text-muted-foreground">
                  Sign out from your current session
                </div>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="border-border">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>

            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="mb-4">
                <div className="font-medium text-destructive mb-1 font-mono">Delete Account</div>
                <div className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </div>
              </div>

              {!showDeleteConfirm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label className="font-mono">
                      Type <span className="text-destructive font-bold">DELETE</span> to confirm
                    </Label>
                    <Input
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      className="mt-2 bg-background border-destructive/50"
                      placeholder="Type DELETE"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmText !== 'DELETE' || saving}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {saving ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowDeleteConfirm(false)
                        setDeleteConfirmText('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={() => {
          setMessage({ type: 'success', text: 'Password changed successfully!' })
          setTimeout(() => setMessage(null), 3000)
        }}
      />

      <ActiveSessionsModal
        isOpen={showSessionsModal}
        onClose={() => setShowSessionsModal(false)}
      />
    </DashboardLayout>
  )
}