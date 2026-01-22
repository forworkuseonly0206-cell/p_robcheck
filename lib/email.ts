// lib/email.ts
import { Resend } from 'resend'

// Initialize Resend lazily
let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY
        console.log('🔍 Checking Resend API key:', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      hasPublicKey: !!process.env.NEXT_PUBLIC_RESEND_API_KEY,
      nodeEnv: process.env.NODE_ENV,
    })
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY is not defined in environment variables')
      throw new Error('RESEND_API_KEY is not defined in environment variables')
    }
    resendInstance = new Resend(apiKey)
    console.log('✅ Resend initialized successfully')
  }
  return resendInstance
}

const FROM_EMAIL = 'CipherGuard <onboarding@resend.dev>' // Change this after verifying your domain
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

/**
 * Send OTP verification email
 */
export async function sendOTPEmail(data: {
  email: string
  otp: string
  type: 'signup' | 'signin'
}) {
  try {
    const resend = getResend()
    
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `🔐 Your CipherGuard Verification Code`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .otp-box { background: white; border: 2px dashed #667eea; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
    .otp-code { font-size: 48px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace; }
    .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Verification Code</h1>
    </div>
    <div class="content">
      <p>Hi there,</p>
      
      <p>Your verification code for ${data.type === 'signup' ? 'creating your CipherGuard account' : 'signing in to CipherGuard'} is:</p>
      
      <div class="otp-box">
        <div class="otp-code">${data.otp}</div>
        <p style="color: #6b7280; margin-top: 15px; font-size: 14px;">This code will expire in 10 minutes</p>
      </div>
      
      <div class="warning">
        <strong>⚠️ Security Notice:</strong> Never share this code with anyone. CipherGuard will never ask for your verification code.
      </div>
      
      <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
        If you didn't request this code, please ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>CipherGuard - AI-Powered Security Scanner</p>
      <p><a href="${APP_URL}" style="color: #667eea;">Visit Dashboard</a></p>
    </div>
  </div>
</body>
</html>
      `,
    })

    console.log(`📧 OTP email sent to ${data.email}`, result)
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    throw error
  }
}

/**
 * Send scan completion email
 */
export async function sendScanCompleteEmail(data: {
  userEmail: string
  userName?: string
  scanId: string
  projectName: string
  summary: {
    critical: number
    high: number
    medium: number
    low: number
  }
  filesScanned: number
}) {
  try {
    const resend = getResend()
    const total = data.summary.critical + data.summary.high + data.summary.medium + data.summary.low
    const reportUrl = `${APP_URL}/reports/${data.scanId}`

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.userEmail,
      subject: `✅ Security Scan Complete: ${data.projectName}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #e5e7eb; }
    .stat-value { font-size: 32px; font-weight: bold; margin: 5px 0; }
    .critical { color: #dc2626; }
    .high { color: #ea580c; }
    .medium { color: #eab308; }
    .low { color: #3b82f6; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 Security Scan Complete</h1>
    </div>
    <div class="content">
      <p>Hi ${data.userName || 'there'},</p>
      
      <p>Your security scan for <strong>${data.projectName}</strong> is complete!</p>
      
      <p><strong>Scanned:</strong> ${data.filesScanned} file${data.filesScanned !== 1 ? 's' : ''}</p>
      
      ${total > 0 ? `
      <h3>Vulnerabilities Found: ${total}</h3>
      
      <div class="stats">
        ${data.summary.critical > 0 ? `
        <div class="stat-card">
          <div class="stat-value critical">${data.summary.critical}</div>
          <div>Critical</div>
        </div>
        ` : ''}
        ${data.summary.high > 0 ? `
        <div class="stat-card">
          <div class="stat-value high">${data.summary.high}</div>
          <div>High</div>
        </div>
        ` : ''}
        ${data.summary.medium > 0 ? `
        <div class="stat-card">
          <div class="stat-value medium">${data.summary.medium}</div>
          <div>Medium</div>
        </div>
        ` : ''}
        ${data.summary.low > 0 ? `
        <div class="stat-card">
          <div class="stat-value low">${data.summary.low}</div>
          <div>Low</div>
        </div>
        ` : ''}
      </div>
      
      ${data.summary.critical > 0 || data.summary.high > 0 ? `
      <p style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong>⚠️ Action Required:</strong> Critical or high-severity vulnerabilities were found. We recommend addressing these immediately.
      </p>
      ` : ''}
      ` : `
      <p style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong>✅ Great news!</strong> No security vulnerabilities were found in your code.
      </p>
      `}
      
      <a href="${reportUrl}" class="button">View Full Report</a>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        This scan was performed on ${new Date().toLocaleString()}
      </p>
    </div>
    <div class="footer">
      <p>CipherGuard - AI-Powered Security Scanner</p>
      <p><a href="${APP_URL}" style="color: #667eea;">Dashboard</a> • <a href="${APP_URL}/pricing" style="color: #667eea;">Upgrade</a></p>
    </div>
  </div>
</body>
</html>
      `,
    })

    console.log(`📧 Scan complete email sent to ${data.userEmail}`)
  } catch (error) {
    console.error('Failed to send scan complete email:', error)
  }
}

/**
 * Send scan limit reached email (upgrade reminder)
 */
export async function sendScanLimitEmail(data: {
  userEmail: string
  userName?: string
  scansUsed: number
  planName: string
}) {
  try {
    const resend = getResend()
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.userEmail,
      subject: `🔔 Scan Limit Reached - Upgrade to Continue`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .feature { display: flex; align-items: center; gap: 10px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔒 You've Reached Your Scan Limit</h1>
    </div>
    <div class="content">
      <p>Hi ${data.userName || 'there'},</p>
      
      <p>You've used all <strong>${data.scansUsed}</strong> scan${data.scansUsed !== 1 ? 's' : ''} included in your ${data.planName} plan this month.</p>
      
      <h3 style="margin-top: 30px;">Upgrade to Pro for:</h3>
      
      <div class="feature-list">
        <div class="feature">✅ <strong>Unlimited scans</strong></div>
        <div class="feature">✅ <strong>Advanced AI detection</strong></div>
        <div class="feature">✅ <strong>Team collaboration</strong> (5 seats)</div>
        <div class="feature">✅ <strong>CI/CD integration</strong></div>
        <div class="feature">✅ <strong>Priority support</strong></div>
      </div>
      
      <div style="text-align: center;">
        <p style="font-size: 24px; font-weight: bold; margin: 20px 0;">Only $29/month</p>
        <p style="color: #6b7280; margin-bottom: 20px;">Coming Soon - Join the Waitlist</p>
        <a href="${APP_URL}/pricing" class="button">View Plans</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        Your scan limit will reset at the start of next month.
      </p>
    </div>
  </div>
</body>
</html>
      `,
    })

    console.log(`📧 Scan limit email sent to ${data.userEmail}`)
  } catch (error) {
    console.error('Failed to send scan limit email:', error)
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: {
  userEmail: string
  userName?: string
}) {
  try {
    const resend = getResend()
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.userEmail,
      subject: `🎉 Welcome to CipherGuard!`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
    .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .step { margin: 15px 0; padding-left: 30px; position: relative; }
    .step::before { content: attr(data-number); position: absolute; left: 0; top: 0; background: #667eea; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to CipherGuard!</h1>
      <p style="color: #e0e7ff; margin-top: 10px;">Your AI-powered security scanner is ready</p>
    </div>
    <div class="content">
      <p>Hi ${data.userName || 'there'},</p>
      
      <p>Thanks for signing up! You're now ready to start securing your code with AI-powered vulnerability detection.</p>
      
      <h3>Quick Start Guide:</h3>
      
      <div class="steps">
        <div class="step" data-number="1">
          <strong>Prepare your code</strong><br>
          <span style="color: #6b7280;">Zip your project folder (we support JavaScript, TypeScript, Python, and more)</span>
        </div>
        <div class="step" data-number="2">
          <strong>Upload and scan</strong><br>
          <span style="color: #6b7280;">Click "New Scan" and upload your zip file</span>
        </div>
        <div class="step" data-number="3">
          <strong>Review results</strong><br>
          <span style="color: #6b7280;">Get detailed reports with fixes for every vulnerability</span>
        </div>
      </div>
      
      <div style="text-align: center;">
        <a href="${APP_URL}/scan" class="button">Start Your First Scan</a>
      </div>
      
      <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 4px; margin: 30px 0;">
        <strong>💡 Pro Tip:</strong> Your free plan includes 1 scan per month. Need more? <a href="${APP_URL}/pricing" style="color: #667eea;">Check out Pro</a> for unlimited scans!
      </div>
      
      <p style="margin-top: 30px;">
        Need help? Reply to this email or check out our <a href="${APP_URL}/docs" style="color: #667eea;">documentation</a>.
      </p>
      
      <p>Happy scanning! 🔒</p>
    </div>
  </div>
</body>
</html>
      `,
    })

    console.log(`📧 Welcome email sent to ${data.userEmail}`)
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}