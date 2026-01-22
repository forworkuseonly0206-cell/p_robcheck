// lib/usage-stats.ts
import { supabaseAdmin } from "./supabase"

export async function updateUsageStats(userId: string, data: {
  scans?: number
  filesScanned?: number
  vulnerabilitiesFound?: number
}) {
  try {
    const now = new Date()
    const month = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

    // Get or create usage stats for this month
    const { data: existing } = await supabaseAdmin
      .from("usage_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("month", month)
      .single()

    if (existing) {
      // Update existing
      await supabaseAdmin
        .from("usage_stats")
        .update({
          scans_count: (existing.scans_count || 0) + (data.scans || 0),
          files_scanned: (existing.files_scanned || 0) + (data.filesScanned || 0),
          vulnerabilities_found: (existing.vulnerabilities_found || 0) + (data.vulnerabilitiesFound || 0),
        })
        .eq("id", existing.id)
    } else {
      // Create new
      await supabaseAdmin
        .from("usage_stats")
        .insert({
          user_id: userId,
          month,
          scans_count: data.scans || 0,
          files_scanned: data.filesScanned || 0,
          vulnerabilities_found: data.vulnerabilitiesFound || 0,
        })
    }

    console.log("✅ Usage stats updated")
  } catch (error) {
    console.error("❌ Failed to update usage stats:", error)
  }
}