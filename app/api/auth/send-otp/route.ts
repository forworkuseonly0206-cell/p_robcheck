// app/api/auth/send-otp/route.ts  (COMPLETE FILE - replace the old one)
import { NextRequest, NextResponse } from 'next/server'
import { sendAuthOTP } from '@/lib/auth-email'
import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/auth-server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = String(body?.email || '').trim().toLowerCase()
    const type = body?.type

    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    if (type !== 'signup' && type !== 'signin') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Stop code spam: one code a minute per email, 5 an hour per email, 20 an hour per IP
    const ip = getClientIp(request)
    const okCooldown = await checkRateLimit(`otp:cool:${email}`, 1, 60)
    const okEmail = await checkRateLimit(`otp:email:${email}`, 5, 3600)
    const okIp = await checkRateLimit(`otp:ip:${ip}`, 20, 3600)
    if (!okCooldown || !okEmail || !okIp) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute and try again.' },
        { status: 429 }
      )
    }

    // CHANGED: listUsers() only returns the first page of users, so it missed people as you grow.
    // The profiles table (one row per user) is the check instead.
    const { data: profileExists } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .ilike('email', email)
      .maybeSingle()

    if (type === 'signup' && profileExists) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in.' },
        { status: 400 }
      )
    }

    if (type === 'signin' && !profileExists) {
      return NextResponse.json(
        { error: 'No account found with this email. Please sign up first.' },
        { status: 400 }
      )
    }

    await sendAuthOTP(email, type)

    return NextResponse.json({ success: true, message: 'Verification code sent to your email' })
  } catch (error: any) {
    console.error('❌ Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    )
  }
}