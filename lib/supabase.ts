// lib/supabase.ts  (COMPLETE FILE - replace the old one)
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Browser-safe client (uses only the public key)
const supabaseClient =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const supabase = supabaseClient as SupabaseClient

// Admin client = full database access. SERVER ONLY.
// CHANGED: before, a missing secret key silently fell back to the public key, which hid
// problems. Now it refuses to work in the browser and fails loudly if the key is missing.
let adminClient: SupabaseClient | null = null

function getAdmin(): SupabaseClient {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin can only be used on the server')
  }
  if (adminClient) return adminClient

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return adminClient
}

// Created only when first used, so building the site never needs the secret key
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getAdmin() as any
    const value = client[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})

// Used by the browser code to know whether login is configured
export function isSupabaseReady(): boolean {
  return supabaseClient !== null
}