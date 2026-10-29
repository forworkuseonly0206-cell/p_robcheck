// components/support/SupportContactForm.tsx  (COMPLETE FILE - replace the old one)
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { authFetch } from '@/lib/auth-fetch'
import { Mail, Send, CheckCircle, AlertCircle, Zap } from 'lucide-react'

// userEmail, userName and userId are still accepted (the parent page passes them),
// but they are no longer sent. The server finds out who you are from your login.
interface SupportContactFormProps {
  userEmail?: string
  userName?: string
  userId?: string
  hasPrioritySupport: boolean
  planType: string
}

export function SupportContactForm({
  hasPrioritySupport,
  planType
}: SupportContactFormProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!subject.trim() || !message.trim()) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await authFetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
          priority: hasPrioritySupport ? 'high' : 'normal'
        })
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || 'Failed to send support request')
      }

      setSuccess(true)
      setSubject('')
      setMessage('')

      setTimeout(() => setSuccess(false), 5000)
    } catch (err: any) {
      console.error('Support request error:', err)
      setError(err?.message || 'Failed to send support request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSLAText = () => {
    switch (planType) {
      case 'enterprise':
        return 'Dedicated support'
      case 'pro':
        return 'Priority support'
      default:
        return 'Standard support'
    }
  }

  return (
    <Card className="bg-card/50 border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2 font-mono">
            <Mail className="w-5 h-5 text-primary" />
            Contact Support
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {getSLAText()}
          </p>
        </div>

        {hasPrioritySupport && (
          <Badge className="bg-primary/10 text-primary border-primary/30">
            <Zap className="w-3 h-3 mr-1" />
            Priority Support
          </Badge>
        )}
      </div>

      {success && (
        <Alert className="mb-4 bg-primary/10 border-primary/30">
          <CheckCircle className="w-4 h-4 text-primary" />
          <AlertDescription className="text-primary">
            Your support request has been sent. We will get back to you by email.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="subject" className="font-mono">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief description of your issue"
            className="mt-2 bg-secondary border-border"
            maxLength={150}
            disabled={loading}
          />
        </div>

        <div>
          <Label htmlFor="message" className="font-mono">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide details about your issue or question..."
            rows={6}
            maxLength={5000}
            className="mt-2 bg-secondary border-border resize-none"
            disabled={loading}
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !subject.trim() || !message.trim()}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Support Request
            </>
          )}
        </Button>
      </form>

      {!hasPrioritySupport && (
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Upgrade to Pro</strong> to have your requests answered first.
          </p>
        </div>
      )}
    </Card>
  )
}