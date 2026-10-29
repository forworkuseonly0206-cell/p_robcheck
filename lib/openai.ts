// lib/openai.ts (COMPLETE FILE - with automatic 429 Rate-Limit Retry)

const SYSTEM_PROMPT =
  "You are Principal Bug Bounty Triager AI for ProbCheck (probcheck.in). " +
  "You audit source code with 100% deterministic accuracy and zero false positives. " +
  "Return ONLY a valid JSON array with no markdown formatting."

const FREE_GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
]

/**
 * Helper to pause execution for a given number of milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * FREE TIER ONLY: Groq API with automatic 429 rate-limit backoff & retry
 */
export async function callGeminiJSON(prompt: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Groq API not configured")
  }

  let lastStatus = 500
  let lastErrorText = ""

  for (const groqModel of FREE_GROQ_MODELS) {
    // Try up to 3 times per model if we hit a rate limit (429)
    for (let attempt = 1; attempt <= 3; attempt++) {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt }
          ],
          temperature: 0,
          max_tokens: 4000,
        }),
        signal: AbortSignal.timeout(60_000),
      })

      if (response.ok) {
        const data = await response.json()
        return data.choices?.[0]?.message?.content || "[]"
      }

      lastStatus = response.status
      lastErrorText = await response.text()

      // If we hit a 429 Rate Limit, wait 6 seconds and auto-retry
      if (lastStatus === 429) {
        console.warn(`⚠️ Groq rate limit (429) hit on model ${groqModel}. Auto-retrying (attempt ${attempt}/3) in 6s...`)
        await sleep(6000)
        continue
      }

      // If model not found (404/400), break out of retry loop to try the next Groq model
      if (lastStatus === 404 || lastStatus === 400) {
        break
      }

      break
    }
  }

  console.error("Groq API error after retries:", lastStatus, lastErrorText)
  throw new Error(`Groq API failed: ${lastStatus} (Rate limit or model error)`)
}

/**
 * PRO TIER ONLY: Claude Sonnet 4
 */
export async function callClaudeJSON(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not configured")
    throw new Error("Claude API not configured")
  }

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
      messages: [{ role: "user", content: prompt }]
    }),
    signal: AbortSignal.timeout(90_000),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Claude API error:", error)
    throw new Error(`Claude API failed: ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || "[]"
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
      tokens: data.inputTokens + data.outputTokens
    })
  } catch (error) {
    console.error("Failed to track AI cost:", error)
  }
}