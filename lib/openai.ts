// lib/openai.ts - Dual AI System

/**
 * FREE TIER: Groq (Llama 3.3)
 * Fast, free, good for basic scanning
 */
export async function callGeminiJSON(prompt: string): Promise<string> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a security expert. Return only valid JSON array." },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      max_tokens: 4000,
    }),
  })
  
  const data = await response.json()
  return data.choices[0]?.message?.content || "[]"
}

/**
 * PRO TIER: Claude Sonnet 4
 * Premium AI for deep security analysis
 */
export async function callClaudeJSON(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("❌ ANTHROPIC_API_KEY not configured")
    throw new Error("Claude API not configured")
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", // Latest Claude Sonnet 4
      max_tokens: 4096,
      temperature: 0,
      system: "You are an elite security researcher and code analyst. You find real vulnerabilities with high accuracy. Always return valid JSON array format.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error("Claude API error:", error)
    throw new Error(`Claude API failed: ${response.status}`)
  }

  const data = await response.json()
  const content = data.content?.[0]?.text || "[]"
  
  console.log("🤖 Claude response received")
  
  return content
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
    // Log for now - you can save to Supabase later
    console.log("💰 AI Cost:", {
      model: data.model,
      cost: `$${data.estimatedCost.toFixed(4)}`,
      tokens: data.inputTokens + data.outputTokens
    })

    // TODO: Save to Supabase for analytics
    // await supabaseAdmin.from('ai_costs').insert(data)
  } catch (error) {
    console.error("Failed to track AI cost:", error)
  }
}