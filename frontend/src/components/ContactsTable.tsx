"use client"
import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { 
  Users, 
  Search, 
  UserPlus, 
  Trash2, 
  Phone, 
  Check, 
  AlertCircle,
  X 
} from "lucide-react"

export type Contact = { name?: string; phone: string }

interface ContactsTableProps {
  contacts: Contact[]
  onChange: (contacts: Contact[]) => void
}

export default function ContactsTable({ contacts, onChange }: ContactsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault()
    setAddError(null)

    if (!newPhone.trim()) {
      setAddError("Phone number is required")
      return
    }

    const cleanPhone = newPhone.replace(/\D/g, "")
    if (cleanPhone.length < 7) {
      setAddError("Please enter a valid phone number with digits")
      return
    }

    const newContact: Contact = {
      name: newName.trim() || undefined,
      phone: newPhone.trim()
    }

    onChange([newContact, ...contacts])
    setNewName("")
    setNewPhone("")
    setShowAddForm(false)
  }

  const handleRemove = (index: number) => {
    const updated = [...contacts]
    updated.splice(index, 1)
    onChange(updated)
  }

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to remove all contacts from this campaign?")) {
      onChange([])
    }
  }

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    )
  })

  return (
    <Card className="glass-panel mt-4">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-white text-sm sm:text-base font-bold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-glow-emerald">
                <Users className="w-4 h-4" />
              </div>
              Recipients Directory
              <Badge variant="glow" className="ml-2 text-xs font-semibold py-0.5">
                {contacts.length} Total
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Manage campaign recipients, add single numbers, or filter entries
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs h-8 gap-1.5 border-white/10"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              {showAddForm ? "Cancel" : "Add Number"}
            </Button>

            {contacts.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-xs h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Quick Add Form Drawer */}
        {showAddForm && (
          <form
            onSubmit={handleAddContact}
            className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl space-y-3 animate-in fade-in shadow-glow-emerald"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" /> Quick Add Single Contact
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input
                placeholder="Full Name (e.g. John Doe)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-xs h-9 bg-slate-900/80"
              />
              <Input
                placeholder="Phone (e.g. 919876543210)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="text-xs h-9 bg-slate-900/80"
                required
              />
            </div>

            {addError && (
              <p className="text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {addError}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="whatsapp"
                size="sm"
                className="text-xs h-8 gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save Contact
              </Button>
            </div>
          </form>
        )}

        {/* Search Filter */}
        {contacts.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter recipients by name or phone number..."
              className="pl-9.5 text-xs h-9 bg-slate-950/70"
            />
          </div>
        )}

        {/* Table Container */}
        {contacts.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-950/40 rounded-2xl border border-dashed border-white/10">
            <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No contacts loaded yet</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Upload a CSV file above or use &quot;Add Number&quot; for instant testing
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-slate-950/40">
            <div className="max-h-60 overflow-y-auto divide-y divide-white/[0.05]">
              <div className="bg-slate-950/90 backdrop-blur sticky top-0 grid grid-cols-12 px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-white/[0.08]">
                <div className="col-span-5">Name</div>
                <div className="col-span-5">Phone Number</div>
                <div className="col-span-2 text-right">Action</div>
              </div>

              {filteredContacts.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  No matching contacts found for &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredContacts.map((c, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-12 px-4 py-2.5 items-center text-xs hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="col-span-5 font-semibold text-slate-200 truncate pr-2">
                      {c.name || <span className="text-slate-500 italic font-normal">No name</span>}
                    </div>
                    <div className="col-span-5 font-mono text-emerald-400 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-emerald-500/70" />
                      +{c.phone}
                    </div>
                    <div className="col-span-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(i)}
                        className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
