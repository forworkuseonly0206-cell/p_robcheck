// lib/openai.ts (COMPLETE FILE - Zero-Sleep Multi-Model & Multi-Key Rotator)

const SYSTEM_PROMPT =
  "You are Principal Bug Bounty Triager AI for ProbCheck (probcheck.in). " +
  "You audit source code with 100% deterministic accuracy and zero false positives. " +
  "Return ONLY a valid JSON array with no markdown formatting."

// 5 independent Groq rate-limit buckets. If one model hits 429, we switch in 0ms.
const FREE_GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "llama-3.1-8b-instant",
]

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Collects all configured Groq keys.
 * You can put comma-separated keys inside GROQ_API_KEY or add GROQ_API_KEY_2 / GROQ_API_KEY_3 in Vercel.
 */
function getGroqApiKeys(): string[] {
  const raw = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
  ]
    .filter(Boolean)
    .join(",")

  return raw
    .split(",")
    .map(k => k.trim())
    .filter(Boolean)
}

let roundRobinCounter = 0

/**
 * FREE TIER: Instant rotation across Keys x Models with zero 6-second blocking sleeps
 */
export async function callGeminiJSON(prompt: string): Promise<string> {
  const keys = getGroqApiKeys()
  if (keys.length === 0) {
    throw new Error("Groq API not configured")
  }

  const startKeyIndex = roundRobinCounter++ % keys.length
  let lastStatus = 500
  let lastErrorText = ""

  for (let k = 0; k < keys.length; k++) {
    const apiKey = keys[(startKeyIndex + k) % keys.length]

    for (const groqModel of FREE_GROQ_MODELS) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: prompt },
            ],
            temperature: 0,
            max_tokens: 4000,
          }),
          signal: AbortSignal.timeout(14_000),
        })

        if (response.ok) {
          const data = await response.json()
          return data.choices?.[0]?.message?.content || "[]"
        }

        lastStatus = response.status
        lastErrorText = await response.text().catch(() => "")

        // On 429 Rate Limit or 5xx, switch IMMEDIATELY (0ms) to the next model bucket
        if (lastStatus === 429 || lastStatus >= 500) {
          console.warn(`⚡ Groq ${lastStatus} on ${groqModel} — switching immediately to next model...`)
          continue
        }

        // On 400/404 model error, try the next model in the pool
        if (lastStatus === 404 || lastStatus === 400) {
          continue
        }
      } catch (err: any) {
        console.warn(`⚡ Groq timeout/network error on ${groqModel} — switching to next model...`)
        continue
      }
    }
  }

  // Final quick retry on llama-3.1-8b-instant after a brief 800ms pause
  await sleep(800)
  try {
    const fallbackRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keys[0]}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0,
        max_tokens: 4000,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (fallbackRes.ok) {
      const data = await fallbackRes.json()
      return data.choices?.[0]?.message?.content || "[]"
    }
  } catch {
    // Fall through to error
  }

  console.error("Groq API exhausted all models:", lastStatus, lastErrorText.slice(0, 200))
  throw new Error(`Groq API failed: ${lastStatus}`)
}

/**
 * PRO TIER: Claude Sonnet 4 (with automatic fallback to Groq pool if Claude is unavailable)
 */
export async function callClaudeJSON(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return callGeminiJSON(prompt)
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY.trim(),
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        temperature: 0,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(25_000),
    })

    if (response.ok) {
      const data = await response.json()
      return data.content?.[0]?.text || "[]"
    }

    console.warn(`⚠️ Claude returned ${response.status}, falling back to Groq model pool...`)
    return callGeminiJSON(prompt)
  } catch (err) {
    console.warn("⚠️ Claude request timed out, falling back to Groq model pool...")
    return callGeminiJSON(prompt)
  }
}

/**
 * Track AI costs for analytics
 */
export async function trackAICost(data: {
  userId: string
  scanId: string
  model: string
  inputTokens: number
  outputTokens: number
  estimatedCost: number
}) {
  try {
    console.log("💰 AI Cost:", {
      model: data.model,
      cost: `$${data.estimatedCost.toFixed(4)}`,
      tokens: data.inputTokens + data.outputTokens,
    })
  } catch (error) {
    console.error("Failed to track AI cost:", error)
  }
}