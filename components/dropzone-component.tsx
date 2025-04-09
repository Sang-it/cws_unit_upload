"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"

interface DropzoneComponentProps {
  onFileDrop: (file: File | null, error?: string) => void
  disabled?: boolean
}

export default function DropzoneComponent({ onFileDrop, disabled = false }: DropzoneComponentProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0]
        if (selectedFile.name.endsWith(".zip")) {
          onFileDrop(selectedFile)
        } else {
          onFileDrop(null, "Please upload a ZIP file")
        }
      }
    },
    [onFileDrop],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: {
      "application/zip": [".zip"],
    },
    maxFiles: 1,
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 transition-colors duration-200 text-center cursor-pointer ${
        isDragActive
          ? "border-[#22d3ee] bg-[#22d3ee]/10"
          : "border-gray-700 hover:border-[#22d3ee]/50 hover:bg-[#22d3ee]/5"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      <Upload className="h-10 w-10 mx-auto mb-4 text-[#22d3ee]" />
      <p className="text-sm text-gray-400">
        {isDragActive ? "Drop the ZIP file here" : "Drag & drop a ZIP file here, or click to select"}
      </p>
    </div>
  )
}
