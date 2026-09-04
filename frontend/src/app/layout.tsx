import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WhatsBlast PRO - WhatsApp Automation & Campaign Manager',
  description: 'Enterprise WhatsApp bulk messaging and marketing automation platform with real-time tracking.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-[#090A0F] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white dark">
        {children}
      </body>
    </html>
  )
}
