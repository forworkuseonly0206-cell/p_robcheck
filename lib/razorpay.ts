// lib/razorpay.ts  (NEW FILE)
// Everything that talks to Razorpay. SERVER ONLY. Uses plain fetch, so no extra package to trust.
import crypto from 'crypto'

import type { Currency } from '@/lib/plans'

// Plans and prices now live in lib/plans.ts (so the browser can show them too).
// Re-exported here so the payment routes keep working unchanged.
export { PLANS, isPlanKey, isCurrency } from '@/lib/plans'
export type { Currency, PlanKey } from '@/lib/plans'

// IDs go into URLs, so only well-formed ones are accepted
export const isOrderId = (v: unknown): v is string => typeof v === 'string' && /^order_[A-Za-z0-9]{6,40}$/.test(v)
export const isPaymentId = (v: unknown): v is string => typeof v === 'string' && /^pay_[A-Za-z0-9]{6,40}$/.test(v)

const API = 'https://api.razorpay.com/v1'

function authHeader(): string {
  const id = process.env.RAZORPAY_KEY_ID
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!id || !secret) throw new Error('Razorpay keys are not set')
  return 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64')
}

async function razorpay(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(20_000),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    console.error('❌ Razorpay error:', res.status, data?.error) // details stay in the server log
    throw new Error('Payment provider error')
  }
  return data
}

export function createOrder(amount: number, currency: Currency, receipt: string, notes: Record<string, string>) {
  return razorpay('/orders', { method: 'POST', body: JSON.stringify({ amount, currency, receipt, notes }) })
}

export function fetchPayment(paymentId: string) {
  if (!isPaymentId(paymentId)) throw new Error('Invalid payment id')
  return razorpay(`/payments/${paymentId}`)
}

export function capturePayment(paymentId: string, amount: number, currency: string) {
  if (!isPaymentId(paymentId)) throw new Error('Invalid payment id')
  return razorpay(`/payments/${paymentId}/capture`, { method: 'POST', body: JSON.stringify({ amount, currency }) })
}

function safeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from(a, 'utf8')
  const y = Buffer.from(b, 'utf8')
  return x.length === y.length && crypto.timingSafeEqual(x, y)
}

// The signature the browser gets after paying: HMAC(order_id|payment_id) with your secret key
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret || typeof signature !== 'string') return false
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')
  return safeEqualHex(expected, signature)
}

// The signature on webhook calls: HMAC(raw body) with your webhook secret
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return safeEqualHex(expected, signature)
}