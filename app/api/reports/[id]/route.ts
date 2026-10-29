// app/api/reports/[id]/route.ts  (COMPLETE FILE - replace the old one)
// BEFORE: anyone who knew a scan id could read that report.
// NOW: you must be signed in, and the scan must be YOURS.
import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { requireUser, HttpError } from "@/lib/auth-server"
   

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUser(request)
    const { id: scanId } = await params

    if (!UUID_RE.test(scanId)) {
      throw new HttpError("Report not found", 404)
    }

    // The "user_id = you" condition is what stops people reading each other's reports
    const { data: scan } = await supabaseAdmin
      .from("scans")
      .select("*")
      .eq("id", scanId)
      .eq("user_id", userId)
      .maybeSingle()

    if (!scan) {
      throw new HttpError("Report not found", 404)
    }

    const { data: vulnerabilities, error: vulnError } = await supabaseAdmin
      .from("vulnerabilities")
      .select("*")
      .eq("scan_id", scanId)
      .order("severity", { ascending: true })

    if (vulnError) {
      console.error("Vulnerability fetch error:", vulnError)
    }

    return NextResponse.json({ scan, vulnerabilities: vulnerabilities || [] })
  } catch (error: any) {
    const isHttp = error instanceof HttpError
    if (!isHttp) console.error("Report API error:", error)
    return NextResponse.json(
      { error: isHttp ? error.message : "Internal server error" },
      { status: isHttp ? error.status : 500 }
    )
  }
}