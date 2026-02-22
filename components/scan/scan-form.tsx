// components/scan/scan-form.tsx
"use client"

import React, { useState, useRef, ChangeEvent, FormEvent } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Link, Scan, Loader2, Code2 } from "lucide-react"

interface ScanFormProps {
  onStartScan: (form: FormData, scanType: 'upload' | 'repository') => Promise<any> | void
  isScanning: boolean
}

const languages = [
  { value: "javascript", label: "JavaScript", extensions: ".js, .jsx, .mjs" },
  { value: "typescript", label: "TypeScript", extensions: ".ts, .tsx" },
  { value: "python", label: "Python", extensions: ".py" },
  { value: "go", label: "Go", extensions: ".go" },
  { value: "java", label: "Java", extensions: ".java" },
  { value: "ruby", label: "Ruby", extensions: ".rb" },
  { value: "php", label: "PHP", extensions: ".php" },
  { value: "csharp", label: "C#", extensions: ".cs" },
]

export function ScanForm({ onStartScan, isScanning }: ScanFormProps) {
  const [projectName, setProjectName] = useState("")
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["javascript"])
  const [repoUrl, setRepoUrl] = useState("")
  const [sourceType, setSourceType] = useState<"upload" | "repo">("upload")
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    if (f) {
      setFileName(f.name)
      setError(null)
    } else {
      setFileName(null)
    }
  }

  function triggerFilePicker() {
    fileRef.current?.click()
  }

  // Handle language selection
  function toggleLanguage(langValue: string) {
    setSelectedLanguages(prev => {
      if (prev.includes(langValue)) {
        // Don't allow deselecting all languages
        if (prev.length === 1) {
          setError("Please select at least one language")
          return prev
        }
        return prev.filter(l => l !== langValue)
      } else {
        setError(null)
        return [...prev, langValue]
      }
    })
  }

  // Select all languages
  function selectAllLanguages() {
    setSelectedLanguages(languages.map(l => l.value))
    setError(null)
  }

  // Clear all languages (keep at least one)
  function clearAllLanguages() {
    setSelectedLanguages(["javascript"])
  }

  // handle drag & drop
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0] ?? null
    if (f) {
      // Check if it's a zip file
      if (!f.name.endsWith('.zip')) {
        setError('Please upload a .zip file')
        return
      }
      // set file input programmatically so form picks it up
      const dt = new DataTransfer()
      dt.items.add(f)
      if (fileRef.current) fileRef.current.files = dt.files
      setFileName(f.name)
      setError(null)
    }
  }
  
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  // Validate GitHub URL
  function isValidGitHubUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/,
      /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\.git$/,
      /^https?:\/\/gitlab\.com\/[\w-]+\/[\w.-]+\/?$/,
      /^https?:\/\/bitbucket\.org\/[\w-]+\/[\w.-]+\/?$/,
    ]
    return patterns.some(pattern => pattern.test(url.trim()))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    // Validate at least one language selected
    if (selectedLanguages.length === 0) {
      setError("Please select at least one language")
      return
    }

    // Build FormData
    const form = new FormData()
    form.append("projectName", projectName || "Unnamed Project")
    
    // Send languages as comma-separated string
    form.append("language", selectedLanguages.join(","))

    if (sourceType === "upload") {
      // Validate file upload
      const f = fileRef.current?.files?.[0] ?? null
      if (!f) {
        setError("Please select a .zip file before starting the scan.")
        return
      }
      if (!f.name.endsWith('.zip')) {
        setError("Please upload a .zip file")
        return
      }
      form.append("file", f)
      
      try {
        await onStartScan(form, 'upload')
      } catch (err) {
        console.error("Upload scan error", err)
        setError(String(err))
      }
    } else {
      // Validate repository URL
      if (!repoUrl.trim()) {
        setError("Please enter a repository URL")
        return
      }
      
      if (!isValidGitHubUrl(repoUrl)) {
        setError("Please enter a valid GitHub, GitLab, or Bitbucket repository URL")
        return
      }

      form.append("repositoryUrl", repoUrl.trim())
      
      try {
        await onStartScan(form, 'repository')
      } catch (err) {
        console.error("Repository scan error", err)
        setError(String(err))
      }
    }
  }

  return (
    <Card className="bg-card/50 border-border p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="projectName" className="font-mono">
            Project Name
          </Label>
          <Input
            id="projectName"
            placeholder="my-awesome-project"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-secondary border-border font-mono"
            disabled={isScanning}
          />
        </div>

        {/* Language Selection - Multi-select with Checkboxes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-mono flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Select Languages ({selectedLanguages.length} selected)
            </Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={selectAllLanguages}
                disabled={isScanning}
                className="text-xs h-7 px-2"
              >
                Select All
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearAllLanguages}
                disabled={isScanning}
                className="text-xs h-7 px-2"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-secondary/50 border border-border rounded-lg p-4">
            {languages.map((lang) => (
              <div
                key={lang.value}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                  selectedLanguages.includes(lang.value)
                    ? 'bg-primary/10 border border-primary/30'
                    : 'bg-background/50 border border-transparent hover:border-border'
                }`}
              >
                <Checkbox
                  id={lang.value}
                  checked={selectedLanguages.includes(lang.value)}
                  onCheckedChange={() => toggleLanguage(lang.value)}
                  disabled={isScanning}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={lang.value}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {lang.label}
                  </Label>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {lang.extensions}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            💡 Select multiple languages for mixed codebases (e.g., JavaScript + Python)
          </p>
        </div>

        {/* Source Type Tabs */}
        <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as "upload" | "repo")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-secondary">
            <TabsTrigger value="upload" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Upload className="mr-2 h-4 w-4" />
              Upload Code
            </TabsTrigger>
            <TabsTrigger value="repo" className="font-mono data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Link className="mr-2 h-4 w-4" />
              Repository URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <motion.div
              onClick={triggerFilePicker}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Drag and drop your .zip file here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse</p>

              <input
                ref={fileRef}
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
                disabled={isScanning}
              />

              <div className="text-sm text-muted-foreground">
                {fileName ? (
                  <span className="text-primary">✓ Selected: {fileName}</span>
                ) : (
                  <span>No file selected</span>
                )}
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="repo" className="mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <Label htmlFor="repoUrl" className="font-mono">
                Repository URL
              </Label>
              <Input
                id="repoUrl"
                placeholder="https://github.com/username/repo"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value)
                  setError(null)
                }}
                className="bg-secondary border-border font-mono"
                disabled={isScanning}
              />
              <p className="text-sm text-muted-foreground">
                Supports GitHub, GitLab, and Bitbucket repositories.
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div>
          <Button 
            type="submit" 
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green" 
            disabled={isScanning}
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="mr-2 h-4 w-4" />
                Run Scan
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}