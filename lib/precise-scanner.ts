// lib/precise-scanner.ts (COMPLETE FILE)
// Connects your scan routes to the 4-Gate Deterministic Bug Bounty Engine,
// while preserving multi-language file filtering and AI cost tracking.
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
  javascript: ['.js', '.jsx', '.mjs', '.cjs'],
  typescript: ['.ts', '.tsx'],
  python: ['.py', '.pyw', '.pyx'],
  go: ['.go'],
  java: ['.java', '.jsp'],
  ruby: ['.rb', '.rake', '.gemspec'],
  php: ['.php', '.phtml', '.php3', '.php4', '.php5'],
  'c#': ['.cs', '.cshtml', '.razor'],
  csharp: ['.cs', '.cshtml', '.razor'],
  rust: ['.rs'],
  cpp: ['.cpp', '.cc', '.cxx', '.c', '.h', '.hpp'],
  c: ['.c', '.h'],
}

function filterByLanguage(files: FileInput[], language?: string): {
  matched: FileInput[]
  skippedWarning?: string
  error?: string
} {
  if (!language || language.trim().toLowerCase() === 'all') {
    return { matched: files }
  }

  const selected = language.split(',').map(l => l.trim().toLowerCase()).filter(Boolean)
  const allowedExts = selected.flatMap(l => LANGUAGE_EXTENSIONS[l] || [])

  if (allowedExts.length === 0) {
    return { matched: files }
  }

  const matched: FileInput[] = []
  const unmatched: FileInput[] = []

  for (const file of files) {
    const lower = file.path.toLowerCase()
    if (allowedExts.some(ext => lower.endsWith(ext))) {
      matched.push(file)
    } else {
      unmatched.push(file)
    }
  }

  if (matched.length === 0) {
    return {
      matched: [],
      error: `No ${selected.join(', ')} files were found in the project.`,
    }
  }

  const skippedWarning =
    unmatched.length > 0
      ? `${unmatched.length} file(s) skipped because they did not match the selected language (${selected.join(', ')}).`
      : undefined

  return { matched, skippedWarning }
}

export async function analyzeFiles(files: FileInput[], options: ScanOptions = {}) {
  const { matched, skippedWarning, error } = filterByLanguage(files, options.language)
  if (error) {
    return {
      project: options.projectName || 'project',
      summary: { critical: 0, high: 0, medium: 0, low: 0 },
      totalEstimatedBountyUsd: 0,
      results: [],
      warnings: [],
      error,
    }
  }

  const report = await scanFiles(matched, { callModel: callGeminiJSON })
  if (skippedWarning) {
    report.warnings = [...(report.warnings || []), skippedWarning]
  }
  return {
    project: options.projectName || 'project',
    ...report,
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
      warnings: [],
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
  if (skippedWarning) {
    report.warnings = [...(report.warnings || []), skippedWarning]
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
  }
}