// components/settings/ActiveSessionsModal.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Monitor, Smartphone, Tablet, MapPin, Clock, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Session {
  id: string
  user_agent: string
  ip: string
  created_at: string
  last_active: string
  is_current: boolean
}

interface ActiveSessionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ActiveSessionsModal({ isOpen, onClose }: ActiveSessionsModalProps) {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])
  const [error, setError] = useState('')
  const [revoking, setRevoking] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadSessions()
    }
  }, [isOpen])

  async function loadSessions() {
    setLoading(true)
    setError('')

    try {
      // Get current session info
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError

      // Since Supabase doesn't provide a direct way to list all sessions,
      // we'll show the current session
      if (session) {
        const currentSession: Session = {
          id: session.access_token.substring(0, 16),
          user_agent: navigator.userAgent,
          ip: 'Current device',
          created_at: new Date(session.user.created_at).toISOString(),
          last_active: new Date().toISOString(),
          is_current: true,
        }

        setSessions([currentSession])
      }
    } catch (err: any) {
      console.error('Load sessions error:', err)
      setError('Failed to load active sessions')
    } finally {
      setLoading(false)
    }
  }

  async function revokeSession(sessionId: string) {
    setRevoking(sessionId)
    setError('')

    try {
      await supabase.auth.signOut()
      onClose()
    } catch (err: any) {
      console.error('Revoke session error:', err)
      setError('Failed to revoke session')
    } finally {
      setRevoking(null)
    }
  }

  function getDeviceIcon(userAgent: string) {
    const ua = userAgent.toLowerCase()
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5 text-primary" />
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="w-5 h-5 text-primary" />
    }
    return <Monitor className="w-5 h-5 text-primary" />
  }

  function getDeviceName(userAgent: string) {
    const ua = userAgent.toLowerCase()
    if (ua.includes('chrome')) return 'Chrome Browser'
    if (ua.includes('firefox')) return 'Firefox Browser'
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari Browser'
    if (ua.includes('edge')) return 'Edge Browser'
    return 'Unknown Browser'
  }

  function getLocation(ip: string) {
    // In a real app, you'd use an IP geolocation service
    return ip === 'Current device' ? 'Your location' : 'Unknown location'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono">
            <Monitor className="w-5 h-5 text-primary" />
            Active Sessions
          </DialogTitle>
          <DialogDescription>
            Manage devices where you're currently signed in
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-secondary/30 border border-border rounded-lg p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getDeviceIcon(session.user_agent)}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium font-mono">
                            {getDeviceName(session.user_agent)}
                          </h3>
                          {session.is_current && (
                            <Badge className="bg-primary/10 text-primary border-primary/30">
                              Current
                            </Badge>
                          )}
                        </div>
                        {!session.is_current && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => revokeSession(session.id)}
                            disabled={revoking === session.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {revoking === session.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                Revoke
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          <span>{getLocation(session.ip)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>
                            Last active: {new Date(session.last_active).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {session.is_current && (
                        <p className="text-xs text-muted-foreground">
                          This is your current session. You can't revoke it.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Alert className="bg-primary/10 border-primary/30">
            <AlertCircle className="w-4 h-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>Security Tip:</strong> If you see any sessions you don't recognize, 
              revoke them immediately and change your password.
            </AlertDescription>
          </Alert>

          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-border"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}