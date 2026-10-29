// app/api/payments/verify/route.ts  (NEW FILE)
// Called by the browser right after paying. The webhook is the safety net if this call never arrives.
import { NextResponse } from 'next/server'
import { requireUser, HttpError } from '@/lib/auth-server'
import { checkRateLimit } from '@/lib/rate-limit'
import { supabaseAdmin } from '@/lib/supabase'
import {
  verifyCheckoutSignature,
  fetchPayment,
  capturePayment,
  isOrderId,
  isPaymentId,
} from '@/lib/razorpay'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const userId = await requireUser(req)

    if (!(await checkRateLimit(`pay:verify:${userId}`, 20, 3600))) {
      throw new HttpError('Too many attempts. Please wait and try again.', 429)
    }

    const body = await req.json().catch(() => null)
    const orderId = body?.razorpay_order_id
    const paymentId = body?.razorpay_payment_id
    const signature = body?.razorpay_signature

    if (!isOrderId(orderId) || !isPaymentId(paymentId) || typeof signature !== 'string') {
      throw new HttpError('Invalid payment details', 400)
    }

    // 1. The signature proves Razorpay (not the browser) produced these ids
    if (!verifyCheckoutSignature(orderId, paymentId, signature)) {
      throw new HttpError('Payment verification failed', 400)
    }

    // 2. The order must be one THIS user created
    const { data: pay } = await supabaseAdmin
      .from('payments')
      .select('user_id')
      .eq('provider_order_id', orderId)
      .maybeSingle()
    if (!pay || pay.user_id !== userId) {
      throw new HttpError('Payment not found', 404)
    }

    // 3. Ask Razorpay directly what really happened (never trust the browser's word)
    let payment = await fetchPayment(paymentId)
    if (payment.order_id !== orderId) {
      throw new HttpError('Payment verification failed', 400)
    }
    if (payment.status === 'authorized') {
      payment = await capturePayment(paymentId, payment.amount, payment.currency)
    }
    if (payment.status !== 'captured') {
      throw new HttpError('Your payment is not complete yet. If money was deducted, Pro will activate automatically.', 409)
    }

    // 4. Grant Pro in one safe database step (checks the amount matches what we asked for)
    const { data: result, error } = await supabaseAdmin.rpc('fulfill_payment', {
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_amount: payment.amount,
      p_currency: payment.currency,
    })
    if (error || (result !== 'ok' && result !== 'already')) {
      console.error('❌ fulfill_payment problem:', result, error)
      throw new Error('fulfil failed')
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    const isHttp = err instanceof HttpError
    if (!isHttp) console.error('❌ verify error:', err)
    return NextResponse.json(
      { error: isHttp ? err.message : 'We could not confirm your payment yet. If money was deducted, Pro will activate automatically within a few minutes.' },
      { status: isHttp ? err.status : 500 }
    )
  }
}