"use client"
import React, { useRef, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { CATEGORY_TEMPLATES } from "@/config/categoryTemplates"
import { 
  MessageSquare, 
  Sparkles, 
  User, 
  Phone, 
  Layers,
  ChevronDown,
  RotateCcw
} from "lucide-react"

interface MessageEditorProps {
  value: string
  onChange: (val: string) => void
  selectedCategory?: string
}

export default function MessageEditor({ value, onChange, selectedCategory }: MessageEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>(selectedCategory || "Cake Shop")

  const insertVariable = (tag: string) => {
    if (!textareaRef.current) {
      onChange(value + tag)
      return
    }

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const newValue = value.substring(0, start) + tag + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(start + tag.length, start + tag.length)
      }
    }, 0)
  }

  const handleApplyTemplate = (categoryName: string) => {
    setActiveCategoryTab(categoryName)
    const templateText = CATEGORY_TEMPLATES[categoryName] || CATEGORY_TEMPLATES["Universal"]
    onChange(templateText)
  }

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0

  return (
    <Card className="glass-panel">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm sm:text-base font-bold flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
              <MessageSquare className="w-4 h-4" />
            </div>
            WhatsApp Message Composer
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[11px] font-mono border-white/10 bg-black/40">
              {value.length} chars • {wordCount} words
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs text-slate-400">
          Personalize dynamically with variable chips and category-tailored outreach templates
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Niche Outreach Template Switcher Chips */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" /> Niche Outreach Templates:
            </span>
            <button
              type="button"
              onClick={() => handleApplyTemplate("Universal")}
              className="text-[10px] text-slate-500 hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Universal Fallback
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Object.keys(CATEGORY_TEMPLATES).map((catName) => (
              <button
                key={catName}
                type="button"
                onClick={() => handleApplyTemplate(catName)}
                className={`text-xs py-1 px-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  activeCategoryTab === catName
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold shadow-glow-emerald"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                {catName}
              </button>
            ))}
          </div>
        </div>

        {/* Variable Insertion Chips */}
        <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-950/70 rounded-2xl border border-white/[0.08] shadow-inner-light">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Insert Variable:
          </span>
          <button
            type="button"
            onClick={() => insertVariable("{{name}}")}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-slate-200 text-xs font-medium hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-emerald-500/10 hover:shadow-glow-emerald transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" /> {"{{name}}"}
          </button>
          <button
            type="button"
            onClick={() => insertVariable("{{phone}}")}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-slate-200 text-xs font-medium hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-emerald-500/10 hover:shadow-glow-emerald transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" /> {"{{phone}}"}
          </button>
        </div>

        {/* Text Area */}
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Hello Team {{name}}!..."
          className="min-h-[160px] text-xs sm:text-sm font-sans leading-relaxed"
        />
      </CardContent>
    </Card>
  )
}
