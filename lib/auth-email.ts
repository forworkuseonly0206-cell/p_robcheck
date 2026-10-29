// lib/auth-email.ts  (COMPLETE FILE - replace the old one)
import { Resend } from 'resend'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY)
const OTP_TTL_MS = 10 * 60 * 1000

// Codes are stored as a keyed hash, so even someone who reads the database cannot read the codes.
function hashOtp(email: string, otp: string): string {
  const secret = process.env.OTP_TOKEN_SECRET
  if (!secret) throw new Error('OTP_TOKEN_SECRET is not set')
  return crypto.createHmac('sha256', secret).update(`otp|${email}|${otp}`).digest('hex')
}

// crypto.randomInt is unpredictable; Math.random is not safe for security codes
function generate6DigitOTP(): string {
  return crypto.randomInt(100000, 1000000).toString()
}

export async function sendAuthOTP(email: string, type: 'signup' | 'signin') {
  const clean = email.toLowerCase().trim()
  const otp = generate6DigitOTP()

  const { error: saveError } = await supabaseAdmin.from('otp_codes').upsert(
    {
      email: clean,
      code_hash: hashOtp(clean, otp),
      type,
      attempts: 0,
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
      created_at: new Date().toISOString(),
    },
    { onConflict: 'email' }
  )

  if (saveError) {
    console.error('❌ Could not store OTP:', saveError)
    throw new Error('Could not create a verification code')
  }

  try {
    await resend.emails.send({
      from: 'ProbCheck <noreply@probcheck.in>',
      to: clean,
      subject: 'Your ProbCheck verification code',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #101a0a; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e2d10; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .header h1 { color: #c8f56a; margin: 0; font-size: 24px; }
    .content { background: #f7fbef; padding: 30px; border-radius: 0 0 10px 10px; }
    .otp-box { background: white; border: 2px solid #1e2d10; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0; }
    .otp-code { font-size: 44px; font-weight: bold; letter-spacing: 10px; color: #1e2d10; font-family: 'Courier New', monospace; }
    .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header"><h1>Verification Code</h1></div>
  <div class="content">
    <p>Hi there,</p>
    <p>Your verification code for ${type === 'signup' ? 'creating your ProbCheck account' : 'signing in to ProbCheck'} is:</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <p style="color: #5a6a4c; margin-top: 15px; font-size: 14px;">This code expires in 10 minutes</p>
    </div>
    <div class="warning"><strong>Security notice:</strong> Never share this code with anyone. ProbCheck will never ask for it.</div>
    <p style="font-size: 14px; color: #5a6a4c; margin-top: 30px;">If you didn't request this code, you can ignore this email.</p>
  </div>
</body>
</html>`,
    })
  } catch (error) {
    console.error('❌ Send OTP email error:', error)
    // Remove the unusable code, then let the caller show a generic error
    await supabaseAdmin.from('otp_codes').delete().eq('email', clean)
    throw error
  }

  return { success: true }
}

// Returns { success: true } only for the right, unexpired code, with at most 5 wrong guesses.
export async function verifyAuthOTP(email: string, token: string) {
  const clean = email.toLowerCase().trim()

  if (!/^\d{6}$/.test(token)) {
    return { success: false, reason: 'invalid' }
  }

  const { data, error } = await supabaseAdmin.rpc('verify_otp', {
    p_email: clean,
    p_hash: hashOtp(clean, token),
  })

  if (error) {
    console.error('❌ OTP verification error:', error)
    return { success: false, reason: 'error' }
  }

  return { success: data === 'ok', reason: String(data) }
}