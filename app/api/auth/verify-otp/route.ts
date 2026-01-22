// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/otp-store'

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json()

    console.log('🔐 Verify OTP request:', { email, otp: otp?.substring(0, 2) + '****', type })

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits' },
        { status: 400 }
      )
    }

    // Verify OTP
    const result = verifyOTP(email, otp)

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'Invalid OTP' },
        { status: 400 }
      )
    }

    console.log('✅ OTP verified successfully for:', email)

    return NextResponse.json({ 
      success: true, 
      verified: true 
    })
  } catch (error: any) {
    console.error('❌ Verify OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}
