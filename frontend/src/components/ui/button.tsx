import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "whatsapp" | "glow" | "subtle"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98] cursor-pointer"
    
    const variants = {
      default: "bg-white text-zinc-950 shadow-sm hover:bg-zinc-200 hover:shadow-md",
      destructive: "bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 hover:border-rose-500/50 shadow-xs",
      outline: "border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-slate-200 shadow-xs backdrop-blur-md",
      secondary: "bg-slate-800/70 text-slate-200 hover:bg-slate-700/80 border border-white/5",
      ghost: "hover:bg-white/[0.06] hover:text-white text-slate-400",
      link: "text-emerald-400 underline-offset-4 hover:underline",
      whatsapp: "bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 text-white font-semibold shadow-glow-emerald hover:shadow-glow-emerald-lg hover:from-emerald-400 hover:to-teal-400 border border-emerald-400/30",
      glow: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-glow-emerald hover:bg-emerald-500/20 hover:border-emerald-500/50",
      subtle: "bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-500/20"
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-xl px-6 text-base font-semibold",
      icon: "h-9 w-9 p-0 rounded-lg"
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
