// lib/scan-store.ts - COMPLETELY FIXED VERSION
import { supabaseAdmin } from "@/lib/supabase"

let lastReport: any = null

export function setLastReport(report: any) {
  lastReport = report
}

export function getLastReport() {
  return lastReport
}

// ✅ FIXED: Accept string, handle internally
export async function createScan(data: {
  user_id: string
  scan_name: string
  repository_name?: string | null // Allow null
}) {
  const { data: scan, error } = await supabaseAdmin
    .from("scans")
    .insert({
      user_id: data.user_id,
      scan_name: data.scan_name,
      repository_name: data.repository_name || null, // Handle null
      status: "pending",
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Failed to create scan:", error)
    return null
  }

  return scan
}

export async function updateScanStatus(
  scanId: string,
  status: string,
  progress: number
) {
  await supabaseAdmin
    .from("scans")
    .update({ status, scan_progress: progress })
    .eq("id", scanId)
}

export async function saveVulnerabilitiesToDB(
  scanId: string,
  results: Array<{
    path: string
    findings: Array<{
      severity: string
      title?: string | null
      description: string
      suggestedFix?: string | null
      snippet?: string | null
      cwe?: string | null
      line?: number | null
    }>
  }>
) {
  const vulnerabilities = []

  for (const result of results) {
    for (const finding of result.findings) {
      vulnerabilities.push({
        scan_id: scanId,
        title: finding.title || "Security Vulnerability",
        severity: finding.severity.toLowerCase(),
        description: finding.description || "No description provided",
        file_path: result.path || "unknown",
        line_number: finding.line || null,
        code_snippet: finding.snippet || null,
        suggested_fix: finding.suggestedFix || null,
        cwe: finding.cwe || null,
        created_at: new Date().toISOString(),
      })
    }
  }

  if (vulnerabilities.length > 0) {
    const { error } = await supabaseAdmin
      .from("vulnerabilities")
      .insert(vulnerabilities)

    if (error) {
      console.error("Failed to save vulnerabilities:", error)
      throw error
    }
  }
}

export async function completeScan(
  scanId: string,
  data: {
    total_files_scanned?: number
    scan_duration_seconds?: number
  }
) {
  // Get ALL vulnerabilities for this scan
  const { data: vulnerabilities, error: vulnError } = await supabaseAdmin
    .from("vulnerabilities")
    .select("severity")
    .eq("scan_id", scanId)

  if (vulnError) {
    console.error("Error fetching vulnerabilities for count:", vulnError)
  }

  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  }

  // Count vulnerabilities by severity
  if (vulnerabilities && vulnerabilities.length > 0) {
    for (const vuln of vulnerabilities) {
      const severity = (vuln.severity || "").toLowerCase()
      if (severity.includes("crit")) counts.critical++
      else if (severity.includes("high")) counts.high++
      else if (severity.includes("med")) counts.medium++
      else counts.low++
    }
  }

  console.log("📊 Vulnerability counts:", counts)
  console.log("📁 Total vulnerabilities:", vulnerabilities?.length || 0)

  // Update scan with final counts
  const { error: updateError } = await supabaseAdmin
    .from("scans")
    .update({
      status: "completed",
      scan_progress: 100,
      total_files_scanned: data.total_files_scanned || 0,
      vulnerabilities_found: vulnerabilities?.length || 0,
      critical_count: counts.critical,
      high_count: counts.high,
      medium_count: counts.medium,
      low_count: counts.low,
      scan_duration_seconds: data.scan_duration_seconds || 0,
      completed_at: new Date().toISOString(),
    })
    .eq("id", scanId)

  if (updateError) {
    console.error("Error updating scan completion:", updateError)
    throw updateError
  }

  console.log("✅ Scan completed with counts:", counts)
}

export async function failScan(scanId: string, errorMessage: string) {
  await supabaseAdmin
    .from("scans")
    .update({
      status: "failed",
      error_message: errorMessage,
    })
    .eq("id", scanId)
}