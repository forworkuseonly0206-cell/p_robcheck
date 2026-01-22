import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: scanId } = await params

    if (!scanId) {
      return NextResponse.json({ error: "Missing scan id" }, { status: 400 })
    }

    const { data: scan, error: scanError } = await supabaseAdmin
      .from("scans")
      .select("*")
      .eq("id", scanId)
      .single()

    if (scanError || !scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 })
    }

    const { data: vulnerabilities, error: vulnError } = await supabaseAdmin
      .from("vulnerabilities")
      .select("*")
      .eq("scan_id", scanId)
      .order("severity", { ascending: true })

    if (vulnError) {
      console.error("Vulnerability fetch error:", vulnError)
    }

    return NextResponse.json({
      scan,
      vulnerabilities: vulnerabilities || [],
    })
  } catch (error) {
    console.error("Report API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
