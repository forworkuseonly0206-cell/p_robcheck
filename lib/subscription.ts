// lib/subscription.ts
import { supabaseAdmin } from "./supabase"

export type PlanType = "free" | "pro" | "enterprise"

export interface SubscriptionLimits {
  scansPerMonth: number
  advancedAI: boolean
  teamSeats: number
  cicdIntegration: boolean
  prioritySupport: boolean
  customRules: boolean
}

export const PLAN_LIMITS: Record<PlanType, SubscriptionLimits> = {
  free: {
    scansPerMonth: 1,
    advancedAI: false,
    teamSeats: 1,
    cicdIntegration: false,
    prioritySupport: false,
    customRules: false,
  },
  pro: {
    scansPerMonth: -1,
    advancedAI: true,
    teamSeats: 5,
    cicdIntegration: true,
    prioritySupport: true,
    customRules: false,
  },
  enterprise: {
    scansPerMonth: -1,
    advancedAI: true,
    teamSeats: -1,
    cicdIntegration: true,
    prioritySupport: true,
    customRules: true,
  },
}

export async function canUserScan(userId: string): Promise<{
  allowed: boolean
  reason?: string
  scansRemaining?: number
  planType?: PlanType
}> {
  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (!profile) {
      return { allowed: false, reason: "Profile not found" }
    }

    const planType = (profile.plan_type || "free") as PlanType
    const limits = PLAN_LIMITS[planType]

    if (limits.scansPerMonth === -1) {
      return {
        allowed: true,
        scansRemaining: -1,
        planType,
      }
    }

    const scansRemaining = profile.scans_remaining || 0

    if (scansRemaining <= 0) {
      return {
        allowed: false,
        reason: `You've used your ${limits.scansPerMonth} free scan${limits.scansPerMonth > 1 ? 's' : ''} for this month. Upgrade to Pro for unlimited scans.`,
        scansRemaining: 0,
        planType,
      }
    }

    return {
      allowed: true,
      scansRemaining,
      planType,
    }
  } catch (error) {
    console.error("Error checking scan limits:", error)
    return { allowed: false, reason: "Failed to check scan limits" }
  }
}

export async function decrementScanCount(userId: string): Promise<void> {
  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (!profile) return

    const planType = (profile.plan_type || "free") as PlanType

    if (planType === "free") {
      await supabaseAdmin
        .from("profiles")
        .update({
          scans_remaining: Math.max(0, (profile.scans_remaining || 0) - 1),
          scans_used: (profile.scans_used || 0) + 1,
        })
        .eq("id", userId)
    }
  } catch (error) {
    console.error("Error decrementing scan count:", error)
  }
}

export async function resetMonthlyScanLimits(): Promise<void> {
  try {
    await supabaseAdmin
      .from("profiles")
      .update({ scans_remaining: 1 })
      .eq("plan_type", "free")

    console.log("✅ Monthly scan limits reset")
  } catch (error) {
    console.error("❌ Failed to reset monthly limits:", error)
  }
}

export async function getUserSubscription(userId: string) {
  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (!profile) return null

    const planType = (profile.plan_type || "free") as PlanType
    const limits = PLAN_LIMITS[planType]

    return {
      planType,
      limits,
      scansRemaining: profile.scans_remaining || 0,
      scansUsed: profile.scans_used || 0,
    }
  } catch (error) {
    console.error("Error getting subscription:", error)
    return null
  }
}