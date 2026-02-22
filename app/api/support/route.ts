// app/api/support/route.ts
import { NextResponse } from 'next/server'
import { sendSupportRequest, hasPrioritySupport } from '@/lib/priority-support'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, userEmail, userName, subject, message, priority } = body

    // Validate inputs
    if (!userId || !userEmail || !userName || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify priority support eligibility
    const isPriorityEligible = await hasPrioritySupport(userId)
    const actualPriority = (priority === 'high' && isPriorityEligible) ? 'high' : 'normal'

    // Send support request
    await sendSupportRequest({
      userId,
      userEmail,
      userName,
      subject,
      message,
      priority: actualPriority
    })

    return NextResponse.json({
      success: true,
      message: 'Support request sent successfully',
      priority: actualPriority
    })
  } catch (error: any) {
    console.error('Support request error:', error)
    return NextResponse.json(
      { error: 'Failed to send support request' },
      { status: 500 }
    )
  }
}