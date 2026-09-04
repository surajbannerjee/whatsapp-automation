"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { 
  getAutoReplyStats, 
  updateAutoReplyConfig, 
  clearAutoReplyCooldowns, 
  AutoReplyLog 
} from "@/lib/api"
import { 
  Bot, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  MessageSquare, 
  ArrowDownLeft, 
  User, 
  Globe, 
  Power
} from "lucide-react"

interface AutoReplyManagerProps {
  onPreviewTemplate?: (text: string) => void
}

const DEFAULT_TEMPLATE = `Hey! 👋 Thanks for reaching out. Got your message!\n\nI'll get back to you personally in just a little bit.\n\nMeanwhile, you can take a look at my portfolio to see how I help local brands build modern, fast websites:\n🔗 https://suraj-banerjee.vercel.app/\n\nIf it's urgent or you'd prefer a direct call, feel free to ring me at 9609618271. Speak soon!`

export default function AutoReplyManager({ onPreviewTemplate }: AutoReplyManagerProps) {
  const [enabled, setEnabled] = useState(true)
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [cooldownHours, setCooldownHours] = useState(24)
  const [activeCooldownsCount, setActiveCooldownsCount] = useState(0)
  const [totalRepliesTriggered, setTotalRepliesTriggered] = useState(0)
  const [recentLogs, setRecentLogs] = useState<AutoReplyLog[]>([])
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [clearSuccess, setClearSuccess] = useState(false)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await getAutoReplyStats()
      setEnabled(data.config.enabled)
      setTemplate(data.config.template)
      setCooldownHours(data.config.cooldownHours)
      setActiveCooldownsCount(data.activeCooldownsCount)
      setTotalRepliesTriggered(data.totalRepliesTriggered)
      setRecentLogs(data.recentLogs)
      onPreviewTemplate?.(data.config.template)
    } catch (err) {
      console.error("Failed to fetch auto-reply stats", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveSuccess(false)
      const res = await updateAutoReplyConfig({
        enabled,
        template,
        cooldownHours: Number(cooldownHours) || 24
      })
      if (res.success) {
        setSaveSuccess(true)
        onPreviewTemplate?.(template)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error("Failed to save auto reply config", err)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleEnabled = async () => {
    const nextState = !enabled
    setEnabled(nextState)
    try {
      await updateAutoReplyConfig({ enabled: nextState })
    } catch (err) {
      console.error("Failed to toggle enabled state", err)
    }
  }

  const handleClearCooldowns = async () => {
    if (!window.confirm("Are you sure you want to reset the cooldown cache? Auto-reply will trigger again for contacts if they message.")) {
      return
    }
    try {
      const res = await clearAutoReplyCooldowns()
      if (res.success) {
        setActiveCooldownsCount(0)
        setClearSuccess(true)
        setTimeout(() => setClearSuccess(false), 3000)
      }
    } catch (err) {
      console.error("Failed to clear cooldowns", err)
    }
  }

  const presetTemplates = [
    {
      title: "Portfolio & Call-back (Default)",
      text: DEFAULT_TEMPLATE
    },
    {
      title: "Quick Support Acknowledgment",
      text: "Hello! 🙏 Thank you for contacting our support desk. We have received your inquiry and our team is reviewing it. We will reply within 1 business hour."
    },
    {
      title: "Out of Office / Away Message",
      text: "Hi there! 👋 Thanks for messaging. I am currently away from my desk but will read your message and respond as soon as I am back online. Have a great day!"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Settings Card */}
      <Card className="glass-panel">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center shadow-glow-emerald font-bold">
                <Bot className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <CardTitle className="text-white text-base sm:text-lg font-bold flex items-center gap-2">
                  Inbound "Thank You" Auto-Reply Engine
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Automated customer greeting with anti-loop guardrails and 24-hour cooldown
                </CardDescription>
              </div>
            </div>

            {/* Enable / Disable Master Toggle with Glow */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleToggleEnabled}
                className={`relative inline-flex h-8 w-16 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ${
                  enabled ? "bg-emerald-500 shadow-glow-emerald" : "bg-slate-800"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out flex items-center justify-center text-[10px] font-bold ${
                    enabled ? "translate-x-8 text-emerald-600" : "translate-x-0 text-slate-500"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                </span>
              </button>
              <Badge variant={enabled ? "success" : "secondary"} className="text-xs font-bold py-1">
                {enabled ? "Active & Listening" : "Disabled"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Active Guardrails Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-black/30 border border-white/[0.08] rounded-2xl space-y-1 backdrop-blur-md">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Loop Prevention
              </div>
              <p className="text-[11px] text-slate-400">
                Outgoing messages sent by you (<code className="text-emerald-400 font-mono">fromMe</code>) are strictly ignored.
              </p>
            </div>

            <div className="p-3.5 bg-black/30 border border-white/[0.08] rounded-2xl space-y-1 backdrop-blur-md">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Group Chat Filter
              </div>
              <p className="text-[11px] text-slate-400">
                Group chats (<code className="text-emerald-400 font-mono">@g.us</code>) and status broadcasts are skipped.
              </p>
            </div>

            <div className="p-3.5 bg-black/30 border border-white/[0.08] rounded-2xl space-y-1 backdrop-blur-md">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Cooldown Timer
              </div>
              <p className="text-[11px] text-slate-400">
                Max 1 auto-reply per sender every <strong>{cooldownHours} hours</strong> to prevent spam loops.
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-400">Total Replies Sent</div>
                <div className="text-xl font-extrabold text-white">{totalRepliesTriggered}</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase font-bold text-emerald-400">Contacts on Cooldown</div>
                <div className="text-xl font-extrabold text-white">{activeCooldownsCount}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearCooldowns}
                className="text-xs h-8 gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              >
                <Trash2 className="w-3.5 h-3.5 text-emerald-400" /> Reset Cooldown Cache
              </Button>
              {clearSuccess && (
                <span className="text-xs text-emerald-400 font-bold animate-in fade-in">
                  ✓ Cleared!
                </span>
              )}
            </div>
          </div>

          {/* Custom Template Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Auto-Reply Response Text
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {template.length} characters
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTemplate(DEFAULT_TEMPLATE)
                    onPreviewTemplate?.(DEFAULT_TEMPLATE)
                  }}
                  className="text-xs h-7 text-slate-400 hover:text-white gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Default
                </Button>
              </div>
            </div>

            <Textarea
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value)
                onPreviewTemplate?.(e.target.value)
              }}
              rows={7}
              placeholder="Type your automated response here..."
              className="text-xs sm:text-sm font-sans leading-relaxed"
            />

            {/* Template Presets */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" /> Preset Suggestions:
              </div>
              <div className="flex flex-wrap gap-2">
                {presetTemplates.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setTemplate(p.text)
                      onPreviewTemplate?.(p.text)
                    }}
                    className="text-xs py-1 px-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all duration-200 cursor-pointer"
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Cooldown Settings & Save Action */}
          <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Cooldown Period:
              </label>
              <div className="flex items-center gap-1.5">
                {[6, 12, 24, 48].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setCooldownHours(hrs)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      cooldownHours === hrs
                        ? "bg-emerald-500 text-slate-950 shadow-glow-emerald font-extrabold"
                        : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white border border-white/5"
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-1.5">
                  <Input
                    type="number"
                    min={1}
                    max={720}
                    value={cooldownHours}
                    onChange={(e) => setCooldownHours(Number(e.target.value) || 1)}
                    className="w-16 h-8 text-xs font-mono bg-slate-950"
                  />
                  <span className="text-xs text-slate-500">hours</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved & Active!
                </span>
              )}
              <Button
                type="button"
                onClick={handleSave}
                isLoading={saving}
                variant="whatsapp"
                size="sm"
                className="h-10 px-6 text-xs font-bold shadow-glow-emerald"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Save Auto-Reply Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Auto-Reply Inbound Stream */}
      <Card className="glass-panel">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white text-sm sm:text-base font-bold flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" /> Recent Inbound Auto-Reply Stream
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Live stream of customer inbound messages that triggered the automated thank you response
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchStats}
              isLoading={loading}
              className="text-xs h-7 text-slate-400 hover:text-white gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-950/40 rounded-2xl border border-dashed border-white/10">
              <Bot className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-300">No auto-replies dispatched yet</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                When an external contact sends you a message, the automated thank you response will stream here.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-slate-950/40 divide-y divide-white/[0.05]">
              <div className="bg-slate-950/90 grid grid-cols-12 px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                <div className="col-span-4">Sender Phone</div>
                <div className="col-span-5">Inbound Message Snippet</div>
                <div className="col-span-3 text-right">Time & Status</div>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-white/[0.04]">
                {recentLogs.map((log) => (
                  <div key={log.id} className="grid grid-cols-12 px-4 py-2.5 items-center text-xs hover:bg-white/[0.03]">
                    <div className="col-span-4 font-mono font-semibold text-emerald-400 flex items-center gap-1.5 truncate">
                      <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      +{log.phone}
                    </div>
                    <div className="col-span-5 text-slate-300 truncate italic pr-2">
                      &quot;{log.incomingSnippet || "Incoming Message"}&quot;
                    </div>
                    <div className="col-span-3 text-right flex items-center justify-end gap-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Badge variant="success" className="text-[10px] py-0 px-2">
                        Delivered
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
