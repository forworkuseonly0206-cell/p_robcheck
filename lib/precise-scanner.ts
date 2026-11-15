// lib/precise-scanner.ts (COMPLETE FILE - replace the entire file with this)
import { callGeminiJSON, callClaudeJSON, trackAICost } from '@/lib/openai'
import { scanFiles, type FileInput } from '@/lib/analysis-engine'

export type ScanOptions = {
  projectName?: string
  language?: string
  userId?: string
  scanId?: string
}

const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
  'javascript / typescript': ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
  javascript: ['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx'],
  typescript: ['.ts', '.tsx', '.js', '.jsx'],
  python: ['.py', '.pyw', '.pyx'],
  go: ['.go'],
  java: ['.java', '.jsp'],
  ruby: ['.rb', '.rake', '.gemspec'],
  php: ['.php', '.phtml', '.php3', '.php4', '.php5'],
  'c#': ['.cs', '.cshtml', '.razor'],
  csharp: ['.cs', '.cshtml', '.razor'],
  rust: ['.rs'],
  cpp: ['.cpp', '.cc', '.cxx', '.c', '.h', '.hpp'],
  c: ['.c', '.h', '.cpp', '.hpp'],
}

const ALL_SUPPORTED_EXTENSIONS = Array.from(
  new Set(Object.values(LANGUAGE_EXTENSIONS).flat())
)

function filterByLanguage(files: FileInput[], language?: string): {
  matched: FileInput[]
  skippedWarning?: string
  error?: string
} {
  // Always keep all supported code files so multi-language repositories (TS, Python, Go, Java, PHP, C++)
  // never silently drop files when a user leaves the dropdown on the default language.
  const allSupported = files.filter(f => {
    const lower = f.path.toLowerCase()
    return ALL_SUPPORTED_EXTENSIONS.some(ext => lower.endsWith(ext))
  })

  if (allSupported.length === 0) {
    return {
      matched: [],
      error: `No supported source code files were found in the project (${language || 'all'}).`,
    }
  }

  return { matched: allSupported }
}

export async function analyzeFiles(files: FileInput[], options: ScanOptions = {}) {
  const { matched, skippedWarning, error } = filterByLanguage(files, options.language)
  if (error) {
    return {
      project: options.projectName || 'project',
      summary: { critical: 0, high: 0, medium: 0, low: 0 },
      totalEstimatedBountyUsd: 0,
      results: [],
      warnings: [] as string[],
      error,
    }
  }

  const report = await scanFiles(matched, { callModel: callGeminiJSON })
  const mergedWarnings: string[] = [...(report.warnings || [])]
  if (skippedWarning) {
    mergedWarnings.push(skippedWarning)
  }

  return {
    project: options.projectName || 'project',
    ...report,
    warnings: mergedWarnings,
  }
}

export async function advancedAnalyzeFiles(files: FileInput[], options: ScanOptions = {}) {
  const { matched, skippedWarning, error } = filterByLanguage(files, options.language)
  if (error) {
    return {
      project: options.projectName || 'project',
      summary: { critical: 0, high: 0, medium: 0, low: 0 },
      totalEstimatedBountyUsd: 0,
      results: [],
      warnings: [] as string[],
      error,
    }
  }

  let totalInputChars = 0
  let totalOutputChars = 0

  const trackedClaudeCall = async (prompt: string) => {
    totalInputChars += prompt.length
    const out = await callClaudeJSON(prompt)
    totalOutputChars += out.length
    return out
  }

  const report = await scanFiles(matched, { callModel: trackedClaudeCall })
  const mergedWarnings: string[] = [...(report.warnings || [])]
  if (skippedWarning) {
    mergedWarnings.push(skippedWarning)
  }

  if (options.userId && options.scanId) {
    const inputTokens = Math.ceil(totalInputChars / 4)
    const outputTokens = Math.ceil(totalOutputChars / 4)
    const estimatedCost = inputTokens * 0.000003 + outputTokens * 0.000015
    await trackAICost({
      userId: options.userId,
      scanId: options.scanId,
      model: 'claude-sonnet-4',
      inputTokens,
      outputTokens,
      estimatedCost,
    })
  }

  return {
    project: options.projectName || 'project',
    ...report,
    warnings: mergedWarnings,
  }
}