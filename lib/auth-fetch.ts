// lib/auth-fetch.ts  (NEW FILE)  Browser helper: like fetch(), but proves who you are to the server.
import { supabase } from '@/lib/supabase'

export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Please sign in again.')

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  return fetch(input, { ...init, headers })
}