import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GlobeNews Live | Real-Time Global Intelligence',
  description: 'Real-time conflict monitoring, military activity tracking, and geopolitical intelligence. Iran war coverage, flight radar, ship tracking, and 54+ news sources.',
  keywords: 'OSINT, intelligence, conflict, military, geopolitical, Iran, Israel, war, real-time, news, global',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'GlobeNews Live',
    description: 'Real-time global conflict intelligence dashboard - Iran war coverage, flight radar, ship tracking',
    type: 'website',
    url: 'https://globenews.live',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobeNews Live',
    description: 'Real-time global intelligence dashboard',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-void text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
