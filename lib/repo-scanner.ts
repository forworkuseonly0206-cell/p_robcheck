// lib/repo-scanner.ts
import simpleGit from 'simple-git'
import { promises as fs } from 'fs'
import path from 'path'
import { analyzeFiles } from './scanner'

const TEMP_DIR = path.join(process.cwd(), '.temp-repos')

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create temp directory:', error)
  }
}

// Clean up old repositories
async function cleanupOldRepos() {
  try {
    const files = await fs.readdir(TEMP_DIR)
    const now = Date.now()
    const ONE_HOUR = 60 * 60 * 1000

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file)
      const stats = await fs.stat(filePath)
      const age = now - stats.mtimeMs

      if (age > ONE_HOUR) {
        await fs.rm(filePath, { recursive: true, force: true })
        console.log(`🗑️ Cleaned up old repo: ${file}`)
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

// Validate GitHub URL
export function isValidGitHubUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/,
    /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\.git$/,
    /^git@github\.com:[\w-]+\/[\w.-]+\.git$/,
  ]
  return patterns.some(pattern => pattern.test(url))
}

// Extract repo name from URL
function getRepoName(url: string): string {
  const match = url.match(/\/([^\/]+?)(\.git)?$/)
  return match ? match[1] : 'repo'
}

// Clone and scan repository
export async function cloneAndScanRepo(
  repoUrl: string,
  options: {
    projectName: string
    language: string
  }
): Promise<{
  files: { path: string; content: string }[]
  totalFiles: number
  repoPath: string
}> {
  await ensureTempDir()
  await cleanupOldRepos()

  const repoName = getRepoName(repoUrl)
  const timestamp = Date.now()
  const repoPath = path.join(TEMP_DIR, `${repoName}-${timestamp}`)

  console.log('📦 Cloning repository:', repoUrl)
  console.log('📁 Clone path:', repoPath)

  try {
    const git = simpleGit()
    
    // Clone the repository (shallow clone for speed)
    await git.clone(repoUrl, repoPath, ['--depth', '1'])
    
    console.log('✅ Repository cloned successfully')

    // Read files from the cloned repo
    const files = await readRepoFiles(repoPath, options.language)
    
    console.log(`📄 Found ${files.length} files to scan`)

    return {
      files,
      totalFiles: files.length,
      repoPath,
    }
  } catch (error: any) {
    console.error('❌ Clone error:', error)
    
    // Clean up on error
    try {
      await fs.rm(repoPath, { recursive: true, force: true })
    } catch {}

    throw new Error(`Failed to clone repository: ${error.message}`)
  }
}

// Clean up repository after scanning
export async function cleanupRepo(repoPath: string) {
  try {
    await fs.rm(repoPath, { recursive: true, force: true })
    console.log('🗑️ Cleaned up repository:', repoPath)
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

// Read files from cloned repository
async function readRepoFiles(
  repoPath: string,
  language: string
): Promise<{ path: string; content: string }[]> {
  const SKIP_DIRS = [
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'out',
    'coverage',
    'vendor',
    '__pycache__',
    '.venv',
    'venv',
    '.idea',
    '.vscode',
  ]

  const SKIP_FILES = [
    '.min.js',
    '.min.css',
    '.map',
    '.lock',
    'package-lock.json',
    'yarn.lock',
  ]

  const LANGUAGE_EXTENSIONS: Record<string, string[]> = {
    javascript: ['.js', '.jsx', '.mjs', '.cjs'],
    typescript: ['.ts', '.tsx'],
    python: ['.py'],
    go: ['.go'],
    java: ['.java'],
    ruby: ['.rb'],
    php: ['.php'],
    csharp: ['.cs'],
    rust: ['.rs'],
    cpp: ['.cpp', '.cc', '.cxx', '.c', '.h', '.hpp'],
  }

  const allowedExtensions =
    language === 'all'
      ? Object.values(LANGUAGE_EXTENSIONS).flat()
      : LANGUAGE_EXTENSIONS[language] || Object.values(LANGUAGE_EXTENSIONS).flat()

  const files: { path: string; content: string }[] = []

  async function walk(dir: string, baseDir: string = repoPath) {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.relative(baseDir, fullPath)

      // Skip directories
      if (entry.isDirectory()) {
        if (SKIP_DIRS.includes(entry.name)) continue
        await walk(fullPath, baseDir)
        continue
      }

      // Skip files
      const lowerPath = relativePath.toLowerCase()
      if (SKIP_FILES.some(skip => lowerPath.endsWith(skip))) continue
      if (!allowedExtensions.some(ext => lowerPath.endsWith(ext))) continue

      try {
        const content = await fs.readFile(fullPath, 'utf-8')
        
        // Skip very small or very large files
        if (content.trim().length < 20) continue
        if (content.length > 500000) continue // Skip files > 500KB

        files.push({
          path: relativePath,
          content,
        })
      } catch (error) {
        console.error(`Failed to read ${relativePath}:`, error)
      }
    }
  }

  await walk(repoPath)
  return files.slice(0, 30) // Limit to 30 files like zip scanner
}