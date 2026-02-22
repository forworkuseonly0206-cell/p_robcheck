// lib/subscription.ts - ROBUST FIX
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

// ✅ NEW: Helper function to normalize plan type
function normalizePlanType(planType: string | null | undefined): PlanType {
  if (!planType) return "free"
  
  const normalized = planType.toLowerCase().trim()
  
  // Handle common variations
  if (normalized === "pro" || normalized === "professional") return "pro"
  if (normalized === "enterprise" || normalized === "business") return "enterprise"
  
  return "free"
}

export async function canUserScan(userId: string): Promise<{
  allowed: boolean
  reason?: string
  scansRemaining?: number
  planType?: PlanType
}> {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("plan_type, scans_remaining, scans_used")
      .eq("id", userId)
      .single()

    if (error) {
      console.error('❌ Database error loading profile:', error)
      return { 
        allowed: false, 
        reason: "Failed to check scan limits. Please try again." 
      }
    }

    if (!profile) {
      console.error('❌ Profile not found for user:', userId)
      return { 
        allowed: false, 
        reason: "Profile not found" 
      }
    }

    // ✅ FIX: Normalize plan type
    const planType = normalizePlanType(profile.plan_type)
    const limits = PLAN_LIMITS[planType]

    if (!limits) {
      console.error('❌ Invalid plan type:', profile.plan_type)
      return {
        allowed: false,
        reason: "Invalid subscription plan"
      }
    }

    console.log(`\n🔍 SCAN LIMIT CHECK:`)
    console.log(`   User ID: ${userId}`)
    console.log(`   Plan from DB: "${profile.plan_type}"`)
    console.log(`   Normalized to: "${planType}"`)
    console.log(`   Scans/Month: ${limits.scansPerMonth}`)
    console.log(`   Scans Remaining: ${profile.scans_remaining || 0}`)
    console.log(`   Advanced AI: ${limits.advancedAI ? 'YES' : 'NO'}\n`)

    // Unlimited scans for Pro/Enterprise
    if (limits.scansPerMonth === -1) {
      console.log(`✅ Unlimited scans (${planType} plan)`)
      return {
        allowed: true,
        scansRemaining: -1,
        planType,
      }
    }

    // Check remaining scans for Free tier
    const scansRemaining = profile.scans_remaining || 0

    if (scansRemaining <= 0) {
      console.log(`❌ No scans remaining`)
      return {
        allowed: false,
        reason: `You've used your ${limits.scansPerMonth} free scan${limits.scansPerMonth > 1 ? 's' : ''} for this month. Upgrade to Pro for unlimited scans.`,
        scansRemaining: 0,
        planType,
      }
    }

    console.log(`✅ ${scansRemaining} scans remaining`)
    return {
      allowed: true,
      scansRemaining,
      planType,
    }
  } catch (error) {
    console.error("❌ Exception checking scan limits:", error)
    return { 
      allowed: false, 
      reason: "Failed to check scan limits. Please try again." 
    }
  }
}

export async function decrementScanCount(userId: string): Promise<void> {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("plan_type, scans_remaining, scans_used")
      .eq("id", userId)
      .single()

    if (error || !profile) {
      console.error('❌ Error loading profile for decrement:', error)
      return
    }

    const planType = normalizePlanType(profile.plan_type)

    // Only decrement for free tier
    if (planType === "free") {
      const newRemaining = Math.max(0, (profile.scans_remaining || 0) - 1)
      const newUsed = (profile.scans_used || 0) + 1
      
      await supabaseAdmin
        .from("profiles")
        .update({
          scans_remaining: newRemaining,
          scans_used: newUsed,
        })
        .eq("id", userId)
      
      console.log(`✅ Scan count: ${newRemaining} remaining, ${newUsed} used`)
    } else {
      console.log(`✅ ${planType} plan - scan count not decremented`)
    }
  } catch (error) {
    console.error("❌ Error decrementing scan count:", error)
  }
}

export async function resetMonthlyScanLimits(): Promise<void> {
  try {
    await supabaseAdmin
      .from("profiles")
      .update({ scans_remaining: 1 })
      .eq("plan_type", "free")

    console.log("✅ Monthly scan limits reset for free users")
  } catch (error) {
    console.error("❌ Failed to reset monthly limits:", error)
  }
}

export async function getUserSubscription(userId: string) {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("plan_type, scans_remaining, scans_used")
      .eq("id", userId)
      .single()

    if (error || !profile) {
      console.error('❌ Error getting subscription:', error)
      return null
    }

    const planType = normalizePlanType(profile.plan_type)
    const limits = PLAN_LIMITS[planType]

    return {
      planType,
      limits,
      scansRemaining: profile.scans_remaining || 0,
      scansUsed: profile.scans_used || 0,
    }
  } catch (error) {
    console.error("❌ Error getting subscription:", error)
    return null
  }
}