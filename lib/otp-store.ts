// lib/otp-store.ts

// In-memory storage for OTPs (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number; type: 'signup' | 'signin' }>()

// Clean up expired OTPs every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [email, data] of otpStore.entries()) {
      if (now > data.expiresAt) {
        otpStore.delete(email)
      }
    }
  }, 5 * 60 * 1000)
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function storeOTP(email: string, otp: string, type: 'signup' | 'signin') {
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
  otpStore.set(email.toLowerCase(), { otp, expiresAt, type })
  console.log(`🔐 OTP stored for ${email}: ${otp} (expires in 10 min)`)
}

export function verifyOTP(email: string, otp: string): { valid: boolean; error?: string } {
  const stored = otpStore.get(email.toLowerCase())
  
  if (!stored) {
    return { valid: false, error: 'OTP not found or expired' }
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(email.toLowerCase())
    return { valid: false, error: 'OTP has expired. Please request a new code.' }
  }
  
  if (stored.otp !== otp) {
    return { valid: false, error: 'Invalid OTP code' }
  }
  
  // OTP is valid, remove it from store
  otpStore.delete(email.toLowerCase())
  return { valid: true }
}

export function hasValidOTP(email: string): boolean {
  const stored = otpStore.get(email.toLowerCase())
  if (!stored) return false
  return Date.now() <= stored.expiresAt
}