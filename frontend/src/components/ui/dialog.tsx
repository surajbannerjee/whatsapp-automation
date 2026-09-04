"use client"
import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className
}: {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !mounted) return null

  const modalElement = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 w-screen h-screen">
      {/* Full-Screen Dark Frosted Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog Body - Dead Centered on Screen */}
      <div
        className={cn(
          "relative z-[10000] w-full max-w-[90dvw] rounded-3xl bg-[#111420] p-6 sm:p-7 shadow-2xl border border-white/[0.12] transition-all duration-200 shadow-glow-emerald max-h-[90vh] overflow-y-auto text-left",
          className
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer z-20"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        {title && (
          <div className="mb-4 pr-8">
            <div className="text-base sm:text-lg font-bold text-white">{title}</div>
            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          </div>
        )}

        {children}
      </div>
    </div>
  )

  return createPortal(modalElement, document.body)
}
