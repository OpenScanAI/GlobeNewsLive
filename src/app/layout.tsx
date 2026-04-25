import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Geist } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-geist',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GlobeNews Live | Real-Time Global Intelligence',
  description: 'Real-time conflict monitoring, military activity tracking, and geopolitical intelligence.',
  keywords: 'OSINT, intelligence, conflict, military, geopolitical, Iran, Israel, war, real-time, news, global',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg', apple: '/favicon.svg' },
  openGraph: {
    title: 'GlobeNews Live',
    description: 'Real-time global conflict intelligence dashboard',
    type: 'website',
    url: 'https://globenews.live',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlobeNews Live',
    description: 'Real-time global intelligence dashboard',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${geist.variable}`}>
      <body className="bg-void text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
