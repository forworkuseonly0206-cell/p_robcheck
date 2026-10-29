// lib/plans.ts  (NEW FILE)  Plans and prices. No secrets in here, so the browser may read it.

export type Currency = 'INR' | 'USD'

// ⚠️ SET YOUR REAL PRICES HERE. These are PLACEHOLDERS.
// The server uses these numbers to charge; the browser only uses them to display.
// Amounts are in the smallest unit: paise for INR (49900 = ₹499), cents for USD (900 = $9).
export const PLANS = {
  pro_monthly: { name: 'ProbCheck Pro (1 month)', days: 30, prices: { INR: 49900, USD: 900 } },
  pro_yearly: { name: 'ProbCheck Pro (1 year)', days: 365, prices: { INR: 499900, USD: 9000 } },
} as const

export type PlanKey = keyof typeof PLANS

export function isPlanKey(v: unknown): v is PlanKey {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(PLANS, v)
}

export function isCurrency(v: unknown): v is Currency {
  return v === 'INR' || v === 'USD'
}

export function formatPrice(amount: number, currency: Currency): string {
  const value = amount / 100
  return currency === 'INR'
    ? `₹${value.toLocaleString('en-IN')}`
    : `$${value.toLocaleString('en-US')}`
}