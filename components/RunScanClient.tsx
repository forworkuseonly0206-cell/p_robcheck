// components/RunScanClient.tsx
"use client"

import React, { useState, useRef } from "react"

export function RunScanClient() {
  const [file, setFile] = useState<File | null>(null)
  const [projectName, setProjectName] = useState("my-project")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  async function onRun() {
    setError(null)
    if (!file) {
      setError("Please upload a zip file first")
      return
    }
    setLoading(true)
    setReport(null)
    try {
      const form = new FormData()
      form.append("file", file)
      form.append("projectName", projectName)

      const res = await fetch("/api/scan", { method: "POST", body: form })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        throw new Error(j?.error || res.statusText || "Scan failed")
      }
      const data = await res.json()
      setReport(data)
    } catch (err: any) {
      setError(String(err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null)
  }

  return (
    <div>
      <label className="block mb-1 font-mono text-sm">Project Name</label>
      <input
        className="w-full p-3 rounded bg-[#0b0b0b] border border-white/5 mb-3"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
      />

      <label className="block mb-1 font-mono text-sm">Upload .zip</label>
      <div className="mb-3">
        <input
          ref={fileRef}
          type="file"
          accept=".zip"
          onChange={onFileChange}
          className="mb-2"
          disabled={loading}
        />
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onRun}
          disabled={loading}
          className="px-6 py-2 rounded bg-emerald-500 text-black font-medium"
        >
          {loading ? "Scanning..." : "Run Scan"}
        </button>
        <button
          onClick={() => {
            setFile(null)
            setReport(null)
            setError(null)
            if (fileRef.current) fileRef.current.value = ""
          }}
          className="px-3 py-2 rounded border border-white/5 text-sm"
        >
          Reset
        </button>
      </div>

      {error && <div className="text-red-400 mb-3">{error}</div>}

      {report ? (
        <div className="mt-4 p-4 rounded bg-[#0b0b0b] border border-white/5">
          <h3 className="font-mono mb-2">Scan Summary</h3>
          <pre className="text-xs">{JSON.stringify(report.summary, null, 2)}</pre>

          <h4 className="font-mono mt-4 mb-2">Findings</h4>
          <div>
            {report.results?.map((r: any) => (
              <div key={r.path} className="mb-3 p-2 border border-white/5 rounded">
                <div className="font-bold">{r.path}</div>
                {r.findings?.length ? (
                  r.findings.map((f: any, idx: number) => (
                    <div key={idx} className="mt-2 text-sm">
                      <div className="font-semibold">{f.severity.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground">{f.description}</div>
                      {f.suggestedFix && (
                        <pre className="text-xs mt-1 bg-black/70 p-2 rounded">{f.suggestedFix}</pre>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No findings</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">No report yet</div>
      )}
    </div>
  )
}
