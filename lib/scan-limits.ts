// lib/scan-limits.ts  (NEW FILE)
// Takes / returns a scan "slot" in one safe database step.
import { supabaseAdmin } from "@/lib/supabase"

// Returns true if the user may scan (and uses up one free scan if they are on the free plan)
export async function consumeScanSlot(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc("consume_scan", { p_user: userId })
  if (error) {
    console.error("❌ consume_scan failed:", error)
    throw new Error("Failed to check scan limits. Please try again.")
  }
  return data === true
}

// Gives the scan back (used when a scan fails because of an error on our side)
export async function refundScanSlot(userId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.rpc("refund_scan", { p_user: userId })
    if (error) console.error("❌ refund_scan failed:", error)
  } catch (e) {
    console.error("❌ refund_scan exception:", e)
  }
}