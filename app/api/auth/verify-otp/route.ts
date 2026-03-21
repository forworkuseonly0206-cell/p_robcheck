// app/api/auth/verify-otp/route.ts - FIXED (ONLY VERIFIES, DOESN'T CREATE)
import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthOTP } from '@/lib/auth-email'

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: 'OTP must be exactly 6 digits' },
        { status: 400 }
      )
    }

    // ✅ ONLY verify the OTP - DON'T create user yet!
    const result = await verifyAuthOTP(email, otp)

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    console.log('✅ OTP verified for:', email)

    // Just return success - user will be created in create-account route
    return NextResponse.json({ 
      success: true, 
      verified: true,
      email: email.toLowerCase()
    })
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}