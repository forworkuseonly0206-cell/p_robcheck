// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, storeOTP } from '@/lib/otp-store'
import { sendOTPEmail } from '@/lib/email'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    console.log('📧 Send OTP request:', { email, type })

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (type !== 'signup' && type !== 'signin') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // For signup, check if user already exists
    if (type === 'signup') {
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 400 }
        )
      }
    }

    // For signin, check if user exists
    if (type === 'signin') {
      const { data: user } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .single()

      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email. Please sign up first.' },
          { status: 400 }
        )
      }
    }

    // Generate OTP
    const otp = generateOTP()
    
    // Store OTP
    storeOTP(email, otp, type)

    // Send email
    await sendOTPEmail({ email, otp, type })

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    })
  } catch (error: any) {
    console.error('❌ Send OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    )
  }
}