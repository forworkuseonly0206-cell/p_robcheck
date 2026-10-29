// lib/rate-limit.ts  (NEW FILE)
// Stops one person from hammering an endpoint (needs migration-3 SQL).
import { supabaseAdmin } from "@/lib/supabase"

// Returns true if the request is allowed. If the check itself fails, we block (safer).
export async function checkRateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
    p_key: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  })
  if (error) {
    console.error("❌ check_rate_limit failed:", error)
    return false
  }
  return data === true
}