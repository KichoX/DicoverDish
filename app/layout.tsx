import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const _geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const _instrumentSerif = localFont({
  src: [
    { path: '../public/fonts/InstrumentSerif-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/InstrumentSerif-Italic.woff2',  weight: '400', style: 'italic' },
  ],
  variable: '--font-instrument',
})

export const metadata: Metadata = {
  title: 'DiscoverDish — Eat somewhere worth remembering',
  description: 'An editor-curated guide to where to book, walk into, and order in from.',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" >
      <body
        className={`${_geist.variable} ${_geistMono.variable} ${_instrumentSerif.variable} antialiased`}
      >
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
