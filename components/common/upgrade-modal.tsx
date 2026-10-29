// components/common/upgrade-modal.tsx  (COMPLETE FILE - replace the old one)
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
            {reason || "Unlock unlimited scans and the advanced scanner"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            {[
              "Unlimited security scans",
              "Advanced AI scanner",
              "Detailed reports with fixes",
              "Priority support",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          <Link href="/pricing" onClick={() => onOpenChange(false)}>
            <Button className="w-full">
              See plans and prices
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}