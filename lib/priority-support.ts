// lib/priority-support.ts  (COMPLETE FILE - replace the old one)
// Fixes: the plan check used the public client (it could never see the plan, so priority never
// worked), user text went into emails unescaped, support mail fell back to the WRONG domain
// (probcheck.com instead of .in), and the sender used Resend's test address.
import { supabaseAdmin } from './supabase'
import { Resend } from 'resend'

// Both must be inboxes YOU control. There is no fallback on purpose: a wrong default would send
// your users' messages to a stranger.
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL
const PRIORITY_SUPPORT_EMAIL = process.env.PRIORITY_SUPPORT_EMAIL || process.env.SUPPORT_EMAIL
const FROM_EMAIL = 'ProbCheck Support <noreply@probcheck.in>' // your verified domain
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const withBreaks = (text: string) => esc(text).replace(/\n/g, '<br>')

/**
 * Check if user has priority support (active Pro, or Enterprise)
 */
export async function hasPrioritySupport(userId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan_type, pro_until')
      .eq('id', userId)
      .single()

    const plan = String(profile?.plan_type || '').toLowerCase()
    if (plan === 'enterprise') return true
    if (plan === 'pro') {
      // An expired Pro plan does not get priority support
      return !profile?.pro_until || new Date(profile.pro_until) > new Date()
    }
    return false
  } catch (error) {
    console.error('Error checking priority support:', error)
    return false
  }
}

/**
 * Send support request email
 */
export async function sendSupportRequest(data: {
  userId: string
  userEmail: string
  userName: string
  subject: string
  message: string
  priority: 'normal' | 'high'
}) {
  const isPriority = data.priority === 'high'
  const toEmail = isPriority ? PRIORITY_SUPPORT_EMAIL : SUPPORT_EMAIL

  if (!toEmail) {
    console.error('❌ SUPPORT_EMAIL is not set in the environment variables')
    throw new Error('Support email is not configured')
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    // 1. To your support team
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      replyTo: data.userEmail,
      subject: `${isPriority ? '[PRIORITY] ' : ''}${data.subject}`,
      html: `
<div style="font-family:sans-serif;line-height:1.6;color:#101a0a;max-width:600px;margin:0 auto;padding:20px;">
  <p style="background:${isPriority ? '#dc2626' : '#1e2d10'};color:#fff;padding:5px 15px;border-radius:4px;display:inline-block;">
    ${isPriority ? 'PRIORITY SUPPORT' : 'Support Request'}
  </p>
  <h2>${esc(data.subject)}</h2>
  <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
    <strong>From:</strong> ${esc(data.userName)} (${esc(data.userEmail)})<br>
    <strong>User ID:</strong> ${esc(data.userId)}<br>
    <strong>Priority:</strong> ${isPriority ? 'HIGH (Pro customer)' : 'Normal'}
  </div>
  <div style="background:#fff;border:1px solid #e5e7eb;padding:20px;border-radius:8px;">
    <strong>Message:</strong><br><br>${withBreaks(data.message)}
  </div>
</div>`,
    })

    // 2. Confirmation to the user
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.userEmail,
      subject: `Support request received: ${data.subject}`,
      html: `
<div style="font-family:sans-serif;line-height:1.6;color:#101a0a;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#1e2d10;padding:24px;text-align:center;border-radius:10px 10px 0 0;">
    <h1 style="color:#c8f56a;margin:0;font-size:22px;">Support Request Received</h1>
  </div>
  <div style="background:#f7fbef;padding:24px;border-radius:0 0 10px 10px;">
    <p>Hi ${esc(data.userName)},</p>
    <p>We have received your request and will get back to you.</p>
    <p style="background:#fff;border-left:4px solid #1e2d10;padding:12px 14px;border-radius:4px;">
      <strong>${isPriority ? 'Priority support' : 'Standard support'}</strong><br>
      ${isPriority ? 'Pro customers are answered first.' : 'We answer requests in the order they arrive.'}
    </p>
    <p><strong>Your message:</strong></p>
    <p style="background:#fff;padding:14px;border-radius:8px;border:1px solid #e5e7eb;">${withBreaks(data.message)}</p>
    <p style="font-size:14px;color:#5a6a4c;">
      Meanwhile, our <a href="${APP_URL}/docs" style="color:#1e2d10;">documentation</a> may have a quick answer.
    </p>
  </div>
</div>`,
    })

    console.log(`📧 ${isPriority ? 'Priority' : 'Standard'} support request sent`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send support request:', error)
    throw error
  }
}

/**
 * Get support response time based on plan.
 * NOTE: only promise times you can really meet. These are shown to customers.
 */
export function getSupportSLA(planType: string): string {
  switch (planType) {
    case 'enterprise':
      return '4-hour response time'
    case 'pro':
      return '24-hour response time'
    default:
      return '48-72 hour response time'
  }
}