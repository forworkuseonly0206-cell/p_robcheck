// components/pricing/upgrade-modal.tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Zap, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason?: string
}

export function UpgradeModal({ open, onOpenChange, reason }: UpgradeModalProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleJoinWaitlist = async () => {
    if (!email) return

    setLoading(true)
    
    try {
      // Save to waitlist (you can add this to Supabase later)
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "upgrade_modal" })
      })

      setSubmitted(true)
    } catch (error) {
      console.error("Failed to join waitlist:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        {!submitted ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <DialogTitle>Upgrade to Pro</DialogTitle>
              </div>
              <DialogDescription>
                {reason || "Unlock unlimited scans and advanced AI detection"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Pricing */}
              <div className="glass-card p-6 rounded-lg">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold text-gradient">$29</span>
                  <span className="text-muted-foreground">/month</span>
                  <Badge variant="outline" className="ml-auto">Coming Soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Professional security scanning for growing teams
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Unlimited Scans</p>
                    <p className="text-sm text-muted-foreground">
                      Scan as many repositories as you need
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Advanced AI Detection</p>
                    <p className="text-sm text-muted-foreground">
                      Multi-pass analysis with 3x better accuracy
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Team Collaboration</p>
                    <p className="text-sm text-muted-foreground">
                      5 team seats included
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">CI/CD Integration</p>
                    <p className="text-sm text-muted-foreground">
                      GitHub Actions, GitLab CI, and more
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Priority Support</p>
                    <p className="text-sm text-muted-foreground">
                      Fast response times when you need help
                    </p>
                  </div>
                </div>
              </div>

              {/* Waitlist Form */}
              <div className="space-y-3 pt-4 border-t">
                <Label htmlFor="waitlist-email">Join the waitlist</Label>
                <div className="flex gap-2">
                  <Input
                    id="waitlist-email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <Button onClick={handleJoinWaitlist} disabled={loading || !email}>
                    {loading ? "Joining..." : "Join"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll notify you when Pro launches. No spam, promise! 🚀
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">You're on the list!</h3>
            <p className="text-muted-foreground mb-6">
              We'll email you at <strong>{email}</strong> when Pro launches.
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}