"use client"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import CSVUploader, { Contact } from "@/components/CSVUploader"
import ContactsTable from "@/components/ContactsTable"
import MessageEditor from "@/components/MessageEditor"
import MediaUploader from "@/components/MediaUploader"
import CampaignControls from "@/components/CampaignControls"
import SingleMessageSender from "@/components/SingleMessageSender"
import AutoReplyManager from "@/components/AutoReplyManager"
import LeadFinderModal from "@/components/LeadFinderModal"
import WhatsAppPreview from "@/components/WhatsAppPreview"
import FloatingWhatsAppSimulator from "@/components/FloatingWhatsAppSimulator"
import WhatsAppStatusModal from "@/components/WhatsAppStatusModal"
import { Button } from "@/components/ui/button"
import { getTemplateForCategory, CATEGORY_TEMPLATES } from "@/config/categoryTemplates"
import { 
  Send, 
  Users, 
  MessageSquare, 
  Smartphone, 
  ShieldCheck, 
  Sparkles, 
  Menu, 
  X, 
  Zap, 
  Bot,
  Search,
  Command,
  MapPin,
  CheckCircle2,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft
} from "lucide-react"

export default function DashboardPage() {
  // Mode state: 'single' | 'bulk' | 'autoreply'
  const [activeMode, setActiveMode] = useState<"single" | "bulk" | "autoreply">("single")

  // Sidebar collapse state (desktop & mobile)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Current active niche category & message template
  const [selectedCategory, setSelectedCategory] = useState("Cake Shop")
  const [message, setMessage] = useState(CATEGORY_TEMPLATES["Cake Shop"])
  const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined)

  // Auto-reply preview message state
  const [autoReplyPreviewText, setAutoReplyPreviewText] = useState(
    "Hey! 👋 Thanks for reaching out. Got your message!\n\nI'll get back to you personally in just a little bit.\n\nMeanwhile, you can take a look at my portfolio:\n🔗 https://suraj-banerjee.vercel.app/\n\nIf it's urgent, feel free to call 9609618271. Speak soon!"
  )

  // Single mode state
  const [singleRecipientName, setSingleRecipientName] = useState("Rahul Sharma")
  const [singlePhone, setSinglePhone] = useState("")

  // Bulk mode state
  const [contacts, setContacts] = useState<Contact[]>([])

  // Lead Finder Modal State
  const [isLeadFinderOpen, setIsLeadFinderOpen] = useState(false)
  const [importNotification, setImportNotification] = useState<string | null>(null)

  // Search input state
  const [searchQuery, setSearchQuery] = useState("")

  // Handle category template auto-sync from LeadFinder
  const handleCategorySelect = (categoryName: string, templateText: string) => {
    setSelectedCategory(categoryName)
    setMessage(templateText)
  }

  // Handle imported leads from Google Maps
  const handleImportLeads = (newLeads: Array<{ name: string; phone: string }>, categoryName: string) => {
    setContacts((prev) => {
      const existingPhones = new Set(prev.map((c) => c.phone))
      const uniqueNew = newLeads.filter((l) => !existingPhones.has(l.phone))
      return [...uniqueNew, ...prev]
    })
    
    // Auto-apply category template
    if (categoryName) {
      setSelectedCategory(categoryName)
      setMessage(getTemplateForCategory(categoryName))
    }

    setActiveMode("bulk")
    setImportNotification(`Successfully imported ${newLeads.length} leads with "${categoryName}" outreach template!`)
    setTimeout(() => setImportNotification(null), 5000)
  }

  // Determine current preview message & recipient name
  const currentPreviewMessage = activeMode === "autoreply" ? autoReplyPreviewText : message
  const currentPreviewName =
    activeMode === "single"
      ? singleRecipientName || "Recipient"
      : activeMode === "autoreply"
      ? "Inbound Customer"
      : contacts[0]?.name || "Cake Corner"

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Ambient Radial Background Glow Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/[0.07] rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-500/[0.06] rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-[40%] right-[30%] w-[400px] h-[400px] bg-sky-500/[0.04] rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Global Topbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-2xl">
        {/* Left: Sidebar Toggle Button & Brand Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileDrawerOpen(!mobileDrawerOpen)
              } else {
                setSidebarCollapsed(!sidebarCollapsed)
              }
            }}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 hover:shadow-glow-emerald transition-all duration-200 cursor-pointer flex items-center justify-center"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4.5 h-4.5 text-emerald-400" />
            ) : (
              <PanelLeftClose className="w-4.5 h-4.5 text-slate-300" />
            )}
          </button>

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-extrabold shadow-glow-emerald border border-white/20">
                <Send className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-950 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  WhatsBlast
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 uppercase tracking-wider shadow-glow-emerald">
                  PRO v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                Autonomous WhatsApp Outreach Engine
              </p>
            </div>
          </div>
        </div>

        {/* Center: Lead Finder Trigger & Search Bar */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsLeadFinderOpen(true)}
            className="h-9 px-3.5 text-xs font-semibold gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 shadow-glow-emerald"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Find Local Leads (Google Maps)
          </Button>

          <div className="hidden lg:flex items-center max-w-xs w-60 relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-10 pr-10 rounded-full bg-slate-900/60 border border-white/[0.08] text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner-light"
            />
            <div className="absolute right-2.5 top-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] text-slate-400 font-mono">
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>
        </div>

        {/* Right: Socket Status Pill */}
        <div className="flex items-center gap-2 sm:gap-3">
          <WhatsAppStatusModal />
        </div>
      </header>

      {/* Main App Body with Smooth Layout Resizing */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Collapsible Animated Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            width: sidebarCollapsed ? 0 : 260,
            opacity: sidebarCollapsed ? 0 : 1,
          }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="hidden md:flex flex-col justify-between bg-slate-950/90 backdrop-blur-2xl border-r border-white/[0.08] p-5 overflow-hidden flex-shrink-0 z-20"
          style={{ pointerEvents: sidebarCollapsed ? "none" : "auto" }}
        >
          <div className="space-y-6 w-[220px]">
            <div>
              <div className="flex items-center justify-between px-3 mb-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Dispatch Modules
                </span>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  title="Collapse Sidebar"
                  className="text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1.5">
                <button
                  onClick={() => setActiveMode("single")}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeMode === "single"
                      ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="truncate">Direct Single</span>
                </button>

                <button
                  onClick={() => setActiveMode("bulk")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeMode === "bulk"
                      ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="flex items-center gap-3 truncate">
                    <Users className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">Bulk Blast</span>
                  </span>
                  {contacts.length > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {contacts.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveMode("autoreply")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeMode === "autoreply"
                      ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="flex items-center gap-3 truncate">
                    <Bot className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">Auto-Reply</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live
                  </span>
                </button>

                {/* Local Lead Finder Sidebar Item */}
                <button
                  onClick={() => setIsLeadFinderOpen(true)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-500/10 border border-emerald-500/20 shadow-glow-emerald transition-all duration-200 cursor-pointer"
                >
                  <span className="flex items-center gap-3 truncate">
                    <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">Local Lead Finder</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                    Maps
                  </span>
                </button>
              </nav>
            </div>

            {/* WhatsApp Safety Engine Status Card */}
            <div className="p-4 rounded-3xl bg-slate-900/60 border border-white/[0.08] space-y-2.5 shadow-glass backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Anti-Ban Shield
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  Active
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Throttled human-mimic dispatching with 25-45s randomized pacing & pre-flight number verification.
              </p>

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Pacing: 25-45s</span>
                <span>Max: 20/batch</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] text-[11px] text-slate-500 flex items-center justify-between w-[220px]">
            <span className="font-mono">v2.0 • Web3 Dark</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald"></span> Socket Active
            </span>
          </div>
        </motion.aside>

        {/* Mobile Sliding Drawer Sidebar */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileDrawerOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-950/95 backdrop-blur-2xl border-r border-white/[0.1] p-5 flex flex-col justify-between md:hidden shadow-2xl"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                        <Send className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <span className="font-bold text-white text-sm">WhatsBlast PRO</span>
                    </div>
                    <button
                      onClick={() => setMobileDrawerOpen(false)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <nav className="space-y-1.5">
                    <button
                      onClick={() => {
                        setActiveMode("single")
                        setMobileDrawerOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold ${
                        activeMode === "single"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald"
                          : "text-slate-400"
                      }`}
                    >
                      <Zap className="w-4 h-4 text-emerald-400" /> Direct Single Message
                    </button>

                    <button
                      onClick={() => {
                        setActiveMode("bulk")
                        setMobileDrawerOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold ${
                        activeMode === "bulk"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald"
                          : "text-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-emerald-400" /> Bulk Blast Engine
                      </span>
                      {contacts.length > 0 && (
                        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          {contacts.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setActiveMode("autoreply")
                        setMobileDrawerOpen(false)
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold ${
                        activeMode === "autoreply"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald"
                          : "text-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Bot className="w-4 h-4 text-emerald-400" /> Auto-Reply Engine
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                        Live
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setIsLeadFinderOpen(true)
                        setMobileDrawerOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-emerald-400 border border-emerald-500/20 bg-emerald-500/10"
                    >
                      <span className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-emerald-400" /> Local Lead Finder
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
                        Maps
                      </span>
                    </button>
                  </nav>
                </div>

                <div className="pt-4 border-t border-white/[0.08] text-xs text-slate-500 flex items-center justify-between">
                  <span>v2.0 • Web3 Dark</span>
                  <span className="text-emerald-400 font-semibold">Socket Active</span>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Workspace - Expands to FULL WIDTH when sidebar is collapsed */}
        <motion.main
          layout
          className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full transition-all duration-300 space-y-6"
        >
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {/* Notification Alert */}
            {importNotification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs text-emerald-200 font-semibold shadow-glow-emerald"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{importNotification}</span>
                </div>
                <button onClick={() => setImportNotification(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* Header & Tri-Mode Pill Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  {activeMode === "single"
                    ? "Direct Single WhatsApp Dispatch"
                    : activeMode === "bulk"
                    ? "Bulk WhatsApp Campaign Blast"
                    : "Automatic 'Thank You' Inbound Auto-Reply"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {activeMode === "single"
                    ? "Real-time pre-flight verification with instant single recipient transmission."
                    : activeMode === "bulk"
                    ? "Throttled bulk campaign delivery with personalization tags and anti-ban delay."
                    : "Autonomous inbound responder with 24h loop prevention and custom template."}
                </p>
              </div>

              {/* Futuristic Tri-Mode Segmented Pill */}
              <div className="flex items-center p-1 rounded-2xl bg-slate-950/80 border border-white/[0.1] shadow-inner-light backdrop-blur-xl flex-shrink-0">
                <button
                  onClick={() => setActiveMode("single")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    activeMode === "single"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-glow-emerald"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" /> Single Direct
                </button>

                <button
                  onClick={() => setActiveMode("bulk")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    activeMode === "bulk"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-glow-emerald"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Bulk Blast
                </button>

                <button
                  onClick={() => setActiveMode("autoreply")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                    activeMode === "autoreply"
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-glow-emerald"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" /> Auto-Reply
                </button>
              </div>
            </div>

            {/* Mode 1: Single Direct Message View */}
            {activeMode === "single" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
                {/* Left Column: Single Sender Form & Media (6 cols) */}
                <div className="lg:col-span-6 space-y-5">
                  <SingleMessageSender
                    message={message}
                    mediaUrl={mediaUrl}
                    recipientName={singleRecipientName}
                    onRecipientNameChange={setSingleRecipientName}
                    onPhoneChange={setSinglePhone}
                  />
                  <MediaUploader onChange={(u) => setMediaUrl(u)} />
                </div>

                {/* Right Column: Message Editor with Category selector (6 cols) */}
                <div className="lg:col-span-6 space-y-5">
                  <MessageEditor
                    value={message}
                    onChange={setMessage}
                    selectedCategory={selectedCategory}
                  />
                </div>
              </div>
            )}

            {/* Mode 2: Bulk Campaign View */}
            {activeMode === "bulk" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
                {/* Left Column: Lead Finder Banner + CSV Uploader & Media (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Local Lead Finder Quick Action Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-teal-950/30 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-glow-emerald backdrop-blur-xl">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Google Maps Lead Finder
                      </div>
                      <p className="text-[11px] text-emerald-300/80">
                        Search local shops by location & auto-import verified numbers
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="whatsapp"
                      size="sm"
                      onClick={() => setIsLeadFinderOpen(true)}
                      className="text-xs h-8 px-3 font-bold flex-shrink-0"
                    >
                      Find Leads
                    </Button>
                  </div>

                  <CSVUploader onParse={(rows) => setContacts(rows)} />
                  <MediaUploader onChange={(u) => setMediaUrl(u)} />
                </div>

                {/* Right Column: Composer with Niche Templates, Table & Campaign Dispatch (7 cols) */}
                <div className="lg:col-span-7 space-y-5">
                  <MessageEditor
                    value={message}
                    onChange={setMessage}
                    selectedCategory={selectedCategory}
                  />
                  <ContactsTable contacts={contacts} onChange={setContacts} />
                  <CampaignControls
                    contacts={contacts}
                    message={message}
                    mediaUrl={mediaUrl}
                  />
                </div>
              </div>
            )}

            {/* Mode 3: Auto-Reply Engine View */}
            {activeMode === "autoreply" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
                {/* Full Width Column: Auto-Reply Settings & Logs (12 cols) */}
                <div className="lg:col-span-12 space-y-5">
                  <AutoReplyManager
                    onPreviewTemplate={(text) => setAutoReplyPreviewText(text)}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.main>
      </div>

      {/* Fixed Floating Live WhatsApp Simulator (Bottom Right with Hamburger Toggle) */}
      <FloatingWhatsAppSimulator
        message={currentPreviewMessage}
        mediaUrl={activeMode === "autoreply" ? undefined : mediaUrl}
        sampleName={currentPreviewName}
      />

      {/* Google Maps Lead Finder Modal */}
      <LeadFinderModal
        isOpen={isLeadFinderOpen}
        onClose={() => setIsLeadFinderOpen(false)}
        onImportLeads={handleImportLeads}
        onCategorySelect={handleCategorySelect}
      />
    </div>
  )
}

