// app/api/api-keys/route.ts  (COMPLETE FILE - replace the old one)
// Only a HASH of each key is stored. The real key is shown once, when it is created.
import { NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { requireUser, HttpError } from '@/lib/auth-server'
import { checkRateLimit } from '@/lib/rate-limit'

const MAX_KEYS_PER_USER = 10
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const generateApiKey = () => `pk_${randomBytes(32).toString('hex')}`
const hashKey = (key: string) => createHash('sha256').update(key).digest('hex')

function fail(error: any, fallback: string) {
  const isHttp = error instanceof HttpError
  if (!isHttp) console.error(fallback, error)
  return NextResponse.json(
    { error: isHttp ? error.message : fallback },
    { status: isHttp ? error.status : 500 }
  )
}

// GET - list my keys (the key value itself is never returned)
export async function GET(req: Request) {
  try {
    const userId = await requireUser(req)

    const { data: keys, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, name, key_prefix, created_at, last_used_at, is_active, expires_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ keys })
  } catch (error) {
    return fail(error, 'Failed to fetch API keys')
  }
}

// POST - create a key
export async function POST(req: Request) {
  try {
    const userId = await requireUser(req)

    if (!(await checkRateLimit(`apikey:user:${userId}`, 10, 3600))) {
      throw new HttpError('Too many requests. Please try again later.', 429)
    }

    const body = await req.json().catch(() => null)
    const name = String(body?.name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 50)
    if (!name) throw new HttpError('API key name is required', 400)

    const { count } = await supabaseAdmin
      .from('api_keys')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
    if ((count ?? 0) >= MAX_KEYS_PER_USER) {
      throw new HttpError(`You can have at most ${MAX_KEYS_PER_USER} API keys. Delete one first.`, 400)
    }

    const apiKey = generateApiKey()

    const { data: keyData, error } = await supabaseAdmin
      .from('api_keys')
      .insert({
        user_id: userId,
        name,
        key_hash: hashKey(apiKey),
        key_prefix: apiKey.slice(0, 8),
        is_active: true,
      })
      .select('id, name, created_at, key_prefix')
      .single()

    if (error) throw error

    // The real key is returned ONCE. We cannot show it again because we do not store it.
    return NextResponse.json({
      success: true,
      apiKey,
      keyData: { id: keyData.id, name: keyData.name, created_at: keyData.created_at },
    })
  } catch (error) {
    return fail(error, 'Failed to create API key')
  }
}

// DELETE - revoke one of my keys
export async function DELETE(req: Request) {
  try {
    const userId = await requireUser(req)

    const keyId = new URL(req.url).searchParams.get('id') || ''
    if (!UUID_RE.test(keyId)) throw new HttpError('API key ID is required', 400)

    const { error } = await supabaseAdmin
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId) // you can only delete your own

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return fail(error, 'Failed to delete API key')
  }
}