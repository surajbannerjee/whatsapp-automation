"use client"
import React, { useRef, useState } from "react"
import { motion } from "framer-motion"
import Papa from "papaparse"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck2,
  Trash2 
} from "lucide-react"

export type Contact = { name?: string; phone: string }

export default function CSVUploader({ onParse }: { onParse: (rows: Contact[]) => void }) {
  const [dragActive, setDragActive] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [rowCount, setRowCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = (file?: File) => {
    if (!file) return
    setError(null)

    if (!file.name.endsWith(".csv") && file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
      setError("Please select a valid CSV file (.csv)")
      return
    }

    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[]
        if (!data || data.length === 0) {
          setError("The selected CSV file contains no data.")
          return
        }

        const rows: Contact[] = data.map((r) => {
          const name = r.name || r.Name || r.NAME || r.FullName || r.full_name || ""
          const phone = r.phone || r.Phone || r.PHONE || r.phoneNumber || r.phone_number || r.Mobile || r.mobile || ""
          return {
            name: String(name).trim(),
            phone: String(phone).trim()
          }
        })

        const validRows = rows.filter((r) => r.phone && r.phone.length >= 7)

        if (validRows.length === 0) {
          setError("No valid phone numbers found. Ensure your CSV has a 'phone' column.")
          setRowCount(0)
          return
        }

        setRowCount(validRows.length)
        onParse(validRows)
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`)
      }
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,phone\nRahul Sharma,919876543210\nPriya Patel,919123456789\nAmit Kumar,919988776655"
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "sample_contacts.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetUploader = () => {
    setFileName(null)
    setRowCount(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <Card className="glass-panel">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm sm:text-base font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            Upload Contacts CSV
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={downloadSampleCSV}
            className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-7 gap-1 border border-emerald-500/20"
          >
            <Download className="w-3 h-3" /> Sample CSV
          </Button>
        </div>
        <CardDescription className="text-xs text-slate-400">
          Import recipients list with <code className="bg-black/40 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-[11px] border border-white/5">name</code> and <code className="bg-black/40 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-[11px] border border-white/5">phone</code>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Futuristic Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center ${
            dragActive
              ? "border-emerald-400 bg-emerald-950/30 scale-[0.99] shadow-glow-emerald"
              : fileName
              ? "border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/30"
              : "border-white/10 bg-black/20 hover:border-emerald-500/40 hover:bg-slate-900/60 shadow-inner-light"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv,application/vnd.ms-excel"
            onChange={(e) => processFile(e.target.files?.[0])}
            className="hidden"
          />

          {fileName ? (
            <div className="flex flex-col items-center space-y-1.5 py-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-glow-emerald">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-white truncate max-w-[220px]">{fileName}</p>
              {rowCount !== null && (
                <Badge variant="success" className="text-[11px] gap-1 py-0.5 px-2">
                  <CheckCircle2 className="w-3 h-3" /> {rowCount} Valid Contacts
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1.5 py-1">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 flex items-center justify-center mb-1 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all duration-300">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-slate-200">
                <span className="text-emerald-400 font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-slate-500">CSV file with name & phone numbers</p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="flex-1">{error}</p>
          </div>
        )}

        {fileName && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                resetUploader()
                onParse([])
              }}
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-7 gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
