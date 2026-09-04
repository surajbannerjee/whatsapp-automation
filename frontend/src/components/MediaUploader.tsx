"use client"
import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { uploadMedia, BACKEND_BASE_URL } from "@/lib/api"
import { 
  Paperclip, 
  Upload, 
  Link2, 
  FileText, 
  X, 
  CheckCircle2, 
  Image as ImageIcon,
  AlertCircle 
} from "lucide-react"

interface MediaUploaderProps {
  onChange: (url?: string) => void
}

export default function MediaUploader({ onChange }: MediaUploaderProps) {
  const [activeTab, setActiveTab] = useState("file")
  const [urlInput, setUrlInput] = useState("")
  const [currentMediaUrl, setCurrentMediaUrl] = useState<string | undefined>(undefined)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (file?: File) => {
    if (!file) return
    setError(null)
    setSelectedFile(file)
    setUploading(true)

    try {
      const res = await uploadMedia(file)
      if (res?.url) {
        const fullUrl = `${BACKEND_BASE_URL}${res.url}`
        setCurrentMediaUrl(fullUrl)
        onChange(fullUrl)
      } else {
        throw new Error("Invalid response from server")
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.message || "Failed to upload file to backend server")
      setSelectedFile(null)
    } finally {
      setUploading(false)
    }
  }

  const handleApplyUrl = () => {
    setError(null)
    if (!urlInput.trim()) {
      clearMedia()
      return
    }

    try {
      new URL(urlInput.trim())
      setCurrentMediaUrl(urlInput.trim())
      onChange(urlInput.trim())
    } catch {
      setError("Please enter a valid URL (starting with http:// or https://)")
    }
  }

  const clearMedia = () => {
    setCurrentMediaUrl(undefined)
    setSelectedFile(null)
    setUrlInput("")
    setError(null)
    onChange(undefined)
  }

  const isPdf = currentMediaUrl?.toLowerCase().endsWith(".pdf") || selectedFile?.type === "application/pdf"

  return (
    <Card className="glass-panel mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm sm:text-base font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
              <Paperclip className="w-4 h-4" />
            </div>
            Media Attachment
          </CardTitle>
          {currentMediaUrl && (
            <Badge variant="success" className="text-[11px] gap-1 py-0.5 px-2">
              <CheckCircle2 className="w-3 h-3" /> Attached
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs text-slate-400">
          Attach an image or PDF document to accompany each WhatsApp message
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {currentMediaUrl ? (
          /* Active Preview Card */
          <div className="p-3 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-between gap-3 animate-in fade-in backdrop-blur-md">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
                {isPdf ? (
                  <FileText className="w-6 h-6 text-rose-400" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentMediaUrl}
                    alt="Uploaded media"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none"
                    }}
                  />
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">
                  {selectedFile ? selectedFile.name : "Remote Media URL"}
                </p>
                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {currentMediaUrl}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearMedia}
              className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          /* Tabs: Upload vs Link */
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="file">
                <Upload className="w-3.5 h-3.5" /> Upload File
              </TabsTrigger>
              <TabsTrigger value="url">
                <Link2 className="w-3.5 h-3.5" /> Direct URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file">
              <label
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center border-white/10 bg-black/20 hover:border-emerald-500/40 hover:bg-emerald-950/20 ${
                  uploading ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <input
                  type="file"
                  accept="image/*,.pdf,application/pdf"
                  onChange={(e) => handleFileUpload(e.target.files?.[0])}
                  className="hidden"
                />
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] text-slate-400 flex items-center justify-center mb-1.5 border border-white/5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  {uploading ? "Uploading media to server..." : "Click to browse images or PDF"}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WEBP or PDF up to 10MB</p>
              </label>
            </TabsContent>

            <TabsContent value="url">
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/banner.jpg"
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyUrl}
                  className="h-10 px-3.5 text-xs"
                >
                  Apply
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {error && (
          <div className="flex items-center gap-2 p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <p className="flex-1">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
