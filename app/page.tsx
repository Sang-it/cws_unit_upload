"use client"

import { useState, useCallback, useEffect } from "react"
import { Check, X, FileArchive } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import dynamic from "next/dynamic"

// Import the DropzoneComponent dynamically with SSR disabled
const DropzoneComponent = dynamic(() => import("../components/dropzone-component"), { ssr: false })

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [isMounted, setIsMounted] = useState(false)

  // Set isMounted to true when component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const onFileDrop = useCallback((selectedFile: File | null, error?: string) => {
    if (selectedFile) {
      setFile(selectedFile)
      setStatus("idle")
    } else if (error) {
      setErrorMessage(error)
      setStatus("error")
    }
  }, [])

  const uploadFile = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)
    setStatus("idle")

    const formData = new FormData()
    formData.append("file", file)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 100)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (response.ok) {
        setProgress(100)
        setStatus("success")
        setTimeout(() => {
          setFile(null)
          setProgress(0)
        }, 3000)
      } else {
        const error = await response.json()
        setErrorMessage(error.message || "Upload failed")
        setStatus("error")
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred")
      setStatus("error")
    } finally {
      setUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setStatus("idle")
    setProgress(0)
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-[#0d0d0d] to-[#1a1a1a]">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload a ZIP file</CardTitle>
          <CardDescription>Drag and drop your ZIP file or click to browse</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && !file && isMounted && (
            <DropzoneComponent onFileDrop={onFileDrop} disabled={uploading} />
          )}

          {file && status === "idle" && (
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                <FileArchive className="h-8 w-8 mr-3 text-[#22d3ee]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="icon" onClick={resetUpload} disabled={uploading} className="ml-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetUpload} disabled={uploading}>
                  Cancel
                </Button>
                <Button
                  onClick={uploadFile}
                  disabled={uploading}
                  className="bg-[#22d3ee] hover:bg-[#22d3ee]/80 text-black"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 bg-gray-700" />
              <p className="text-xs text-center text-gray-400">Uploading... {progress}%</p>
            </div>
          )}

          {status === "success" && (
            <Alert className="bg-green-500/20 border-green-500/50">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>Your file has been uploaded successfully.</AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert className="bg-red-500/20 border-red-500/50">
              <X className="h-4 w-4 text-red-500" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
