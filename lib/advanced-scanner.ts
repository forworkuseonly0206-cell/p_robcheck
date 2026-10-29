// lib/advanced-scanner.ts (COMPLETE FILE - replace the old one)
// Forwards legacy Pro-tier imports to the 4-Gate Claude Bug Bounty Engine.
import { advancedAnalyzeFiles as preciseAdvancedAnalyzeFiles, type ScanOptions } from '@/lib/precise-scanner'
import type { FileItem } from '@/lib/scanner'

export async function advancedAnalyzeFiles(files: FileItem[], opts: ScanOptions) {
  return preciseAdvancedAnalyzeFiles(files, opts)
}