// lib/repo-scanner.ts - WITH GITLAB & BITBUCKET SUPPORT
import simpleGit from 'simple-git'
import { promises as fs } from 'fs'
import path from 'path'

const TEMP_DIR = path.join(process.cwd(), '.temp-repos')

async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true })
  } catch (error) {
    console.error('Failed to create temp directory:', error)
  }
}

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

// ✅ UPDATED: Validate GitHub, GitLab, and Bitbucket URLs
export function isValidRepoUrl(url: string): boolean {
  const patterns = [
    // GitHub
    /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/,
    /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\.git$/,
    /^git@github\.com:[\w-]+\/[\w.-]+\.git$/,
    
    // GitLab
    /^https?:\/\/gitlab\.com\/[\w-]+\/[\w.-]+\/?$/,
    /^https?:\/\/gitlab\.com\/[\w-]+\/[\w.-]+\.git$/,
    /^git@gitlab\.com:[\w-]+\/[\w.-]+\.git$/,
    
    // GitLab with subgroups (e.g., gitlab.com/group/subgroup/project)
    /^https?:\/\/gitlab\.com\/[\w-]+\/[\w-]+\/[\w.-]+\/?$/,
    /^https?:\/\/gitlab\.com\/[\w-]+\/[\w-]+\/[\w.-]+\.git$/,
    
    // Bitbucket
    /^https?:\/\/bitbucket\.org\/[\w-]+\/[\w.-]+\/?$/,
    /^https?:\/\/bitbucket\.org\/[\w-]+\/[\w.-]+\.git$/,
    /^git@bitbucket\.org:[\w-]+\/[\w.-]+\.git$/,
  ]
  return patterns.some(pattern => pattern.test(url))
}

// ✅ BACKWARD COMPATIBILITY: Keep old function name
export function isValidGitHubUrl(url: string): boolean {
  return isValidRepoUrl(url)
}

// ✅ NEW: Detect repository platform
export function getRepoPlatform(url: string): 'github' | 'gitlab' | 'bitbucket' | 'unknown' {
  if (url.includes('github.com')) return 'github'
  if (url.includes('gitlab.com')) return 'gitlab'
  if (url.includes('bitbucket.org')) return 'bitbucket'
  return 'unknown'
}

function getRepoName(url: string): string {
  const match = url.match(/\/([^\/]+?)(\.git)?$/)
  return match ? match[1] : 'repo'
}

// ✅ UPDATED: Clone from GitHub, GitLab, or Bitbucket
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
  platform: string
}> {
  await ensureTempDir()
  await cleanupOldRepos()

  // Validate URL
  if (!isValidRepoUrl(repoUrl)) {
    throw new Error('Invalid repository URL. Supported platforms: GitHub, GitLab, Bitbucket')
  }

  const platform = getRepoPlatform(repoUrl)
  const repoName = getRepoName(repoUrl)
  const timestamp = Date.now()
  const repoPath = path.join(TEMP_DIR, `${repoName}-${timestamp}`)

  console.log(`📦 Cloning ${platform} repository:`, repoUrl)
  console.log('📁 Clone path:', repoPath)

  try {
    const git = simpleGit()
    
    // Clone the repository (shallow clone for speed)
    // Works for GitHub, GitLab, and Bitbucket
    await git.clone(repoUrl, repoPath, ['--depth', '1'])
    
    console.log(`✅ ${platform} repository cloned successfully`)

    const files = await readRepoFiles(repoPath, options.language)
    
    console.log(`📄 Found ${files.length} files to scan`)

    return {
      files,
      totalFiles: files.length,
      repoPath,
      platform: platform.charAt(0).toUpperCase() + platform.slice(1) // Capitalize
    }
  } catch (error: any) {
    console.error(`❌ Clone error for ${platform}:`, error)
    
    // Clean up on error
    try {
      await fs.rm(repoPath, { recursive: true, force: true })
    } catch {}

    // Provide helpful error messages
    if (error.message.includes('authentication') || error.message.includes('Permission denied')) {
      throw new Error(`Authentication failed. Please ensure the repository is public or provide valid credentials.`)
    }
    
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      throw new Error(`Repository not found. Please check the URL and ensure the repository exists.`)
    }

    throw new Error(`Failed to clone ${platform} repository: ${error.message}`)
  }
}

export async function cleanupRepo(repoPath: string) {
  try {
    await fs.rm(repoPath, { recursive: true, force: true })
    console.log('🗑️ Cleaned up repository:', repoPath)
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

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

  let allowedExtensions: string[] = []
  
  if (language === 'all' || !language) {
    allowedExtensions = Object.values(LANGUAGE_EXTENSIONS).flat()
  } else {
    const selectedLanguages = language.split(',').map(l => l.trim().toLowerCase())
    
    for (const lang of selectedLanguages) {
      const extensions = LANGUAGE_EXTENSIONS[lang]
      if (extensions) {
        allowedExtensions.push(...extensions)
      }
    }
    
    if (allowedExtensions.length === 0) {
      console.warn(`⚠️ Unknown language(s): ${language}, scanning all files`)
      allowedExtensions = Object.values(LANGUAGE_EXTENSIONS).flat()
    }
  }

  console.log(`🎯 Scanning for extensions: ${allowedExtensions.join(', ')}`)

  const files: { path: string; content: string }[] = []

  async function walk(dir: string, baseDir: string = repoPath) {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      const relativePath = path.relative(baseDir, fullPath)

      if (entry.isDirectory()) {
        if (SKIP_DIRS.includes(entry.name)) continue
        await walk(fullPath, baseDir)
        continue
      }

      const lowerPath = relativePath.toLowerCase()
      if (SKIP_FILES.some(skip => lowerPath.endsWith(skip))) continue
      if (!allowedExtensions.some(ext => lowerPath.endsWith(ext))) continue

      try {
        const content = await fs.readFile(fullPath, 'utf-8')
        
        if (content.trim().length < 20) continue
        if (content.length > 500000) continue

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
  
  console.log(`📊 Found ${files.length} files matching selected languages`)
  
  return files.slice(0, 30)
}