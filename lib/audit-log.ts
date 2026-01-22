// lib/audit-log.ts
import { supabaseAdmin } from "./supabase"

export async function logAudit(data: {
  userId: string | null
  action: string
  resourceType?: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: any
}) {
  try {
    await supabaseAdmin
      .from("audit_logs")
      .insert({
        user_id: data.userId,
        action: data.action,
        resource_type: data.resourceType,
        resource_id: data.resourceId,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        metadata: data.metadata,
        created_at: new Date().toISOString(),
      })
    
    console.log(`📝 Audit log: ${data.action}`)
  } catch (error) {
    console.error("❌ Failed to log audit:", error)
  }
}