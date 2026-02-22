// lib/priority-support.ts - Handle priority support for Pro users

import { supabase } from './supabase'
import { Resend } from 'resend'

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@probcheck.com'
const PRIORITY_SUPPORT_EMAIL = process.env.PRIORITY_SUPPORT_EMAIL || 'priority@probcheck.com'

/**
 * Check if user has priority support (Pro or Enterprise plan)
 */
export async function hasPrioritySupport(userId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_type')
      .eq('id', userId)
      .single()

    return profile?.plan_type === 'pro' || profile?.plan_type === 'enterprise'
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
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  const isPriority = data.priority === 'high'
  const toEmail = isPriority ? PRIORITY_SUPPORT_EMAIL : SUPPORT_EMAIL

  try {
    // Send to support team
    await resend.emails.send({
      from: 'ProbCheck Support <support@resend.dev>',
      to: toEmail,
      replyTo: data.userEmail,
      subject: `${isPriority ? '[PRIORITY] ' : ''}${data.subject}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .priority-badge { background: #dc2626; color: white; padding: 5px 15px; border-radius: 4px; display: inline-block; margin-bottom: 15px; }
    .normal-badge { background: #3b82f6; color: white; padding: 5px 15px; border-radius: 4px; display: inline-block; margin-bottom: 15px; }
    .user-info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .message-box { background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="${isPriority ? 'priority-badge' : 'normal-badge'}">
      ${isPriority ? '🚨 PRIORITY SUPPORT' : '📧 Support Request'}
    </div>
    
    <h2>${data.subject}</h2>
    
    <div class="user-info">
      <strong>From:</strong> ${data.userName} (${data.userEmail})<br>
      <strong>User ID:</strong> ${data.userId}<br>
      <strong>Priority Level:</strong> ${isPriority ? 'HIGH (Pro Customer)' : 'Normal'}
    </div>
    
    <div class="message-box">
      <strong>Message:</strong><br><br>
      ${data.message.replace(/\n/g, '<br>')}
    </div>
    
    <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
      ${isPriority 
        ? '⏰ SLA: Respond within 24 hours for priority support'
        : '⏰ SLA: Respond within 48-72 hours for standard support'
      }
    </p>
  </div>
</body>
</html>
      `,
    })

    // Send confirmation to user
    await resend.emails.send({
      from: 'ProbCheck Support <support@resend.dev>',
      to: data.userEmail,
      subject: `Support Request Received: ${data.subject}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; color: white; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: ${isPriority ? '#dcfce7' : '#dbeafe'}; border-left: 4px solid ${isPriority ? '#22c55e' : '#3b82f6'}; padding: 15px; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Support Request Received</h1>
    </div>
    <div class="content">
      <p>Hi ${data.userName},</p>
      
      <p>We've received your support request and our team will get back to you shortly.</p>
      
      <div class="info-box">
        <strong>${isPriority ? '🚀 Priority Support Active' : '📧 Standard Support'}</strong><br>
        ${isPriority 
          ? 'As a Pro customer, you\'ll receive a response within 24 hours.'
          : 'We typically respond within 48-72 hours.'
        }
      </div>
      
      <p><strong>Your Request:</strong></p>
      <p style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
        ${data.message.replace(/\n/g, '<br>')}
      </p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        In the meantime, check out our <a href="${process.env.NEXT_PUBLIC_APP_URL}/docs" style="color: #667eea;">documentation</a> for quick answers.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    console.log(`📧 ${isPriority ? 'Priority' : 'Standard'} support request sent`)
    return { success: true }
  } catch (error) {
    console.error('Failed to send support request:', error)
    throw error
  }
}

/**
 * Get support response time based on plan
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