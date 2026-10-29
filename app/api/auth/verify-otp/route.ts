// app/api/auth/verify-otp/route.ts  (COMPLETE FILE - replace the old one)
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthOTP } from '@/lib/auth-email'
import { makeVerifyToken } from '@/lib/verify-token'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    if (!(await checkRateLimit(`verify:ip:${ip}`, 30, 600))) {
      return NextResponse.json({ error: 'Too many attempts. Please wait and try again.' }, { status: 429 })
    }

    const body = await request.json().catch(() => null)
    const email = String(body?.email || '').trim().toLowerCase()
    const otp = String(body?.otp || '')

    if (!email || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Enter the 6-digit code' }, { status: 400 })
    }

    const result = await verifyAuthOTP(email, otp)

    if (!result.success) {
      // One generic message for every failure, so nothing is revealed to an attacker
      const message =
        result.reason === 'locked'
          ? 'Too many incorrect attempts. Please request a new code.'
          : 'Invalid or expired verification code'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      verified: true,
      email,
      token: makeVerifyToken(email),
    })
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error)
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 })
  }
}