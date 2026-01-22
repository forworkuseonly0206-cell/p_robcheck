"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scan, FileText, Users } from "lucide-react"

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap gap-4"
    >
      <Link href="/scan">
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green">
          <Scan className="mr-2 h-4 w-4" />
          New Scan
        </Button>
      </Link>

      <Link href="/reports/scan-001">
        <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
          <FileText className="mr-2 h-4 w-4" />
          View Last Report
        </Button>
      </Link>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
            <Users className="mr-2 h-4 w-4" />
            Invite Team
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-mono">Invite Team Members</DialogTitle>
            <DialogDescription>Add team members to collaborate on security scanning.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="teammate@company.com"
                className="bg-secondary border-border"
              />
            </div>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Send Invitation</Button>
            <p className="text-sm text-muted-foreground text-center">Team features coming soon in Pro plan</p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
