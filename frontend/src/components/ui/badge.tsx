import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "emerald" | "glow"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-white/10 bg-slate-800/80 text-white",
    secondary: "border-white/5 bg-white/[0.04] text-slate-300",
    destructive: "border-rose-500/30 bg-rose-500/10 text-rose-400 font-medium shadow-[0_0_10px_rgba(244,63,94,0.15)]",
    outline: "text-slate-300 border-white/10 bg-black/20",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium shadow-[0_0_10px_rgba(245,158,11,0.15)]",
    info: "border-sky-500/30 bg-sky-500/10 text-sky-400 font-medium shadow-[0_0_10px_rgba(14,165,233,0.15)]",
    emerald: "border-emerald-400/40 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-glow-emerald",
    glow: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] animate-pulse"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
