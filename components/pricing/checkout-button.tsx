// components/pricing/checkout-button.tsx  (NEW FILE)
"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    Razorpay?: any
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

interface CheckoutButtonProps {
  planKey: "pro_monthly" | "pro_yearly"
  currency: "INR" | "USD"
  label?: string
  onSuccess?: () => void
}

export function CheckoutButton({ planKey, currency, label = "Upgrade to Pro", onSuccess }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleClick() {
    setMessage(null)
    setLoading(true)

    try {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session) {
        setMessage("Please sign in first.")
        setLoading(false)
        return
      }
      const authHeader = { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }

      if (!(await loadRazorpayScript())) {
        setMessage("Could not load the payment window. Check your connection and try again.")
        setLoading(false)
        return
      }

      // 1. Ask OUR server to create the order. The price is decided there, not here.
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: authHeader,
        body: JSON.stringify({ planKey, currency }),
      })
      const order = await res.json()
      if (!res.ok) {
        setMessage(order?.error || "Could not start the payment.")
        setLoading(false)
        return
      }

      // 2. Open Razorpay's secure payment window (your site never sees card details)
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "ProbCheck",
        description: order.planName,
        order_id: order.orderId,
        prefill: { email: session.user.email },
        theme: { color: "#1e2d10" },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response: any) => {
          // 3. Ask our server to confirm the payment with Razorpay
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: authHeader,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            const result = await verifyRes.json()
            if (verifyRes.ok) {
              setMessage("Payment successful! Pro is now active.")
              onSuccess?.()
              setTimeout(() => window.location.reload(), 1500)
            } else {
              setMessage(result?.error || "We could not confirm your payment yet. If money was deducted, Pro will activate automatically within a few minutes.")
            }
          } catch {
            setMessage("We could not confirm your payment yet. If money was deducted, Pro will activate automatically within a few minutes.")
          }
          setLoading(false)
        },
      })

      rzp.on("payment.failed", () => {
        setMessage("The payment failed. You can try again.")
        setLoading(false)
      })

      rzp.open()
    } catch {
      setMessage("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleClick} disabled={loading} className="w-full">
        {loading ? "Please wait..." : label}
      </Button>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}