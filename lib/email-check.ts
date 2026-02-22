// lib/email-check.ts
// Simple utility to check if user wants email notifications
// Works with your existing email system

import { supabaseAdmin } from './supabase'

/**
 * Check if user has enabled email notifications for scan completion
 * Returns true if notifications are enabled OR if settings don't exist (default behavior)
 */
export async function shouldSendScanEmail(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .select('email_notifications, scan_complete_notifications')
      .eq('user_id', userId)
      .single()

    // If no settings exist, default to sending emails (backward compatible)
    if (error || !data) {
      console.log('📧 No user settings found, defaulting to sending email')
      return true
    }

    // Check both master switch and scan completion switch
    const shouldSend = data.email_notifications && data.scan_complete_notifications

    console.log(`📧 Email notification check for user ${userId}:`, {
      masterSwitch: data.email_notifications,
      scanComplete: data.scan_complete_notifications,
      willSend: shouldSend
    })

    return shouldSend
  } catch (error) {
    console.error('❌ Error checking email preferences:', error)
    // On error, default to sending emails (safe fallback)
    return true
  }
}

/**
 * Check if user wants scan limit notifications
 */
export async function shouldSendLimitEmail(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_settings')
      .select('email_notifications, scan_limit_notifications')
      .eq('user_id', userId)
      .single()

    if (error || !data) return true

    return data.email_notifications && data.scan_limit_notifications
  } catch (error) {
    console.error('❌ Error checking limit email preferences:', error)
    return true
  }
}