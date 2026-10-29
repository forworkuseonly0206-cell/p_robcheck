// app/api/payments/create-order/route.ts  (NEW FILE)
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireUser, HttpError } from '@/lib/auth-server'
import { checkRateLimit } from '@/lib/rate-limit'
import { supabaseAdmin } from '@/lib/supabase'
import { PLANS, createOrder, isPlanKey, isCurrency } from '@/lib/razorpay'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const userId = await requireUser(req) // must be signed in

    if (!(await checkRateLimit(`pay:order:${userId}`, 10, 3600))) {
      throw new HttpError('Too many payment attempts. Please wait and try again.', 429)
    }

    const body = await req.json().catch(() => null)
    const planKey = body?.planKey
    const currency = body?.currency

    if (!isPlanKey(planKey) || !isCurrency(currency)) {
      throw new HttpError('Invalid plan or currency', 400)
    }

    // The PRICE comes from the server only. Nothing in the request can change it.
    const plan = PLANS[planKey]
    const amount = plan.prices[currency]

    const receipt = `pc_${crypto.randomBytes(16).toString('hex')}`
    const order = await createOrder(amount, currency, receipt, { user_id: userId, plan: planKey })

    const { error } = await supabaseAdmin.from('payments').insert({
      user_id: userId,
      provider_order_id: order.id,
      plan_key: planKey,
      plan_days: plan.days,
      amount,
      currency,
    })
    if (error) {
      console.error('❌ Could not save payment record:', error)
      throw new Error('save failed')
    }

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency,
      planName: plan.name,
      keyId: process.env.RAZORPAY_KEY_ID, // the PUBLIC key id; the secret never leaves the server
    })
  } catch (err: any) {
    const isHttp = err instanceof HttpError
    if (!isHttp) console.error('❌ create-order error:', err)
    return NextResponse.json(
      { error: isHttp ? err.message : 'Could not start the payment. Please try again.' },
      { status: isHttp ? err.status : 500 }
    )
  }
}