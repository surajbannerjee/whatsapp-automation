"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { sendBulk, getCampaign, CampaignResult } from "@/lib/api"
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  Activity,
  User,
  RefreshCw 
} from "lucide-react"

export type Contact = { name?: string; phone: string }

interface CampaignControlsProps {
  contacts: Contact[]
  message: string
  mediaUrl?: string
}

export default function CampaignControls({ contacts, message, mediaUrl }: CampaignControlsProps) {
  const [loading, setLoading] = useState(false)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "failed">("idle")
  const [results, setResults] = useState<CampaignResult[]>([])
  const [progress, setProgress] = useState({ sent: 0, total: contacts.length })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const startCampaign = async () => {
    setErrorMsg(null)
    if (contacts.length === 0) {
      setErrorMsg("Please add at least 1 contact or upload a CSV file first.")
      return
    }
    if (!message.trim()) {
      setErrorMsg("Please write a message in the Message Editor before starting.")
      return
    }

    setLoading(true)
    setStatus("running")
    setProgress({ sent: 0, total: contacts.length })
    setResults(contacts.map((c) => ({ contact: c, status: "pending" })))

    try {
      const resp = await sendBulk({ contacts, message, mediaUrl })
      if (!resp.campaignId) throw new Error("No campaign ID returned from backend")
      setCampaignId(resp.campaignId)
    } catch (err: any) {
      console.error("Campaign start failed", err)
      const message = err.response?.data?.error || err.message || "Failed to start campaign"
      setErrorMsg(message)
      setLoading(false)
      setStatus("failed")
    }
  }

  // Poll active campaign status
  useEffect(() => {
    if (!campaignId || status !== "running") return

    const pollInterval = setInterval(async () => {
      try {
        const data = await getCampaign(campaignId)
        if (data.results) {
          setResults(data.results)
          const sentCount = data.results.filter((r) => r.status === "sent").length
          setProgress({ sent: sentCount, total: data.results.length })
        }

        if (data.status === "completed" || data.status === "failed") {
          setStatus(data.status)
          setLoading(false)
          clearInterval(pollInterval)
        }
      } catch (err) {
        console.error("Polling error", err)
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [campaignId, status])

  const stats = {
    sent: results.filter((r) => r.status === "sent").length,
    failed: results.filter((r) => r.status === "failed").length,
    unregistered: results.filter((r) => r.status === "unregistered").length,
    pending: results.filter((r) => r.status === "pending").length
  }

  const completedCount = stats.sent + stats.failed + stats.unregistered
  const totalCount = results.length || contacts.length || 1
  const percentComplete = Math.round((completedCount / totalCount) * 100)

  return (
    <Card className="glass-panel mt-4">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-white text-sm sm:text-base font-bold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
                <Activity className="w-4 h-4" />
              </div>
              Campaign Blast Console
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Automated anti-ban throttling with live socket activity logs
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={startCampaign}
              disabled={loading || contacts.length === 0}
              variant="whatsapp"
              size="lg"
              className="w-full sm:w-auto text-xs sm:text-sm h-11 px-6 shadow-glow-emerald"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Transmitting Blast...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Start WhatsApp Blast ({contacts.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Anti-Ban Safety Notice */}
        <div className="flex items-start gap-2.5 p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-amber-200/90 text-xs backdrop-blur-md">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-300 font-bold">Anti-Ban Protection Engine Active:</strong> Random delays (25–45s) simulate human behavior and protect your WhatsApp phone number from spam bans.
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <p className="flex-1 font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Live Progress & Stats */}
        {(status === "running" || status === "completed" || status === "failed") && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-3.5 pt-2"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-200 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  {status === "running" ? "Transmitting Batch Blast..." : status === "completed" ? "Campaign Blast Completed!" : "Blast Stopped"}
                </span>
                <span className="font-mono text-emerald-400 font-bold">{percentComplete}% ({completedCount}/{totalCount})</span>
              </div>
              <Progress value={completedCount} max={totalCount} />
            </div>

            {/* Metrics Chips Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3 text-center shadow-glow-emerald">
                <div className="text-[10px] uppercase font-bold text-emerald-400">Delivered</div>
                <div className="text-xl font-extrabold text-white mt-0.5">{stats.sent}</div>
              </div>

              <div className="bg-slate-950/50 border border-white/10 rounded-2xl p-3 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Pending</div>
                <div className="text-xl font-extrabold text-white mt-0.5">{stats.pending}</div>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-3 text-center">
                <div className="text-[10px] uppercase font-bold text-amber-400">Unregistered</div>
                <div className="text-xl font-extrabold text-white mt-0.5">{stats.unregistered}</div>
              </div>

              <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-3 text-center">
                <div className="text-[10px] uppercase font-bold text-rose-400">Failed</div>
                <div className="text-xl font-extrabold text-white mt-0.5">{stats.failed}</div>
              </div>
            </div>

            {/* Real-Time Delivery Feed */}
            {results.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-300">Live Socket Log Stream:</div>
                <div className="max-h-48 overflow-y-auto rounded-2xl border border-white/[0.08] divide-y divide-white/[0.04] bg-slate-950/50">
                  {results.map((r, i) => (
                    <div key={i} className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-white/[0.03]">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="font-semibold text-slate-200 truncate">{r.contact.name || "Recipient"}</span>
                        <span className="font-mono text-emerald-400/80 text-[11px]">(+{r.contact.phone})</span>
                      </div>

                      <div>
                        {r.status === "sent" && (
                          <Badge variant="success" className="text-[10px] gap-1 py-0">
                            <CheckCircle2 className="w-3 h-3" /> Delivered
                          </Badge>
                        )}
                        {r.status === "pending" && (
                          <Badge variant="secondary" className="text-[10px] gap-1 py-0">
                            <Clock className="w-3 h-3" /> Queued
                          </Badge>
                        )}
                        {r.status === "unregistered" && (
                          <Badge variant="warning" className="text-[10px] gap-1 py-0">
                            <AlertCircle className="w-3 h-3" /> Not on WA
                          </Badge>
                        )}
                        {r.status === "failed" && (
                          <Badge variant="destructive" className="text-[10px] gap-1 py-0">
                            <XCircle className="w-3 h-3" /> Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
