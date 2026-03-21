// app/api/email/welcome/route.ts - CREATE THIS FILE
import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, userName } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    console.log('📧 Sending welcome email to:', email, 'Name:', userName)

    await sendWelcomeEmail({
      userEmail: email,
      userName: userName || 'there'
    })

    console.log('✅ Welcome email sent successfully!')

    return NextResponse.json({ 
      success: true,
      message: 'Welcome email sent' 
    })
  } catch (error: any) {
    console.error('❌ Failed to send welcome email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}