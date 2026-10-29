// app/api/support/route.ts  (COMPLETE FILE - replace the old one)
// BEFORE: the sender's identity and "priority" came from the request body, so anyone could
// pretend to be any user. NOW: who you are comes from your login, and messages are limited.
import { NextResponse } from 'next/server'
import { sendSupportRequest, hasPrioritySupport } from '@/lib/priority-support'
import { supabaseAdmin } from '@/lib/supabase'
import { requireUser, HttpError } from '@/lib/auth-server'
import { checkRateLimit } from '@/lib/rate-limit'
  

export async function POST(req: Request) {
  try {
    const userId = await requireUser(req)

    if (!(await checkRateLimit(`support:user:${userId}`, 5, 3600))) {
      throw new HttpError('Too many messages. Please try again later.', 429)
    }

    const body = await req.json().catch(() => null)
    // No line breaks in the subject (stops email header tricks)
    const subject = String(body?.subject || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 150)
    const message = String(body?.message || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, 5000)

    if (!subject || !message) {
      throw new HttpError('Please fill in the subject and the message', 400)
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!profile?.email) throw new HttpError('Could not find your account', 400)

    const isPriorityEligible = await hasPrioritySupport(userId)
    const actualPriority = body?.priority === 'high' && isPriorityEligible ? 'high' : 'normal'

    await sendSupportRequest({
      userId,
      userEmail: profile.email,
      userName: profile.full_name || 'User',
      subject,
      message,
      priority: actualPriority,
    })

    return NextResponse.json({
      success: true,
      message: 'Support request sent successfully',
      priority: actualPriority,
    })
  } catch (error: any) {
    const isHttp = error instanceof HttpError
    if (!isHttp) console.error('Support request error:', error)
    return NextResponse.json(
      { error: isHttp ? error.message : 'Failed to send support request' },
      { status: isHttp ? error.status : 500 }
    )
  }
}