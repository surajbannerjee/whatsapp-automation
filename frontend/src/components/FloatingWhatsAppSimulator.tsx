"use client"
import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Smartphone, Sparkles, ShieldCheck } from "lucide-react"
import WhatsAppPreview from "./WhatsAppPreview"

interface FloatingWhatsAppSimulatorProps {
  message: string
  mediaUrl?: string
  sampleName?: string
}

export default function FloatingWhatsAppSimulator({
  message,
  mediaUrl,
  sampleName = "John Doe"
}: FloatingWhatsAppSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Handle outside click to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      {/* Fixed Hamburger Trigger Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-xl shadow-2xl pointer-events-none"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Simulator</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          ref={buttonRef}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close WhatsApp Simulator" : "Open WhatsApp Simulator"}
          className={`relative group p-4 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl border cursor-pointer ${
            isOpen
              ? "bg-slate-900 text-white border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.8)]"
              : "bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-slate-950 border-emerald-300/40 shadow-glow-emerald"
          }`}
        >
          {/* Ambient Glow */}
          <span className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition-opacity duration-300 -z-10" />

          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.5] text-slate-200" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1">
              <Menu className="w-6 h-6 stroke-[2.5]" />
              <span className="sr-only">Toggle WhatsApp Simulator</span>
            </div>
          )}

          {/* Unread / Live Indicator Dot */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-slate-950" />
            </span>
          )}
        </motion.button>
      </div>

      {/* Floating Simulator Popover / Modal with Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Subtle Click-Outside Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-[3px] z-40"
            />

            {/* Fixed Popup Panel at Bottom Right */}
            <motion.div
              ref={popupRef}
              initial={{ opacity: 0, scale: 0.9, y: 30, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30, x: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-4 sm:right-6 z-50 w-[95vw] sm:w-[390px] max-h-[85vh] overflow-y-auto rounded-3xl bg-slate-950/95 border border-emerald-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-4 flex flex-col items-center"
            >
              {/* Header inside popup */}
              <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] px-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                      Live WhatsApp Simulator
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Real-time template & media rendering</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-white/10 transition-colors cursor-pointer"
                  title="Close Simulator"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* The Live Phone Simulator */}
              <div className="w-full flex justify-center py-1">
                <WhatsAppPreview
                  message={message}
                  mediaUrl={mediaUrl}
                  sampleName={sampleName}
                />
              </div>

              {/* Footer Note */}
              <div className="w-full mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400 px-2">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" /> Auto-synced
                </span>
                <span>Click outside or press Esc to close</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
