// app/api/user/scans/route.ts  (COMPLETE FILE - replace the old one)
// BEFORE: ?userId=anyone returned that person's scans. NOW: you only ever get YOUR scans.
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireUser, HttpError } from '@/lib/auth-server'
   

export async function GET(request: NextRequest) {
  try {
    const userId = await requireUser(request) // taken from the login token, never from the URL

    const { data: scans, error } = await supabaseAdmin
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error

    return NextResponse.json({ scans: scans || [] })
  } catch (error: any) {
    const isHttp = error instanceof HttpError
    if (!isHttp) console.error('Error:', error)
    return NextResponse.json(
      { error: isHttp ? error.message : 'Failed to fetch scans' },
      { status: isHttp ? error.status : 500 }
    )
  }
}