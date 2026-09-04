"use client"
import React from "react"
import { motion } from "framer-motion"
import { Smartphone, CheckCheck, FileText, User, MoreVertical, Phone, Video, ShieldCheck } from "lucide-react"

interface WhatsAppPreviewProps {
  message: string
  mediaUrl?: string
  sampleName?: string
}

export default function WhatsAppPreview({ message, mediaUrl, sampleName = "John Doe" }: WhatsAppPreviewProps) {
  const currentTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  }).format(new Date())

  // Replace variable tags for simulation
  const previewMessage = (message || "Type your message in the editor...")
    .replace(/\{\{\s*name\s*\}\}/gi, sampleName)
    .replace(/\{\s*name\s*\}/gi, sampleName)
    .replace(/\{\{\s*phone\s*\}\}/gi, "+91 98765 43210")
    .replace(/\{\s*phone\s*\}/gi, "+91 98765 43210")

  const isPdf = mediaUrl?.toLowerCase().endsWith(".pdf") || mediaUrl?.includes("pdf")

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col items-center"
    >
      {/* High-End Dark Smartphone Mockup Frame */}
      <div className="w-full max-w-[340px] rounded-[42px] bg-slate-950/90 p-3 shadow-2xl border-2 border-white/[0.12] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative group backdrop-blur-2xl">
        {/* Subtle Ambient Glow Behind Phone */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-[44px] blur-xl -z-10 group-hover:from-emerald-500/20 group-hover:to-teal-500/20 transition-all duration-500" />

        {/* Dynamic Island Notch */}
        <div className="mx-auto h-4 w-28 rounded-full bg-black mb-2.5 flex items-center justify-center border border-white/5">
          <div className="h-2 w-2 rounded-full bg-slate-900 mr-2" />
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
        </div>

        {/* Phone Screen: Dark Mode WhatsApp Theme */}
        <div className="rounded-[30px] overflow-hidden bg-[#0B141A] h-[480px] flex flex-col justify-between relative border border-white/[0.08]">
          {/* WhatsApp Header (Dark) */}
          <div className="bg-[#1F2C34] text-white px-3.5 py-3 flex items-center justify-between border-b border-white/[0.06] shadow-sm z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-emerald-500/30">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold leading-tight flex items-center gap-1 text-slate-100">
                  {sampleName}
                </div>
                <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> online
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-400">
              <Video className="w-3.5 h-3.5 hover:text-white transition-colors" />
              <Phone className="w-3.5 h-3.5 hover:text-white transition-colors" />
              <MoreVertical className="w-3.5 h-3.5 hover:text-white transition-colors" />
            </div>
          </div>

          {/* Chat Background & Message Bubbles */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 flex flex-col justify-end bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:16px_16px]">
            {/* Timestamp date pill */}
            <div className="mx-auto bg-[#182229]/80 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] text-slate-400 font-medium border border-white/5 shadow-xs">
              Today
            </div>

            {/* WhatsApp Outgoing Bubble (Dark Emerald) */}
            <motion.div 
              layout
              className="self-end max-w-[88%] bg-[#005C4B] text-slate-100 rounded-2xl rounded-tr-xs p-3 shadow-lg border border-emerald-400/20 space-y-2 shadow-emerald-950/40"
            >
              {/* Media Preview inside bubble */}
              {mediaUrl && (
                <div className="rounded-xl overflow-hidden bg-black/40 border border-white/10">
                  {isPdf ? (
                    <div className="flex items-center gap-2.5 p-2.5 bg-[#1F2C34]/80 text-slate-200">
                      <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                        <FileText className="w-5 h-5 flex-shrink-0" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[11px] font-semibold text-white truncate">Document Attachment</p>
                        <p className="text-[9px] text-slate-400">PDF Document</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative aspect-video bg-black/60 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl}
                        alt="Media attachment"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none"
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Message text */}
              <p className="text-xs text-slate-100 whitespace-pre-wrap break-words leading-relaxed font-normal">
                {previewMessage}
              </p>

              {/* Bubble timestamp & ticks */}
              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/70 pt-0.5 font-medium">
                <span>{currentTime}</span>
                <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
              </div>
            </motion.div>
          </div>

          {/* WhatsApp Chat Input Bar Footer */}
          <div className="bg-[#1F2C34] px-2.5 py-2 flex items-center gap-2 border-t border-white/[0.06] text-slate-400">
            <div className="flex-1 bg-[#2A3942] rounded-full px-3.5 py-1.5 text-[11px] text-slate-400 border border-white/5">
              Message
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shadow-glow-emerald">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Live simulation reflects tags like <code className="text-emerald-300 font-mono text-[11px]">{"{{name}}"}</code></span>
      </div>
    </motion.div>
  )
}
