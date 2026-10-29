// lib/verify-token.ts
// Short-lived signed proof that "this email passed the OTP step".
// Stateless: signed with a server secret, so it can't be forged or reused for another email.
import crypto from 'crypto'

const secret = () => {
  const s = process.env.OTP_TOKEN_SECRET
  if (!s) throw new Error('OTP_TOKEN_SECRET is not set')
  return s
}

const sign = (payload: string) =>
  crypto.createHmac('sha256', secret()).update(payload).digest('hex')

export function makeVerifyToken(email: string, ttlMs = 15 * 60 * 1000) {
  const payload = `${email.toLowerCase()}|${Date.now() + ttlMs}`
  return Buffer.from(`${payload}|${sign(payload)}`).toString('base64url')
}

export function checkVerifyToken(token: string, email: string) {
  try {
    const [tokenEmail, exp, sig] = Buffer.from(token, 'base64url').toString().split('|')
    const expected = sign(`${tokenEmail}|${exp}`)
    const sigOk =
      sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    return sigOk && tokenEmail === email.toLowerCase() && Number(exp) > Date.now()
  } catch {
    return false
  }
}