// next.config.mjs  (COMPLETE FILE - replace the old one)
const isDev = process.env.NODE_ENV !== 'production'

// Tells the browser what the site is allowed to load, which blocks most injected-script attacks.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com${isDev ? ' ws://localhost:*' : ''}`,
  "frame-src https://api.razorpay.com https://checkout.razorpay.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },                       // nobody can embed your site (clickjacking)
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(isDev
    ? []
    : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]), // always HTTPS
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false, // do not advertise "Next.js" to attackers
  typescript: {
    // TODO before launch: set to false so type mistakes are caught. Run `npx tsc --noEmit` first.
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
