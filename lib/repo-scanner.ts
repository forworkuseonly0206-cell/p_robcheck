// lib/repo-scanner.ts  (COMPLETE FILE - replace the old one)
import simpleGit from 'simple-git'
import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'

// CHANGED: the OS temp folder, not inside the project folder
const TEMP_DIR = path.join(os.tmpdir(), 'probcheck-repos')

const CLONE_TIMEOUT_MS = 50_000
const MAX_FILE_BYTES = 500_000
const MAX_FILES_VISITED = 20_000
const MAX_DEPTH = 20
const MAX_FILES_TO_SCAN = 30

const ALLOWED_HOSTS = ['github.com', 'gitlab.com', 'bitbucket.org']

async function ensureTempDir() {
  await fs.mkdir(TEMP_DIR, { recursive: true })
}

async function cleanupOldRepos() {
  try {
    const entries = await fs.readdir(TEMP_DIR)
    const now = Date.now()
    for (const name of entries) {
      const p = path.join(TEMP_DIR, name)
      const stats = await fs.stat(p)
      if (now - stats.mtimeMs > 60 * 60 * 1000) {
        await fs.rm(p, { recursive: true, force: true })
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

// CHANGED: only https links on the three allowed sites, parsed properly (no look-alike hosts,
// no usernames/ports/query strings, no "..", no ssh links).
export function isValidRepoUrl(url: string): boolean {
  if (typeof url !== 'string' || url.length > 200) return false

  let u: URL
  try {
    u = new URL(url.trim())
  } catch {
    return false
  }

  if (u.protocol !== 'https:') return false
  if (!ALLOWED_HOSTS.includes(u.hostname)) return false
  if (u.username || u.password || u.port || u.search || u.hash) return false

  const parts = u.pathname.replace(/\/+$/, '').split('/').filter(Boolean)
  const maxParts = u.hostname === 'gitlab.com' ? 4 : 2 // GitLab allows subgroups
  if (parts.length < 2 || parts.length > maxParts) return false

  return parts.every(p => /^[\w.-]+$/.test(p) && p !== '.' && p !== '..')
}

// Kept so old imports keep working
export function isValidGitHubUrl(url: string): boolean {
  return isValidRepoUrl(url)
}

export function getRepoPlatform(url: string): 'github' | 'gitlab' | 'bitbucket' | 'unknown' {
  try {
    const host = new URL(url).hostname
    if (host === 'github.com') return 'github'
    if (host === 'gitlab.com') return 'gitlab'
    if (host === 'bitbucket.org') return 'bitbucket'
  } catch {}
  return 'unknown'
}

export async function cloneAndScanRepo(
  repoUrl: string,
  options: { projectName: string; language: string }
): Promise<{
  files: { path: string; content: string }[]
  totalFiles: number
  repoPath: string
  platform: string
}> {
  if (!isValidRepoUrl(repoUrl)) {
    throw new Error('Invalid repository URL. Supported: GitHub, GitLab, Bitbucket (https links).')
  }

  await ensureTempDir()
  await cleanupOldRepos()

  // Normalised URL built from the parsed pieces
  const u = new URL(repoUrl.trim())
  const cleanUrl = `${u.origin}${u.pathname.replace(/\/+$/, '')}`

  const platform = getRepoPlatform(cleanUrl)
  const repoPath = path.join(TEMP_DIR, crypto.randomUUID()) // random name, never from user input

  // Stop a slow or huge clone after 50 seconds
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), CLONE_TIMEOUT_MS)

  try {
    const git = simpleGit({
      abort: controller.signal,
      // Do not create symbolic links from the repo (a malicious repo could point one at
      // a file on YOUR server, such as your secret keys)
      config: ['core.symlinks=false'],
    }).env({ ...process.env, GIT_TERMINAL_PROMPT: '0' }) // never wait for a password

    await git.clone(cleanUrl, repoPath, ['--depth', '1', '--single-branch', '--no-tags'])

    const files = await readRepoFiles(repoPath, options.language)

    return {
      files,
      totalFiles: files.length,
      repoPath,
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    }
  } catch (error: any) {
    console.error(`❌ Clone error for ${platform}:`, error)
    await fs.rm(repoPath, { recursive: true, force: true }).catch(() => {})

    if (controller.signal.aborted) {
      throw new Error('The repository took too long to download. Try a smaller repository.')
    }
    // Safe messages only; the real error stays in the server log
    throw new Error('Could not download this repository. Make sure it exists and is public.')
  } finally {
    clearTimeout(timer)
  }
}

export async function cleanupRepo(repoPath: string) {
  try {
    // Only ever delete inside our own temp folder
    if (!path.resolve(repoPath).startsWith(path.resolve(TEMP_DIR) + path.sep)) return
    await fs.rm(repoPath, { recursive: true, force: true })
  } catch (error) {
    console.error('Cleanup error:', error)
  }
}

async function readRepoFiles(
  repoPath: string,
  language: string
): Promise<{ path: string; content: string }[]> {
  const SKIP_DIRS = [
    'node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage',
    'vendor', '__pycache__', '.venv', 'venv', '.idea', '.vscode',
  ]
  const SKIP_FILES = ['.min.js', '.min.css', '.map', '.lock', 'package-lock.json', 'yarn.lock']

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
    for (const lang of language.split(',').map(l => l.trim().toLowerCase())) {
      if (LANGUAGE_EXTENSIONS[lang]) allowedExtensions.push(...LANGUAGE_EXTENSIONS[lang])
    }
    if (allowedExtensions.length === 0) {
      allowedExtensions = Object.values(LANGUAGE_EXTENSIONS).flat()
    }
  }

  const realRoot = await fs.realpath(repoPath)
  const files: { path: string; content: string }[] = []
  let visited = 0

  async function walk(dir: string, depth: number) {
    if (depth > MAX_DEPTH || files.length >= MAX_FILES_TO_SCAN) return
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (files.length >= MAX_FILES_TO_SCAN) return
      if (++visited > MAX_FILES_VISITED) return

      // Never follow symbolic links
      if (entry.isSymbolicLink()) continue

      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        if (SKIP_DIRS.includes(entry.name)) continue
        await walk(fullPath, depth + 1)
        continue
      }

      const relativePath = path.relative(repoPath, fullPath)
      const lowerPath = relativePath.toLowerCase()
      if (SKIP_FILES.some(skip => lowerPath.endsWith(skip))) continue
      if (!allowedExtensions.some(ext => lowerPath.endsWith(ext))) continue

      try {
        // Double check: a real file, not too big, and really inside the repo folder
        const st = await fs.lstat(fullPath)
        if (!st.isFile() || st.size > MAX_FILE_BYTES) continue
        const real = await fs.realpath(fullPath)
        if (!real.startsWith(realRoot + path.sep)) continue

        const content = await fs.readFile(fullPath, 'utf-8')
        if (content.trim().length < 20) continue

        files.push({ path: relativePath.slice(0, 300), content })
      } catch (error) {
        console.error(`Failed to read ${relativePath}:`, error)
      }
    }
  }

  await walk(repoPath, 0)
  return files
}