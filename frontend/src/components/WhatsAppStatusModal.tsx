"use client"
import React, { useEffect, useState, useCallback } from "react"
import { getWhatsAppStatus, reconnectWhatsApp, logoutWhatsApp, WhatsAppStatus } from "@/lib/api"
import { QRCodeSVG } from "qrcode.react"
import { Dialog } from "./ui/dialog"
import { Button } from "./ui/button"
import { 
  CheckCircle2, 
  QrCode, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck, 
  Wifi, 
  WifiOff,
  LogOut,
  AlertTriangle
} from "lucide-react"

export default function WhatsAppStatusModal() {
  const [statusData, setStatusData] = useState<WhatsAppStatus | null>(null)
  const [manualLoading, setManualLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Silent background fetch that does not trigger button loading spinner
  const fetchStatus = useCallback(async () => {
    try {
      const data = await getWhatsAppStatus()
      setStatusData((prev) => {
        if (
          prev?.status === data.status &&
          prev?.isReady === data.isReady &&
          prev?.qr === data.qr &&
          prev?.error === data.error &&
          prev?.user === data.user
        ) {
          return prev
        }
        return data
      })
    } catch (err) {
      console.error("Failed to fetch WhatsApp status", err)
    }
  }, [])

  // Manual refresh triggered by user clicking button
  const handleManualRefresh = async () => {
    try {
      setManualLoading(true)
      await fetchStatus()
    } finally {
      setTimeout(() => setManualLoading(false), 500)
    }
  }

  // Force reconnect / regenerate QR
  const handleReconnect = async () => {
    try {
      setActionLoading(true)
      await reconnectWhatsApp()
      await fetchStatus()
    } catch (err) {
      console.error("Reconnect error", err)
    } finally {
      setTimeout(() => setActionLoading(false), 800)
    }
  }

  // Logout / Unlink current session
  const handleLogout = async () => {
    if (!confirm("Are you sure you want to disconnect this WhatsApp account?")) return
    try {
      setActionLoading(true)
      await logoutWhatsApp()
      await fetchStatus()
    } catch (err) {
      console.error("Logout error", err)
    } finally {
      setTimeout(() => setActionLoading(false), 800)
    }
  }

  const isReady = Boolean(statusData?.isReady || statusData?.status === "ready" || statusData?.status === "authenticated")
  const isQrReady = !isReady && statusData?.status === "qr_ready" && !!statusData?.qr
  const isError = statusData?.status === "error" || statusData?.status === "auth_failure"

  useEffect(() => {
    fetchStatus()
    // If already connected, slow down polling to 8s. If waiting for QR or open, poll every 2s.
    const pollIntervalMs = isReady ? 8000 : isOpen ? 2000 : 3500
    const interval = setInterval(fetchStatus, pollIntervalMs)
    return () => clearInterval(interval)
  }, [isReady, isOpen, fetchStatus])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-slate-900/60 backdrop-blur-xl shadow-xs hover:border-emerald-500/40 hover:bg-slate-800/60 hover:shadow-glow-emerald transition-all duration-300 group cursor-pointer"
      >
        <span className="relative flex h-2.5 w-2.5">
          {isReady ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-glow-emerald"></span>
            </>
          ) : isQrReady ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </>
          ) : isError ? (
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
          ) : (
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500 animate-pulse"></span>
          )}
        </span>

        <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
          {isReady 
            ? `Online ${statusData?.user ? `(+${statusData.user})` : ''}` 
            : isQrReady 
            ? "Pair Device (QR Ready)" 
            : isError
            ? "Connection Issue"
            : "Starting Engine..."}
        </span>

        <QrCode className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="max-w-md p-6"
        title={
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">WhatsApp Scanner</h2>
              <p className="text-xs text-slate-400">Scan QR with your phone to connect</p>
            </div>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          {isReady ? (
            <div className="text-center py-6 px-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl backdrop-blur-xl shadow-glow-emerald">
              <div className="w-12 h-12 bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-glow-emerald">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-bold text-white">WhatsApp Account Linked!</h3>
              {statusData?.user && (
                <p className="text-xs text-emerald-400 font-mono font-medium mt-1">
                  Connected Number: +{statusData.user}
                </p>
              )}
              <p className="text-xs text-emerald-300/80 mt-1 max-w-xs mx-auto leading-relaxed">
                Your WhatsApp Web session is authenticated. You can now dispatch single messages, auto-replies, and bulk campaigns.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded-full border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Session: LocalAuth Active
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-500/20 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  isLoading={actionLoading}
                  className="gap-1.5 text-xs h-8 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                >
                  <LogOut className="w-3.5 h-3.5" /> Disconnect Account
                </Button>
              </div>
            </div>
          ) : isQrReady && statusData?.qr ? (
            <div className="flex flex-col items-center space-y-3.5">
              {/* QR Code Frame */}
              <div className="p-3.5 bg-white rounded-2xl border-2 border-emerald-400/40 shadow-glow-emerald flex items-center justify-center">
                <QRCodeSVG
                  value={statusData.qr}
                  size={180}
                  level="M"
                  includeMargin={false}
                />
              </div>

              {/* Step by Step Guide */}
              <div className="w-full bg-slate-950/70 rounded-2xl p-3.5 text-xs text-slate-300 space-y-1.5 border border-white/[0.08] backdrop-blur-md">
                <div className="font-semibold text-emerald-400 flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> How to pair device:
                </div>
                <div className="space-y-1 text-slate-300 text-[11px] leading-relaxed pl-1">
                  <p>1. Open WhatsApp on your phone</p>
                  <p>2. Tap <strong>Menu (⋮)</strong> or <strong>Settings → Linked Devices</strong></p>
                  <p>3. Tap <strong>Link a Device</strong> and point your camera here</p>
                </div>
              </div>
            </div>
          ) : isError ? (
            <div className="text-center py-6 px-4 bg-rose-950/30 rounded-2xl border border-rose-500/30">
              <AlertTriangle className="w-7 h-7 text-rose-400 mx-auto mb-2.5" />
              <h3 className="text-xs font-semibold text-white">Connection Error</h3>
              <p className="text-[11px] text-rose-300/90 mt-1 max-w-xs mx-auto">
                {statusData?.error || "WhatsApp engine failed to start or pair. Click below to reconnect."}
              </p>
              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={handleReconnect}
                  isLoading={actionLoading}
                  className="gap-1.5 text-xs h-8 bg-rose-600 hover:bg-rose-500 text-white"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Restart & Reconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-7 px-4 bg-slate-950/60 rounded-2xl border border-white/[0.08]">
              <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin mx-auto mb-2.5" />
              <h3 className="text-xs font-semibold text-white">Starting WhatsApp Engine...</h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                {statusData?.status === "initializing" 
                  ? "Launching Chromium engine and connecting to WhatsApp socket. Please wait..."
                  : "Connecting to WhatsApp socket engine. Please wait a moment."}
              </p>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-1.5 text-xs">
              {isReady ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                  <Wifi className="w-3.5 h-3.5" /> Socket Online
                </span>
              ) : isQrReady ? (
                <span className="flex items-center gap-1 text-amber-400 font-semibold text-xs">
                  <Wifi className="w-3.5 h-3.5" /> QR Code Ready
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sky-400 font-semibold text-xs">
                  <WifiOff className="w-3.5 h-3.5" /> Initializing...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnect}
                isLoading={actionLoading}
                className="gap-1 text-xs h-8 border-white/10 px-2.5 text-slate-300 hover:text-white"
                title="Restart WhatsApp Engine"
              >
                <RefreshCw className="w-3 h-3" /> Reset Session
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                isLoading={manualLoading}
                className="gap-1 text-xs h-8 border-white/10 px-3"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  )
}
