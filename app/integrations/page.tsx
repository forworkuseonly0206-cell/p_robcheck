// app/integrations/page.tsx - COMPLETE UPDATED VERSION
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { 
  Key, 
  Copy, 
  Trash2, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Code,
  Terminal,
  Github,
  GitlabIcon as Gitlab,
  Settings
} from 'lucide-react'

interface ApiKey {
  id: string
  name: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export default function IntegrationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [showNewKeyModal, setShowNewKeyModal] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)
      await loadApiKeys()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadApiKeys() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setApiKeys(data.keys || [])
      }
    } catch (error) {
      console.error('Error loading API keys:', error)
    }
  }

  async function createApiKey() {
    if (!newKeyName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name for the API key' })
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newKeyName.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setNewlyCreatedKey(data.apiKey)
        setNewKeyName('')
        await loadApiKeys()
        setMessage({ type: 'success', text: 'API key created successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        throw new Error('Failed to create API key')
      }
    } catch (error) {
      console.error('Error creating API key:', error)
      setMessage({ type: 'error', text: 'Failed to create API key' })
    }
  }

  async function deleteApiKey(keyId: string) {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`/api/api-keys?id=${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (response.ok) {
        await loadApiKeys()
        setMessage({ type: 'success', text: 'API key deleted' })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error deleting API key:', error)
      setMessage({ type: 'error', text: 'Failed to delete API key' })
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl">
        <div>
          <h1 className="text-3xl font-bold font-mono">CI/CD Integration</h1>
          <p className="text-muted-foreground mt-1">
            Integrate ProbCheck into your development workflow
          </p>
        </div>

        {message && (
          <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* API Keys Section */}
        <Card className="bg-card/50 border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2 font-mono">
                <Key className="w-5 h-5 text-primary" />
                API Keys
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Generate API keys to use ProbCheck in your CI/CD pipelines
              </p>
            </div>
            <Button
              onClick={() => setShowNewKeyModal(!showNewKeyModal)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </div>

          {showNewKeyModal && (
            <div className="mb-6 p-4 bg-secondary/30 rounded-lg border border-border">
              <Label htmlFor="keyName" className="font-mono">API Key Name</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  id="keyName"
                  placeholder="e.g., GitHub Actions, GitLab CI"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 bg-secondary border-border"
                />
                <Button onClick={createApiKey} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Create
                </Button>
                <Button variant="outline" onClick={() => setShowNewKeyModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {newlyCreatedKey && (
            <Alert className="mb-6 bg-primary/10 border-primary/30">
              <AlertCircle className="w-4 h-4 text-primary" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="text-primary font-semibold">
                    ⚠️ Save this API key now - you won't be able to see it again!
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg border border-border">
                    <code className="flex-1 text-sm font-mono break-all">
                      {newlyCreatedKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(newlyCreatedKey)}
                      className="shrink-0"
                    >
                      {copiedKey ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNewlyCreatedKey(null)}
                  >
                    I've saved it
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No API keys yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border"
                >
                  <div>
                    <div className="font-medium font-mono">{key.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Created: {new Date(key.created_at).toLocaleDateString()}
                      {key.last_used_at && (
                        <> • Last used: {new Date(key.last_used_at).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                      Active
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteApiKey(key.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Integration Examples */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-card/50 border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Github className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold font-mono">GitHub Actions</h3>
                <Badge variant="outline" className="text-xs mt-1">Popular</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Run security scans on every push or pull request
            </p>
            <Button variant="outline" className="w-full" onClick={() => {
              const element = document.getElementById('github-example')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}>
              <Code className="w-4 h-4 mr-2" />
              View Example
            </Button>
          </Card>

          <Card className="bg-card/50 border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Gitlab className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold font-mono">GitLab CI/CD</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Integrate into your GitLab pipelines
            </p>
            <Button variant="outline" className="w-full" onClick={() => {
              const element = document.getElementById('gitlab-example')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}>
              <Code className="w-4 h-4 mr-2" />
              View Example
            </Button>
          </Card>

          <Card className="bg-card/50 border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-chart-3" />
              </div>
              <div>
                <h3 className="font-semibold font-mono">cURL / API</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Use with any CI/CD tool via REST API
            </p>
            <Button variant="outline" className="w-full" onClick={() => {
              const element = document.getElementById('curl-example')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}>
              <Code className="w-4 h-4 mr-2" />
              View Example
            </Button>
          </Card>
        </div>

        {/* ✅ UPDATED: GitHub Actions Example - Scans ALL Languages */}
        <Card className="bg-card/50 border-border p-6" id="github-example">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-mono">
            <Github className="w-5 h-5 text-primary" />
            GitHub Actions Example
          </h3>
          <pre className="bg-black/20 rounded-lg p-4 overflow-x-auto text-sm">
            <code className="font-mono">{`# .github/workflows/probcheck-security.yml
name: ProbCheck Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run ProbCheck Scan
        run: |
          RESPONSE=$(curl -s -X POST https://probcheck.com/api/ci-cd/scan \\
            -H "Authorization: Bearer \${{ secrets.PROBCHECK_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d '{
              "repositoryUrl": "\${{ github.server_url }}/\${{ github.repository }}",
              "language": "all",
              "projectName": "\${{ github.repository }}",
              "failOnCritical": true,
              "failOnHigh": false
            }')
          
          # Display results
          echo "$RESPONSE" | jq '.'
          
          # Extract vulnerabilities
          CRITICAL=$(echo "$RESPONSE" | jq -r '.summary.critical // 0')
          HIGH=$(echo "$RESPONSE" | jq -r '.summary.high // 0')
          MEDIUM=$(echo "$RESPONSE" | jq -r '.summary.medium // 0')
          LOW=$(echo "$RESPONSE" | jq -r '.summary.low // 0')
          
          echo "🔴 Critical: $CRITICAL"
          echo "🟠 High: $HIGH"
          echo "🟡 Medium: $MEDIUM"
          echo "🔵 Low: $LOW"
          
          # Check exit code
          EXIT_CODE=$(echo "$RESPONSE" | jq -r '.exitCode // 0')
          if [ "$EXIT_CODE" != "0" ]; then
            echo "❌ Security vulnerabilities found!"
            exit 1
          fi
          
          echo "✅ No critical vulnerabilities found"

# Setup Instructions:
# 1. Go to: Settings → Secrets and variables → Actions
# 2. Click "New repository secret"
# 3. Name: PROBCHECK_API_KEY
# 4. Value: [paste your API key]
# 5. Save this file as .github/workflows/probcheck-security.yml`}</code>
          </pre>
          <div className="mt-4 flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => copyToClipboard(document.querySelector('#github-example code')?.textContent || '')}
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy Code
            </Button>
          </div>
        </Card>

        {/* ✅ UPDATED: GitLab CI Example - Scans ALL Languages */}
        <Card className="bg-card/50 border-border p-6" id="gitlab-example">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-mono">
            <Gitlab className="w-5 h-5 text-accent" />
            GitLab CI/CD Example
          </h3>
          <pre className="bg-black/20 rounded-lg p-4 overflow-x-auto text-sm">
            <code className="font-mono">{`# .gitlab-ci.yml
stages:
  - security

probcheck_scan:
  stage: security
  script:
    - |
      RESPONSE=$(curl -s -X POST https://probcheck.com/api/ci-cd/scan \\
        -H "Authorization: Bearer $PROBCHECK_API_KEY" \\
        -H "Content-Type: application/json" \\
        -d "{
          \\"repositoryUrl\\": \\"$CI_PROJECT_URL\\",
          \\"language\\": \\"all\\",
          \\"projectName\\": \\"$CI_PROJECT_NAME\\",
          \\"failOnCritical\\": true,
          \\"failOnHigh\\": false
        }")
      
      # Display results
      echo "$RESPONSE" | jq '.'
      
      # Extract vulnerabilities
      CRITICAL=$(echo "$RESPONSE" | jq -r '.summary.critical // 0')
      HIGH=$(echo "$RESPONSE" | jq -r '.summary.high // 0')
      
      echo "🔴 Critical: $CRITICAL"
      echo "🟠 High: $HIGH"
      
      # Check exit code
      EXIT_CODE=$(echo "$RESPONSE" | jq -r '.exitCode // 0')
      if [ "$EXIT_CODE" != "0" ]; then
        echo "❌ Security vulnerabilities found!"
        exit 1
      fi
      
      echo "✅ No critical vulnerabilities found"
  only:
    - merge_requests
    - main

# Setup Instructions:
# 1. Go to: Settings → CI/CD → Variables
# 2. Click "Add variable"
# 3. Key: PROBCHECK_API_KEY
# 4. Value: [paste your API key]
# 5. Check "Protect variable" and "Mask variable"
# 6. Save this file as .gitlab-ci.yml`}</code>
          </pre>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => copyToClipboard(document.querySelector('#gitlab-example code')?.textContent || '')}
            className="mt-4"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy Code
          </Button>
        </Card>

        {/* ✅ UPDATED: cURL Example - Scans ALL Languages */}
        <Card className="bg-card/50 border-border p-6" id="curl-example">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-mono">
            <Terminal className="w-5 h-5 text-chart-3" />
            cURL Example (Any CI/CD)
          </h3>
          <pre className="bg-black/20 rounded-lg p-4 overflow-x-auto text-sm">
            <code className="font-mono">{`# Scan ALL languages (recommended)
curl -X POST https://probcheck.com/api/ci-cd/scan \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "repositoryUrl": "https://github.com/user/repo",
    "language": "all",
    "projectName": "my-project",
    "failOnCritical": true,
    "failOnHigh": false
  }'

# Or scan specific languages only
curl -X POST https://probcheck.com/api/ci-cd/scan \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "repositoryUrl": "https://github.com/user/repo",
    "language": "javascript,python,go",
    "projectName": "my-project",
    "failOnCritical": true
  }'

# Response:
{
  "success": true,
  "scanId": "scan-123",
  "summary": {
    "critical": 0,
    "high": 2,
    "medium": 5,
    "low": 3
  },
  "exitCode": 0,
  "message": "Scan completed successfully",
  "reportUrl": "https://probcheck.com/reports/scan-123",
  "filesScanned": 45,
  "scannerTier": "advanced"
}`}</code>
          </pre>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => copyToClipboard(document.querySelector('#curl-example code')?.textContent || '')}
            className="mt-4"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy Code
          </Button>
        </Card>

        {/* API Documentation */}
        <Card className="bg-card/50 border-border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 font-mono">
            <Settings className="w-5 h-5 text-primary" />
            API Parameters
          </h3>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/30 rounded-lg border border-border">
              <div className="font-mono font-semibold">Parameter</div>
              <div className="font-mono font-semibold">Type</div>
              <div className="font-mono font-semibold">Description</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/20 rounded-lg">
              <code className="text-primary">repositoryUrl</code>
              <span className="text-muted-foreground">string (required)</span>
              <span>GitHub/GitLab/Bitbucket repo URL</span>
            </div>

            <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/20 rounded-lg">
              <code className="text-primary">language</code>
              <span className="text-muted-foreground">string</span>
              <span>"all" or comma-separated: "javascript,python,go"</span>
            </div>

            <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/20 rounded-lg">
              <code className="text-primary">projectName</code>
              <span className="text-muted-foreground">string</span>
              <span>Custom project name</span>
            </div>

            <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/20 rounded-lg">
              <code className="text-primary">failOnCritical</code>
              <span className="text-muted-foreground">boolean</span>
              <span>Fail build if critical vulnerabilities found (recommended: true)</span>
            </div>

            <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/20 rounded-lg">
              <code className="text-primary">failOnHigh</code>
              <span className="text-muted-foreground">boolean</span>
              <span>Fail build if high-severity vulnerabilities found</span>
            </div>

            <div className="grid grid-cols-3 gap-4 p-3 bg-secondary/20 rounded-lg">
              <code className="text-primary">failThreshold</code>
              <span className="text-muted-foreground">number</span>
              <span>Fail if total vulnerabilities exceed this number</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <h4 className="font-mono font-semibold mb-2">💡 Pro Tips</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use <code className="text-primary">"language": "all"</code> to scan all languages in your repository</li>
              <li>• Set <code className="text-primary">failOnCritical: true</code> to block deployments with critical bugs</li>
              <li>• View the full report at the <code className="text-primary">reportUrl</code> in the response</li>
              <li>• Advanced scans are automatically enabled for Pro users</li>
            </ul>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}