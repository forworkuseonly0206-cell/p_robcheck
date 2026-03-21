// app/api/auth/send-otp/route.ts - COMPLETE FIX
import { NextRequest, NextResponse } from 'next/server'
import { sendAuthOTP } from '@/lib/auth-email'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (type !== 'signup' && type !== 'signin') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // ✅ FIX: Check BOTH auth users and profiles table
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const authUserExists = authUsers.users.find(
      u => u.email?.toLowerCase() === email.toLowerCase()
    )

    const { data: profileExists } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    // For signup, user should NOT exist in either place
    if (type === 'signup') {
      if (authUserExists || profileExists) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in.' },
          { status: 400 }
        )
      }
    }

    // For signin, user MUST exist in profiles
    if (type === 'signin') {
      if (!profileExists) {
        return NextResponse.json(
          { error: 'No account found with this email. Please sign up first.' },
          { status: 400 }
        )
      }
    }

    // Send 6-digit OTP
    await sendAuthOTP(email, type)

    return NextResponse.json({ 
      success: true, 
      message: 'Verification code sent to your email' 
    })
  } catch (error: any) {
    console.error('❌ Send OTP error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send verification code' },
      { status: 500 }
    )
  }
}