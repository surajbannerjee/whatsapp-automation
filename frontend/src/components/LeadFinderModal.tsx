"use client"
import React, { useState } from "react"
import { motion } from "framer-motion"
import { Dialog } from "./ui/dialog"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { searchLeads, exportLeadsCsv, LeadItem } from "@/lib/api"
import { getTemplateForCategory, CATEGORY_TEMPLATES } from "@/config/categoryTemplates"
import { 
  MapPin, 
  Search, 
  Download, 
  Users, 
  Star, 
  Check, 
  CheckSquare, 
  Square, 
  Building2, 
  Phone, 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  Key,
  MessageSquareQuote
} from "lucide-react"

interface LeadFinderModalProps {
  isOpen: boolean
  onClose: () => void
  onImportLeads: (leads: Array<{ name: string; phone: string }>, category: string) => void
  onCategorySelect?: (category: string, template: string) => void
}

export default function LeadFinderModal({
  isOpen,
  onClose,
  onImportLeads,
  onCategorySelect
}: LeadFinderModalProps) {
  const [category, setCategory] = useState("Cake Shop")
  const [location, setLocation] = useState("Garia, Kolkata")
  const [apiKey, setApiKey] = useState("")
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [totalFound, setTotalFound] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat)
    const matchedTemplate = getTemplateForCategory(newCat)
    onCategorySelect?.(newCat, matchedTemplate)
  }

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!category.trim() || !location.trim()) {
      setError("Please specify both business category and target location.")
      return
    }

    setLoading(true)
    setError(null)

    // Trigger category template sync
    const matchedTemplate = getTemplateForCategory(category)
    onCategorySelect?.(category, matchedTemplate)

    try {
      const res = await searchLeads(category.trim(), location.trim(), apiKey.trim() || undefined)
      if (res.success) {
        setLeads(res.leads)
        setTotalFound(res.totalFound)
        // Auto-select all by default
        setSelectedIds(new Set(res.leads.map((l) => l.id)))
        if (res.leads.length === 0) {
          setError(`Found ${res.totalFound} places in Google Maps, but none listed a public phone number. Try broadening the location.`)
        }
      }
    } catch (err: any) {
      console.error("Lead search failed", err)
      const msg = err.response?.data?.error || err.message || "Failed to search Google Maps leads"
      setError(msg)
      if (msg.includes("API Key is missing") || msg.includes("Unauthorized")) {
        setShowApiKeyInput(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)))
    }
  }

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const handleExportCsv = async () => {
    const selectedLeads = leads.filter((l) => selectedIds.has(l.id))
    if (selectedLeads.length === 0) {
      alert("Please select at least 1 lead to export.")
      return
    }

    try {
      const blob = await exportLeadsCsv(selectedLeads)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `google_leads_${category.replace(/\s+/g, '_')}_${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to export CSV", err)
      alert("Failed to export CSV file.")
    }
  }

  const handleImportToCampaign = () => {
    const selectedLeads = leads.filter((l) => selectedIds.has(l.id))
    if (selectedLeads.length === 0) {
      alert("Please select at least 1 lead to import.")
      return
    }

    const contactsToImport = selectedLeads.map((l) => ({
      name: l.name,
      phone: l.phone
    }))

    onImportLeads(contactsToImport, category)
    onClose()
  }

  const quickCategories = [
    "Cake Shop",
    "Bakery",
    "Cafe",
    "Restaurant",
    "Gym / Fitness",
    "Salon / Spa",
    "Doctor Clinic",
    "Real Estate"
  ]

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[80dvw] max-h-[90vh] flex flex-col p-6"
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 shadow-glow-emerald font-bold">
              <MapPin className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Google Maps Local Lead Generator
                <Badge variant="glow" className="text-[10px] py-0.5 uppercase tracking-wider">
                  Serper.dev
                </Badge>
              </h2>
              <p className="text-xs text-slate-400">
                Extract local business profiles with verified phone numbers & auto-sync niche outreach templates
              </p>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-2 overflow-y-auto pr-1">
        {/* Search Filter Controls */}
        <form onSubmit={handleSearch} className="p-4 rounded-2xl bg-slate-950/70 border border-white/[0.08] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Business Category / Niche
              </label>
              <Input
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                placeholder="e.g. Cake Shop, Bakery, Gym"
                className="text-xs h-10 bg-slate-900/80"
              />
            </div>

            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Target Location / City
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Garia, Kolkata or Mumbai"
                className="text-xs h-10 bg-slate-900/80"
              />
            </div>

            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                variant="whatsapp"
                size="lg"
                className="w-full h-10 text-xs font-bold"
              >
                <Search className="w-3.5 h-3.5 mr-1.5" />
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-500 font-semibold mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Niche Templates:
            </span>
            {quickCategories.map((cat, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`text-[11px] py-1 px-2.5 rounded-xl border transition-all duration-200 cursor-pointer font-medium ${
                  category.toLowerCase() === cat.toLowerCase()
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-glow-emerald"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:border-emerald-500/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Active Template Badge Banner */}
          <div className="p-2.5 bg-emerald-950/20 rounded-xl border border-emerald-500/20 flex items-center gap-2 text-xs text-emerald-300">
            <MessageSquareQuote className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Connected Outreach Template: <strong className="text-white font-bold">{category || "Universal"}</strong> (Auto-populates Composer)
            </span>
          </div>

          {/* Custom Serper API Key Collapsible Bar */}
          <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Key className="w-3 h-3" />
              {showApiKeyInput ? "Hide API Key config" : "Custom Serper.dev API Key (Optional)"}
            </button>

            <a
              href="https://serper.dev"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-emerald-400/80 hover:text-emerald-300 flex items-center gap-1 font-medium"
            >
              Get Free 2,500 Queries Key <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {showApiKeyInput && (
            <div className="space-y-1 pt-1 animate-in fade-in">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your Serper API Key here (or save SERPER_API_KEY in .env)"
                className="text-xs h-8 bg-slate-900/90 font-mono"
              />
            </div>
          )}
        </form>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <p className="flex-1 font-medium">{error}</p>
          </div>
        )}

        {/* Results Data Table */}
        {leads.length > 0 && (
          <div className="space-y-3 animate-in fade-in">
            {/* Summary Bar & Selection Count */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="success" className="text-xs font-semibold py-0.5">
                  {leads.length} Leads with Phone Numbers
                </Badge>
                <span className="text-slate-500 text-xs">
                  (out of {totalFound} Google Maps places)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"
                >
                  {selectedIds.size === leads.length ? (
                    <>
                      <CheckSquare className="w-3.5 h-3.5" /> Deselect All
                    </>
                  ) : (
                    <>
                      <Square className="w-3.5 h-3.5" /> Select All ({leads.length})
                    </>
                  )}
                </button>
                <span className="text-xs font-bold text-slate-300">
                  {selectedIds.size} selected
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-slate-950/60 shadow-glass">
              <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                <div className="bg-slate-950/90 backdrop-blur sticky top-0 grid grid-cols-12 px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                  <div className="col-span-1"></div>
                  <div className="col-span-4">Business Name</div>
                  <div className="col-span-3">Phone Number</div>
                  <div className="col-span-2">Rating</div>
                  <div className="col-span-2">Address</div>
                </div>

                {leads.map((lead) => {
                  const isSelected = selectedIds.has(lead.id)
                  return (
                    <div
                      key={lead.id}
                      onClick={() => toggleSelectOne(lead.id)}
                      className={`grid grid-cols-12 px-4 py-2.5 items-center text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/[0.07] hover:bg-emerald-500/[0.12]"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(lead.id)}
                          className="w-4 h-4 rounded text-emerald-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 border-white/20 cursor-pointer accent-emerald-500"
                        />
                      </div>
                      <div className="col-span-4 font-bold text-white truncate pr-2 flex flex-col">
                        <span>{lead.name}</span>
                        {lead.category && (
                          <span className="text-[10px] text-slate-500 font-normal truncate">
                            {lead.category}
                          </span>
                        )}
                      </div>
                      <div className="col-span-3 font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-emerald-500/70 flex-shrink-0" />
                        +{lead.phone}
                      </div>
                      <div className="col-span-2 flex items-center gap-1">
                        {lead.rating ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {lead.rating} ({lead.reviews})
                          </span>
                        ) : (
                          <span className="text-slate-600 text-[10px]">No reviews</span>
                        )}
                      </div>
                      <div className="col-span-2 text-slate-400 text-[11px] truncate" title={lead.address}>
                        {lead.address}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Footer */}
        {leads.length > 0 && (
          <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Selected: <strong className="text-white font-bold">{selectedIds.size}</strong> leads ready for import
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCsv}
                disabled={selectedIds.size === 0}
                className="h-10 px-4 text-xs font-semibold gap-1.5 border-white/10"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Export CSV ({selectedIds.size})
              </Button>

              <Button
                type="button"
                variant="whatsapp"
                size="sm"
                onClick={handleImportToCampaign}
                disabled={selectedIds.size === 0}
                className="h-10 px-5 text-xs font-bold gap-1.5 shadow-glow-emerald"
              >
                <Users className="w-3.5 h-3.5" />
                Import to Campaign ({selectedIds.size})
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  )
}
