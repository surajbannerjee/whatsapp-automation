"use client"
import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { verifyNumber, sendSingleMessage, getWhatsAppStatus } from "@/lib/api"
import { 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  User, 
  Phone, 
  CheckCircle, 
  Zap
} from "lucide-react"

interface SingleMessageSenderProps {
  message: string
  mediaUrl?: string
  recipientName: string
  onRecipientNameChange: (name: string) => void
  onPhoneChange?: (phone: string) => void
}

type VerificationStatus = "idle" | "checking" | "verified" | "not_registered" | "error" | "skipped"

export default function SingleMessageSender({
  message,
  mediaUrl,
  recipientName,
  onRecipientNameChange,
  onPhoneChange
}: SingleMessageSenderProps) {
  const [phone, setPhone] = useState("")
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("idle")
  const [formattedPhone, setFormattedPhone] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [successInfo, setSuccessInfo] = useState<{ messageId: string; timestamp: number } | null>(null)
  const [isClientConnected, setIsClientConnected] = useState(true)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Check client connection status periodically
  useEffect(() => {
    const checkClient = async () => {
      try {
        const s = await getWhatsAppStatus()
        setIsClientConnected(Boolean(s.isReady || s.status === "ready" || s.status === "authenticated"))
      } catch {
        setIsClientConnected(false)
      }
    }
    checkClient()
  }, [])

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setPhone(val)
    onPhoneChange?.(val)
    setSuccessInfo(null)
    setErrorMessage(null)

    // Reset verification if user changes phone
    setVerificationStatus("idle")
    setFormattedPhone(null)

    // Debounce verification check
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    const digitsOnly = val.replace(/\D/g, "")
    if (digitsOnly.length >= 10) {
      debounceTimerRef.current = setTimeout(() => {
        performVerification(val)
      }, 700)
    }
  }

  const performVerification = async (numberToVerify = phone) => {
    if (!numberToVerify.trim()) {
      setErrorMessage("Please enter a phone number to verify")
      return
    }

    const digits = numberToVerify.replace(/\D/g, "")
    if (digits.length < 7) {
      setErrorMessage("Phone number must contain at least 7 digits")
      return
    }

    setVerificationStatus("checking")
    setErrorMessage(null)
    setSuccessInfo(null)

    try {
      const res = await verifyNumber(numberToVerify)
      if (res.registered) {
        setVerificationStatus("verified")
        setFormattedPhone(res.formattedPhone)
      } else {
        setVerificationStatus("not_registered")
        setFormattedPhone(res.formattedPhone || null)
      }
    } catch (err: any) {
      console.warn("Verification warning:", err)
      setVerificationStatus("skipped")
      setErrorMessage(
        err.message?.includes("timeout")
          ? "Server response took long. You can still send the message directly."
          : (err.response?.data?.error || err.message || "Could not verify number")
      )
    }
  }

  const handleSend = async () => {
    if (!phone.trim()) {
      setErrorMessage("Please enter a recipient phone number")
      return
    }
    if (!message.trim()) {
      setErrorMessage("Please write a message before sending")
      return
    }

    setSending(true)
    setErrorMessage(null)
    setSuccessInfo(null)

    try {
      // Personalize message for single recipient
      const personalizedMsg = message
        .replace(/\{\{\s*name\s*\}\}/gi, recipientName.trim() || "there")
        .replace(/\{\s*name\s*\}/gi, recipientName.trim() || "there")
        .replace(/\{\{\s*phone\s*\}\}/gi, phone.trim())
        .replace(/\{\s*phone\s*\}/gi, phone.trim())

      const res = await sendSingleMessage({
        phone: phone.trim(),
        message: personalizedMsg,
        mediaUrl
      })

      if (res.success) {
        setSuccessInfo({
          messageId: res.messageId,
          timestamp: res.timestamp
        })
        setVerificationStatus("verified")
      }
    } catch (err: any) {
      console.error("Failed to send single message:", err)
      setErrorMessage(err.response?.data?.error || err.message || "Failed to dispatch message")
    } finally {
      setSending(false)
    }
  }

  const isSendDisabled =
    !phone.trim() ||
    !message.trim() ||
    sending ||
    verificationStatus === "not_registered"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-panel">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-white text-base font-bold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
                  <Zap className="w-4 h-4" />
                </div>
                Direct Single Dispatch
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Pre-flight number verification with real-time WhatsApp validation
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Recipient Information Form */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Recipient Name */}
            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" /> Recipient Name
              </label>
              <Input
                value={recipientName}
                onChange={(e) => onRecipientNameChange(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="text-xs h-10"
              />
              <p className="text-[10px] text-slate-500">Replaces <code className="text-emerald-400 font-mono">{"{{name}}"}</code> in text</p>
            </div>

            {/* Phone Number with Real-Time Verify Button */}
            <div className="sm:col-span-7 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp Number
                </span>
                <span className="text-[10px] text-slate-500 font-normal">Country Code included</span>
              </label>

              <div className="flex gap-2">
                <Input
                  value={phone}
                  onChange={handlePhoneInputChange}
                  placeholder="e.g. 919876543210 or +91 98765-43210"
                  className="text-xs h-10 font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => performVerification()}
                  disabled={verificationStatus === "checking" || !phone.trim()}
                  className="h-10 px-3.5 text-xs flex-shrink-0"
                >
                  {verificationStatus === "checking" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>

              {/* Verification Status Pill */}
              <div className="pt-0.5">
                {verificationStatus === "idle" && (
                  <p className="text-[11px] text-slate-500">
                    Type 10+ digits for validation or click Send directly
                  </p>
                )}

                {verificationStatus === "checking" && (
                  <div className="flex items-center gap-1.5 text-[11px] text-sky-400 font-semibold animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Checking WhatsApp registry...
                  </div>
                )}

                {verificationStatus === "verified" && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30 shadow-glow-emerald animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Active on WhatsApp (+{formattedPhone || phone})</span>
                  </div>
                )}

                {verificationStatus === "not_registered" && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-300 font-semibold bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/30 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span>Number is not registered on WhatsApp</span>
                  </div>
                )}

                {(verificationStatus === "error" || verificationStatus === "skipped") && errorMessage && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/30 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Success Alert Banner */}
          {successInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl flex items-start gap-3 shadow-glow-emerald"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold shadow-glow-emerald">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 flex-1">
                <h4 className="text-xs font-bold text-white">Direct Message Dispatched!</h4>
                <p className="text-[11px] text-emerald-300/80">
                  Delivered to <strong>{phone}</strong> at {new Date(successInfo.timestamp).toLocaleTimeString()}.
                </p>
                <p className="text-[10px] text-emerald-400 font-mono truncate max-w-sm">
                  ID: {successInfo.messageId}
                </p>
              </div>
            </motion.div>
          )}

          {/* Dispatch Action Bar */}
          <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              {verificationStatus === "verified" ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Ready for instant delivery
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" /> Direct dispatch enabled
                </span>
              )}
            </div>

            <Button
              onClick={handleSend}
              disabled={isSendDisabled}
              isLoading={sending}
              variant="whatsapp"
              size="lg"
              className="w-full sm:w-auto text-xs sm:text-sm h-11 px-6"
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? "Transmitting Message..." : "Send Direct Message"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
