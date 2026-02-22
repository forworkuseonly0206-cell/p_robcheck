"use client"

import { useState } from "react"

export default function ApiTestPage() {
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setResponse(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("projectName", "debug-test")

    try {
      console.log("📤 Uploading to /api/scan...")
      
      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      })

      console.log("📥 Response status:", res.status)
      
      const data = await res.json()
      
      console.log("📊 Full API Response:", JSON.stringify(data, null, 2))
      
      setResponse(data)
      
    } catch (err: any) {
      console.error("❌ Error:", err)
      setResponse({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 API Response Debugger</h1>

        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <label className="block text-sm font-medium mb-2">
            Upload ZIP file to test API response:
          </label>
          <input
            type="file"
            accept=".zip"
            onChange={handleUpload}
            disabled={loading}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
          />
        </div>

        {loading && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-blue-500">Scanning...</p>
          </div>
        )}

        {response && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-emerald-500">✅ API Response Received</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-400 text-sm">Project:</span>
                  <p className="font-mono">{response.project || "N/A"}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Scan ID:</span>
                  <p className="font-mono">{response.scanId || "N/A"}</p>
                </div>
              </div>

              {response.summary && (
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {response.summary.critical ?? 0}
                    </div>
                    <div className="text-xs text-gray-400">Critical</div>
                  </div>
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-orange-500">
                      {response.summary.high ?? 0}
                    </div>
                    <div className="text-xs text-gray-400">High</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-500">
                      {response.summary.medium ?? 0}
                    </div>
                    <div className="text-xs text-gray-400">Medium</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3 text-center">
                    <div className="text-2xl font-bold text-blue-500">
                      {response.summary.low ?? 0}
                    </div>
                    <div className="text-xs text-gray-400">Low</div>
                  </div>
                </div>
              )}

              <div className="bg-black/30 rounded p-3">
                <span className="text-gray-400 text-sm">Files with issues:</span>
                <p className="font-mono text-lg">
                  {response.results?.length ?? 0}
                </p>
              </div>
            </div>

            {/* Results Details */}
            {response.results && response.results.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-bold mb-4">📁 Files with Issues:</h3>
                {response.results.map((result: any, idx: number) => (
                  <div key={idx} className="bg-black/30 rounded p-4 mb-3">
                    <div className="font-mono text-emerald-500 mb-2">
                      {result.path}
                    </div>
                    <div className="text-sm text-gray-400">
                      {result.findings?.length ?? 0} finding(s)
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Raw JSON */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">📄 Raw JSON Response:</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(response, null, 2))
                    alert("Copied to clipboard!")
                  }}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  Copy
                </button>
              </div>
              <pre className="bg-black rounded p-4 overflow-auto max-h-96 text-xs">
                <code className="text-green-400">
                  {JSON.stringify(response, null, 2)}
                </code>
              </pre>
            </div>
          </div>
        )}
        
      </div>
    </div>
  )
}