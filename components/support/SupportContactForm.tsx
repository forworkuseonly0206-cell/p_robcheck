// components/support/SupportContactForm.tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Mail, Send, CheckCircle, AlertCircle, Zap } from 'lucide-react'

interface SupportContactFormProps {
  userEmail: string
  userName: string
  userId: string
  hasPrioritySupport: boolean
  planType: string
}

export function SupportContactForm({
  userEmail,
  userName,
  userId,
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
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userEmail,
          userName,
          subject,
          message,
          priority: hasPrioritySupport ? 'high' : 'normal'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send support request')
      }

      setSuccess(true)
      setSubject('')
      setMessage('')
      
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error('Support request error:', err)
      setError('Failed to send support request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSLAText = () => {
    switch (planType) {
      case 'enterprise':
        return '4-hour response time'
      case 'pro':
        return '24-hour response time'
      default:
        return '48-72 hour response time'
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
            {getSLAText()} • {hasPrioritySupport ? 'Priority' : 'Standard'} support
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
            Your support request has been sent! We'll respond within {getSLAText()}.
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
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
            💡 <strong>Upgrade to Pro</strong> for priority support with 24-hour response times
          </p>
        </div>
      )}
    </Card>
  )
}