import axios from 'axios'

export const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

export interface WhatsAppStatus {
  status: 'initializing' | 'qr_ready' | 'authenticated' | 'ready' | 'disconnected' | 'auth_failure' | 'error'
  qr: string | null
  isReady: boolean
  error?: string | null
  user?: string | null
  pushname?: string | null
}

export interface CampaignResult {
  contact: { name?: string; phone: string }
  status: 'pending' | 'sent' | 'failed' | 'unregistered'
  error?: string
}

export interface CampaignData {
  id: string
  status: 'running' | 'completed' | 'failed'
  contacts: Array<{ name?: string; phone: string }>
  results: CampaignResult[]
  createdAt: number
}

export interface VerifyNumberResponse {
  success: boolean
  registered: boolean
  formattedPhone: string
  error?: string
}

export interface SendSingleResponse {
  success: boolean
  messageId: string
  timestamp: number
  error?: string
}

export interface AutoReplyConfig {
  enabled: boolean
  template: string
  cooldownHours: number
}

export interface AutoReplyLog {
  id: string
  sender: string
  phone: string
  timestamp: number
  incomingSnippet: string
}

export interface AutoReplyStatsResponse {
  config: AutoReplyConfig
  activeCooldownsCount: number
  totalRepliesTriggered: number
  recentLogs: AutoReplyLog[]
}

export interface LeadItem {
  id: string
  name: string
  phone: string
  rawPhone: string
  rating: number | null
  reviews: number
  address: string
  category?: string
  website?: string | null
}

export interface SearchLeadsResponse {
  success: boolean
  query: string
  totalFound: number
  leadsWithPhone: number
  leads: LeadItem[]
  error?: string
}

export async function getWhatsAppStatus(): Promise<WhatsAppStatus> {
  const url = `${BACKEND_BASE_URL}/api/status`
  const res = await axios.get(url, { timeout: 15000 })
  return res.data
}

export async function reconnectWhatsApp(): Promise<{ success: boolean; message: string }> {
  const url = `${BACKEND_BASE_URL}/api/reconnect`
  const res = await axios.post(url, {}, { timeout: 15000 })
  return res.data
}

export async function logoutWhatsApp(): Promise<{ success: boolean; message: string }> {
  const url = `${BACKEND_BASE_URL}/api/logout`
  const res = await axios.post(url, {}, { timeout: 15000 })
  return res.data
}

export async function verifyNumber(phone: string): Promise<VerifyNumberResponse> {
  const url = `${BACKEND_BASE_URL}/api/verify-number`
  const res = await axios.post(url, { phone }, { timeout: 25000 })
  return res.data
}

export async function sendSingleMessage(payload: {
  phone: string
  message: string
  mediaUrl?: string
}): Promise<SendSingleResponse> {
  const url = `${BACKEND_BASE_URL}/api/send-single`
  const res = await axios.post(url, payload, { timeout: 30000 })
  return res.data
}

export async function sendBulk(payload: {
  contacts: Array<{ name?: string; phone: string }>
  message: string
  mediaUrl?: string
}): Promise<{ campaignId: string }> {
  const url = `${BACKEND_BASE_URL}/api/send-bulk`
  const res = await axios.post(url, payload, { timeout: 0 })
  return res.data
}

export async function uploadMedia(file: File): Promise<{ url: string }> {
  const url = `${BACKEND_BASE_URL}/api/upload-media`
  const fd = new FormData()
  fd.append('file', file)
  const res = await axios.post(url, fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function getCampaign(id: string): Promise<CampaignData> {
  const url = `${BACKEND_BASE_URL}/api/campaigns/${id}`
  const res = await axios.get(url, { timeout: 15000 })
  return res.data
}

export async function getAutoReplyStats(): Promise<AutoReplyStatsResponse> {
  const url = `${BACKEND_BASE_URL}/api/auto-reply/config`
  const res = await axios.get(url, { timeout: 15000 })
  return res.data
}

export async function updateAutoReplyConfig(updates: Partial<AutoReplyConfig>): Promise<{ success: boolean; config: AutoReplyConfig }> {
  const url = `${BACKEND_BASE_URL}/api/auto-reply/config`
  const res = await axios.post(url, updates, { timeout: 15000 })
  return res.data
}

export async function clearAutoReplyCooldowns(): Promise<{ success: boolean; clearedCount: number }> {
  const url = `${BACKEND_BASE_URL}/api/auto-reply/clear-history`
  const res = await axios.post(url, {}, { timeout: 15000 })
  return res.data
}

export async function searchLeads(category: string, location: string, apiKey?: string): Promise<SearchLeadsResponse> {
  const url = `${BACKEND_BASE_URL}/api/leads/search`
  const res = await axios.post(url, { category, location, apiKey }, { timeout: 30000 })
  return res.data
}

export async function exportLeadsCsv(leads: LeadItem[]): Promise<Blob> {
  const url = `${BACKEND_BASE_URL}/api/leads/export-csv`
  const res = await axios.post(url, { leads }, { responseType: 'blob' })
  return res.data
}
