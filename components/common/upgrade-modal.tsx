// components/common/upgrade-modal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason?: string
}

export function UpgradeModal({ open, onOpenChange, reason }: UpgradeModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-primary" />
            <DialogTitle>Upgrade to Pro</DialogTitle>
          </div>
          <DialogDescription>
            {reason || "Unlock unlimited scans and advanced features"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <Badge className="bg-primary/20 text-primary">Coming Soon</Badge>
          </div>

          <div className="space-y-3">
            {[
              "Unlimited security scans",
              "Advanced AI detection",
              "Team collaboration (5 seats)",
              "CI/CD pipeline integration",
              "Priority support",
              "Detailed reports with fixes",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Link href="/pricing">
            <Button className="w-full">
              View All Plans
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}