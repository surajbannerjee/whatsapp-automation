# WhatsBlast PRO - WhatsApp Outreach & Automation Platform

An autonomous WhatsApp outreach and lead-generation platform built with **Next.js 14**, **Express**, **Puppeteer / whatsapp-web.js**, and **Serper API**.

---

## ✨ Features

- ⚡ **Direct Single Messaging**: Real-time pre-flight WhatsApp number verification and instant dispatch.
- 🚀 **Bulk Campaign Blast**: Multi-contact CSV upload, throttling & anti-ban delays, customizable variables (`{{name}}`, `{{phone}}`), and media attachments.
- 🗺️ **Local Google Maps Lead Finder**: Search nearby businesses & shops by niche/category and location, auto-extract phone numbers, and import directly into campaign lists.
- 🤖 **Inbound Auto-Reply Engine**: Automated smart "Thank You" responder with 24-hour loop prevention and custom reply templates.
- 📱 **Floating WhatsApp Simulator**: Fixed live preview with hamburger toggle at bottom-right, dynamic template tag substitution, and click-outside close.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, Framer Motion, Lucide Icons, Axios, PapaParse.
- **Backend**: Node.js, Express, `whatsapp-web.js`, Puppeteer, Multer, Axios.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:4000`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

---

## 🔒 Security
Sensitive credentials (`.env`), WhatsApp session tokens (`.wwebjs_auth`), and uploaded media are excluded via `.gitignore`.
