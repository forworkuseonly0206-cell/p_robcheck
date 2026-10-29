// app/api/auth/create-account/route.ts  (COMPLETE FILE - replace the old one)
// Creates the user on the SERVER as already-confirmed (the email was proven by your own OTP).
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { checkVerifyToken } from '@/lib/verify-token'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/auth-server'
import { sendWelcomeEmail } from '@/lib/email'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    if (!(await checkRateLimit(`create:ip:${ip}`, 10, 3600))) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }

    const body = await request.json().catch(() => null)
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')
    const fullName = String(body?.fullName || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 100)
    const token = String(body?.token || '')

    if (!EMAIL_RE.test(email) || !fullName || !token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (password.length < 8 || password.length > 72) {
      return NextResponse.json({ error: 'Password must be between 8 and 72 characters' }, { status: 400 })
    }
    if (!checkVerifyToken(token, email)) {
      return NextResponse.json({ error: 'Email verification expired. Please verify again.' }, { status: 401 })
    }

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // already proven by your OTP
      user_metadata: { full_name: fullName },
    })

    if (error) {
      const exists = /already|registered|exists/i.test(error.message)
      if (!exists) console.error('❌ createUser error:', error.message)
      return NextResponse.json(
        { error: exists ? 'An account with this email already exists. Please sign in.' : 'Failed to create account' },
        { status: exists ? 409 : 400 }
      )
    }

    // The welcome email is sent here, on the server, so no public "send email" endpoint is needed.
    await sendWelcomeEmail({ userEmail: email, userName: fullName })

    // The profiles row is created automatically by the database trigger.
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Create account error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}