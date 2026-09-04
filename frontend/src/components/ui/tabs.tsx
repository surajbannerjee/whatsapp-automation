import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
  value: string
  onValueChange: (val: string) => void
}

const TabsContext = React.createContext<TabsContextType | null>(null)

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  children,
  className
}: {
  value?: string
  defaultValue?: string
  onValueChange?: (val: string) => void
  children: React.ReactNode
  className?: string
}) {
  const [currentValue, setCurrentValue] = React.useState(value || defaultValue || "")

  const activeValue = value !== undefined ? value : currentValue
  const handleValueChange = (newVal: string) => {
    if (value === undefined) setCurrentValue(newVal)
    onValueChange?.(newVal)
  }

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-xl bg-slate-950/80 p-1 text-slate-400 w-full border border-white/[0.08] shadow-inner-light backdrop-blur-md",
        className
      )}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled
}: {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("TabsTrigger must be within Tabs")

  const isActive = ctx.value === value

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => ctx.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40 flex-1 gap-1.5 cursor-pointer",
        isActive
          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 font-semibold border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({
  value,
  children,
  className
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("TabsContent must be within Tabs")

  if (ctx.value !== value) return null

  return (
    <div className={cn("mt-3 focus-visible:outline-none animate-in fade-in-50 duration-300", className)}>
      {children}
    </div>
  )
}
