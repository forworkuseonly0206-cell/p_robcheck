// lib/scanner.ts (COMPLETE FILE - replace the old one)
// Forwards legacy imports (such as CI/CD routes) to the 4-Gate Bug Bounty Engine.
import { analyzeFiles as preciseAnalyzeFiles, type ScanOptions } from '@/lib/precise-scanner'

export type FileItem = { path: string; content: string }

export async function analyzeFiles(files: FileItem[], opts: ScanOptions = {}) {
  return preciseAnalyzeFiles(files, opts)
}