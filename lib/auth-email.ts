// lib/auth-email.ts - UPDATED WITH send.probcheck.in DOMAIN
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Generate exactly 6 digits
function generate6DigitOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// In-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { 
  otp: string
  expiresAt: number
  type: 'signup' | 'signin' 
}>()

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email)
    }
  }
}, 5 * 60 * 1000)

/**
 * Send 6-digit OTP using Resend with YOUR VERIFIED DOMAIN
 */
export async function sendAuthOTP(email: string, type: 'signup' | 'signin') {
  try {
    // Generate 6-digit OTP
    const otp = generate6DigitOTP()
    
    // Store OTP (expires in 10 minutes)
    const expiresAt = Date.now() + 10 * 60 * 1000
    otpStore.set(email.toLowerCase(), { otp, expiresAt, type })
    
    console.log(`🔐 OTP generated for ${email}: ${otp}`)

    // ✅ UPDATED: Using your verified domain
    await resend.emails.send({
      from: 'ProbCheck <noreply@probcheck.in>',
      to: email,
      subject: '🔐 Your ProbCheck Verification Code',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
      border-radius: 10px 10px 0 0;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border-radius: 0 0 10px 10px;
    }
    .otp-box {
      background: white;
      border: 2px solid #10b981;
      border-radius: 10px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .otp-code {
      font-size: 48px;
      font-weight: bold;
      letter-spacing: 12px;
      color: #10b981;
      font-family: 'Courier New', monospace;
    }
    .warning {
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🔐 Verification Code</h1>
  </div>
  <div class="content">
    <p>Hi there,</p>
    
    <p>Your verification code for ${type === 'signup' ? 'creating your ProbCheck account' : 'signing in to ProbCheck'} is:</p>
    
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <p style="color: #6b7280; margin-top: 15px; font-size: 14px;">This code expires in 10 minutes</p>
    </div>
    
    <div class="warning">
      <strong>⚠️ Security Notice:</strong> Never share this code with anyone. ProbCheck will never ask for your verification code.
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
      If you didn't request this code, please ignore this email.
    </p>
  </div>
</body>
</html>
      `
    })

    console.log(`✅ 6-digit OTP sent to: ${email}`)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Send OTP error:', error)
    
    // Fallback: Log OTP to console if email fails
    const stored = otpStore.get(email.toLowerCase())
    if (stored && process.env.NODE_ENV === 'development') {
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 EMAIL FAILED - DEV MODE OTP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${email}
OTP: ${stored.otp}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `)
    }
    
    throw error
  }
}

/**
 * Verify 6-digit OTP
 */
export async function verifyAuthOTP(email: string, token: string) {
  try {
    const stored = otpStore.get(email.toLowerCase())
    
    if (!stored) {
      throw new Error('OTP not found or expired')
    }
    
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email.toLowerCase())
      throw new Error('OTP has expired. Please request a new code.')
    }
    
    if (stored.otp !== token) {
      throw new Error('Invalid OTP code')
    }
    
    // OTP is valid - remove it
    otpStore.delete(email.toLowerCase())
    
    console.log(`✅ OTP verified for: ${email}`)
    
    return { 
      success: true,
      email: email
    }
  } catch (error: any) {
    console.error('❌ OTP verification error:', error)
    throw error
  }
}