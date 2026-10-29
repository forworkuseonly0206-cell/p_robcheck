// lib/email.ts  (COMPLETE FILE - replace the old one)
// Changes: every piece of user text is escaped before going into an email (no HTML injection),
// the public-key fallback for the Resend key is gone, and the emails match the new brand.
import { Resend } from 'resend'

let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    // Only the SERVER-ONLY key. A key named NEXT_PUBLIC_... can end up in browser code.
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY is not defined in environment variables')
      throw new Error('RESEND_API_KEY is not defined in environment variables')
    }
    resendInstance = new Resend(apiKey)
  }
  return resendInstance
}

const FROM_EMAIL = 'ProbCheck <noreply@probcheck.in>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Turns < > & " ' in user text into harmless characters
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function layout(heading: string, inner: string, headerColor = '#1e2d10'): string {
  return `<!DOCTYPE html>
<html>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;color:#101a0a;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:${headerColor};padding:28px;text-align:center;border-radius:10px 10px 0 0;">
    <h1 style="color:#c8f56a;margin:0;font-size:22px;">${esc(heading)}</h1>
  </div>
  <div style="background:#f7fbef;padding:28px;border-radius:0 0 10px 10px;">${inner}</div>
  <p style="text-align:center;color:#5a6a4c;font-size:13px;margin-top:20px;">
    ProbCheck &middot; <a href="${APP_URL}" style="color:#1e2d10;">Open dashboard</a>
  </p>
</body>
</html>`
}

const button = (href: string, label: string) =>
  `<p style="text-align:center;margin:24px 0;"><a href="${href}" style="display:inline-block;background:#1e2d10;color:#c8f56a;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;">${esc(label)}</a></p>`

const box = (color: string, inner: string) =>
  `<div style="background:#fff;border-left:4px solid ${color};padding:14px 16px;border-radius:4px;margin:18px 0;">${inner}</div>`

/**
 * Send OTP verification email (sign-up codes are now sent by lib/auth-email.ts; kept for compatibility)
 */
export async function sendOTPEmail(data: { email: string; otp: string; type: 'signup' | 'signin' }) {
  const resend = getResend()
  await resend.emails.send({
    from: FROM_EMAIL,
    to: data.email,
    subject: 'Your ProbCheck verification code',
    html: layout(
      'Verification Code',
      `<p>Your code for ${data.type === 'signup' ? 'creating your ProbCheck account' : 'signing in to ProbCheck'} is:</p>
       <p style="text-align:center;font-size:40px;font-weight:bold;letter-spacing:8px;font-family:'Courier New',monospace;">${esc(data.otp)}</p>
       <p style="color:#5a6a4c;font-size:14px;">This code expires in 10 minutes. Never share it with anyone.</p>`
    ),
  })
}

/**
 * Send scan completion email (supports errors and warnings)
 */
export async function sendScanCompleteEmail(data: {
  userEmail: string
  userName?: string | undefined
  scanId: string
  projectName: string
  summary: { critical: number; high: number; medium: number; low: number }
  filesScanned: number
  error?: string
  warnings?: string[]
  selectedLanguage?: string
}) {
  try {
    const resend = getResend()
    const total = data.summary.critical + data.summary.high + data.summary.medium + data.summary.low
    const reportUrl = `${APP_URL}/reports/${encodeURIComponent(data.scanId)}`
    const hasError = !!data.error
    const warnings = (data.warnings || []).slice(0, 10)

    let inner = `<p>Hi ${esc(data.userName || 'there')},</p>`

    if (hasError) {
      inner += box('#dc2626', `<strong>The scan did not finish</strong><br>${esc(data.error)}`)
      inner += `<p><strong>Project:</strong> ${esc(data.projectName)}<br>
        <strong>Selected language:</strong> ${esc(data.selectedLanguage || 'All')}</p>
        <p style="color:#5a6a4c;font-size:14px;">Make sure your ZIP contains files for the selected language, or select all languages for a mixed project. This does not mean your code is safe.</p>`
    } else {
      inner += `<p>Your scan of <strong>${esc(data.projectName)}</strong> is complete.
        Files scanned: <strong>${esc(data.filesScanned)}</strong>.</p>`

      if (warnings.length > 0) {
        inner += box('#f59e0b', `<strong>Warnings</strong><ul style="margin:8px 0 0 0;">${warnings.map(w => `<li>${esc(w)}</li>`).join('')}</ul>`)
      }

      if (total > 0) {
        inner += `<p><strong>Vulnerabilities found: ${esc(total)}</strong></p>
          <p>Critical: <strong>${esc(data.summary.critical)}</strong> &nbsp;
             High: <strong>${esc(data.summary.high)}</strong> &nbsp;
             Medium: <strong>${esc(data.summary.medium)}</strong> &nbsp;
             Low: <strong>${esc(data.summary.low)}</strong></p>`
        if (data.summary.critical > 0 || data.summary.high > 0) {
          inner += box('#dc2626', 'Critical or high-severity issues were found. We recommend fixing these first.')
        }
      } else {
        inner += box('#22c55e', 'No vulnerabilities were detected by this scan. An automated scan cannot prove that code is fully secure.')
      }

      inner += button(reportUrl, 'View full report')
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.userEmail,
      subject: hasError ? 'Your ProbCheck scan did not finish' : 'Your ProbCheck scan is complete',
      html: layout(hasError ? 'Scan Did Not Finish' : 'Scan Complete', inner, hasError ? '#7f1d1d' : '#1e2d10'),
    })
  } catch (error) {
    console.error('Failed to send scan complete email:', error)
  }
}

/**
 * Send scan limit reached email (upgrade reminder)
 */
export async function sendScanLimitEmail(data: {
  userEmail: string
  userName?: string | undefined
  scansUsed: number
  planName: string
}) {
  try {
    const resend = getResend()
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.userEmail,
      subject: 'You have used your ProbCheck scans',
      html: layout(
        'Scan Limit Reached',
        `<p>Hi ${esc(data.userName || 'there')},</p>
         <p>You have used all <strong>${esc(data.scansUsed)}</strong> scan${data.scansUsed !== 1 ? 's' : ''} included in your ${esc(data.planName)} plan.</p>
         <p>Pro gives you unlimited scans and the advanced scanner. See the plans and prices on our pricing page.</p>
         ${button(`${APP_URL}/pricing`, 'View plans')}`
      ),
    })
  } catch (error) {
    console.error('Failed to send scan limit email:', error)
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: { userEmail: string; userName?: string | undefined }) {
  try {
    const resend = getResend()
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.userEmail,
      subject: 'Welcome to ProbCheck',
      html: layout(
        'Welcome to ProbCheck',
        `<p>Hi ${esc(data.userName || 'there')},</p>
         <p>Thanks for signing up. Here is how to run your first scan:</p>
         <ol>
           <li><strong>Prepare your code:</strong> zip your project folder, or copy a public repository link.</li>
           <li><strong>Upload and scan:</strong> open "New Scan" and choose your files.</li>
           <li><strong>Review results:</strong> every finding comes with a suggested fix.</li>
         </ol>
         ${button(`${APP_URL}/scan`, 'Start your first scan')}
         <p style="color:#5a6a4c;font-size:14px;">Your free plan includes 1 scan. Need more? Have a look at <a href="${APP_URL}/pricing" style="color:#1e2d10;">Pro</a>.</p>`
      ),
    })
  } catch (error) {
    console.error('Failed to send welcome email:', error)
  }
}