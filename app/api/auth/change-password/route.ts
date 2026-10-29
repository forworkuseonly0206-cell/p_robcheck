// app/api/auth/change-password/route.ts  (COMPLETE FILE - replace the old one)
// BEFORE: anyone could send any userId and set that person's password (full account takeover).
// NOW: you must be signed in, and you must know your CURRENT password.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '@/lib/supabase'
import { requireUser, getClientIp, HttpError } from '@/lib/auth-server'
import { checkRateLimit } from '@/lib/rate-limit'
import { logAudit } from '@/lib/audit-log'

export async function POST(req: Request) {
  try {
    const userId = await requireUser(req)

    const okUser = await checkRateLimit(`pw:user:${userId}`, 5, 3600)
    const okIp = await checkRateLimit(`pw:ip:${getClientIp(req)}`, 20, 3600)
    if (!okUser || !okIp) {
      throw new HttpError('Too many attempts. Please try again later.', 429)
    }

    const body = await req.json().catch(() => null)
    const currentPassword = String(body?.currentPassword || '')
    const newPassword = String(body?.newPassword || '')

    if (!currentPassword) throw new HttpError('Please enter your current password', 400)
    if (newPassword.length < 8 || newPassword.length > 72) {
      throw new HttpError('New password must be between 8 and 72 characters', 400)
    }
    if (newPassword === currentPassword) {
      throw new HttpError('New password must be different from the current one', 400)
    }

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
    const email = userData?.user?.email
    if (!email) throw new HttpError('Could not verify your account', 400)

    // Check the CURRENT password with a throwaway client (nothing is saved)
    const verifier = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { error: verifyError } = await verifier.auth.signInWithPassword({
      email,
      password: currentPassword,
    })
    if (verifyError) throw new HttpError('Your current password is incorrect', 400)

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })
    if (updateError) {
      console.error('Password update error:', updateError.message)
      throw new HttpError('Failed to update password', 400)
    }

    // Log out every other device (best effort)
    try {
      const token = req.headers.get('authorization')!.slice(7)
      await supabaseAdmin.auth.admin.signOut(token, 'others')
    } catch {}

    await logAudit({ userId, action: 'password_changed' })

    return NextResponse.json({ success: true, message: 'Password updated successfully!' })
  } catch (error: any) {
    const isHttp = error instanceof HttpError
    if (!isHttp) console.error('Password change error:', error)
    return NextResponse.json(
      { error: isHttp ? error.message : 'Failed to change password' },
      { status: isHttp ? error.status : 500 }
    )
  }
}