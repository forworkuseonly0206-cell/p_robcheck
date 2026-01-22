// lib/supabase.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js'



const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''



// Create clients

const supabaseClient =

  supabaseUrl && supabaseAnonKey

    ? createClient(supabaseUrl, supabaseAnonKey)

    : null



const supabaseAdminClient =

  supabaseUrl && (supabaseServiceKey || supabaseAnonKey)

    ? createClient(

        supabaseUrl,

        supabaseServiceKey || supabaseAnonKey,

        {

          auth: {

            autoRefreshToken: false,

            persistSession: false

          }

        }

      )

    : null



// Export clients (with non-null assertion for convenience)

export const supabase = supabaseClient as SupabaseClient

export const supabaseAdmin = supabaseAdminClient as SupabaseClient



// Export ready check function

export function isSupabaseReady(): boolean {

  return supabaseClient !== null && supabaseAdminClient !== null

} 