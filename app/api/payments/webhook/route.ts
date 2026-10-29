// app/api/payments/webhook/route.ts  (NEW FILE)
// Razorpay calls this by itself after a payment or refund. It is the source of truth for money.
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyWebhookSignature, isOrderId, isPaymentId } from '@/lib/razorpay'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  // The signature is calculated on the RAW text, so read it before parsing
  const raw = await req.text()
  if (raw.length > 1_000_000) {
    return NextResponse.json({ error: 'Too large' }, { status: 413 })
  }

  if (!verifyWebhookSignature(raw, req.headers.get('x-razorpay-signature'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  let event: any
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  try {
    const type: string = event?.event || ''

    if (type === 'payment.captured' || type === 'order.paid') {
      const p = event?.payload?.payment?.entity
      if (isOrderId(p?.order_id) && isPaymentId(p?.id) && p?.status === 'captured') {
        const { data: result, error } = await supabaseAdmin.rpc('fulfill_payment', {
          p_order_id: p.order_id,
          p_payment_id: p.id,
          p_amount: p.amount,
          p_currency: p.currency,
        })
        if (error) throw error
        if (result !== 'ok' && result !== 'already') {
          console.error('⚠️ Webhook payment not fulfilled:', result, p.order_id)
        }
      }
    } else if (type === 'refund.processed') {
      const r = event?.payload?.refund?.entity
      if (isPaymentId(r?.payment_id)) {
        const { error } = await supabaseAdmin.rpc('revoke_payment', {
          p_payment_id: r.payment_id,
          p_refund_amount: r.amount,
        })
        if (error) throw error
      }
    }
    // other events are acknowledged and ignored

    const eventId = req.headers.get('x-razorpay-event-id')
    if (eventId) {
      await supabaseAdmin
        .from('payment_events')
        .upsert({ event_id: eventId, event_type: type }, { onConflict: 'event_id', ignoreDuplicates: true })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('❌ Webhook processing error:', err)
    // A 500 makes Razorpay try again later. Processing is safe to repeat.
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}