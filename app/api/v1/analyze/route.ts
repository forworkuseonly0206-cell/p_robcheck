// app/api/v1/analyze/route.ts (COMPLETE FILE)
// Dedicated stateless endpoint for the ProbCheck VS Code Extension:
//  - Signs in with a pk_... API key generated on the website
//  - Saves NOTHING about the code, findings, or fixes to the website database
//  - Automatically routes Free users to Groq and Pro users to Claude
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp, HttpError } from '@/lib/auth-server'
import { analyzeFile } from '@/lib/analysis-engine'
import { callGeminiJSON, callClaudeJSON } from '@/lib/openai'

export const runtime = 'nodejs'
export const maxDuration = 60

const DAILY_LIMIT = { free: 25, pro: 500 }
const MAX_CONTENT_CHARS = 200_000

const SENSITIVE_FILE = /(^|[\\/])(\.env[^\\/]*|id_rsa[^\\/]*|[^\\/]+\.(pem|key|p12|pfx))$/i

async function authenticate(req: Request): Promise<{ userId: string; plan: 'free' | 'pro' }> {
  const header = req.headers.get('authorization') || ''
  const key = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!/^pk_[0-9a-f]{64}$/.test(key)) throw new HttpError('Invalid API key', 401)

  const keyHash = crypto.createHash('sha256').update(key).digest('hex')
  const { data: row } = await supabaseAdmin
    .from('api_keys')
    .select('id, user_id, is_active, expires_at')
    .eq('key_hash', keyHash)
    .maybeSingle()

  if (!row || !row.is_active || (row.expires_at && new Date(row.expires_at) < new Date())) {
    throw new HttpError('Invalid or revoked API key', 401)
  }

  await supabaseAdmin.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', row.id)

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan_type, pro_until')
    .eq('id', row.user_id)
    .single()

  const planType = String(profile?.plan_type || 'free').toLowerCase()
  const proActive =
    (planType === 'pro' && (!profile?.pro_until || new Date(profile.pro_until) > new Date())) ||
    planType === 'enterprise'

  return { userId: row.user_id, plan: proActive ? 'pro' : 'free' }
}

function fail(error: any) {
  const isHttp = error instanceof HttpError
  if (!isHttp) console.error('❌ analyze error:', error)
  return NextResponse.json(
    { error: isHttp ? error.message : 'Analysis failed. Please try again.' },
    { status: isHttp ? error.status : 500 }
  )
}

// GET: Verifies API key and returns user plan ('free' or 'pro')
export async function GET(req: Request) {
  try {
    const { plan } = await authenticate(req)
    return NextResponse.json({ ok: true, plan })
  } catch (error) {
    return fail(error)
  }
}

// POST: Runs stateless 4-Gate Bug Bounty analysis on one file
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (!(await checkRateLimit(`ext:ip:${ip}`, 300, 3600))) {
      throw new HttpError('Too many requests. Please slow down.', 429)
    }

    const { userId, plan } = await authenticate(req)

    if (!(await checkRateLimit(`ext:burst:${userId}`, 12, 60))) {
      throw new HttpError('Too many checks in a minute. Please wait a moment.', 429)
    }
    if (!(await checkRateLimit(`ext:day:${userId}`, DAILY_LIMIT[plan], 86_400))) {
      throw new HttpError(
        plan === 'free'
          ? `You reached today's limit of ${DAILY_LIMIT.free} AI checks. Upgrade to Pro on probcheck.in for 500 daily Claude checks.`
          : "You reached today's limit of AI checks. It resets within 24 hours.",
        429
      )
    }

    const body = await req.json().catch(() => null)
    const path = String(body?.path || 'file').slice(0, 300)
    const content = typeof body?.content === 'string' ? body.content : ''

    if (!content.trim()) throw new HttpError('The file is empty', 400)
    if (content.length > MAX_CONTENT_CHARS) throw new HttpError('This file is too large to analyze (200 KB maximum)', 400)
    if (SENSITIVE_FILE.test(path)) throw new HttpError('This type of file is not analyzed, to protect your secrets', 400)

    const result = await analyzeFile(
      { path, content },
      plan === 'pro' ? callClaudeJSON : callGeminiJSON
    )

    if (result.failed && result.findings.length === 0) {
      throw new Error('analysis failed')
    }

    const warnings: string[] = []
    if (result.failed) warnings.push('Part of this file could not be analyzed.')
    if (result.truncated) warnings.push('This file is very large, so only part of it was analyzed.')

    return NextResponse.json({ findings: result.findings, warnings, plan })
  } catch (error) {
    return fail(error)
  }
}