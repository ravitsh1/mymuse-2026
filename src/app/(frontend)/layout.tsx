import type { Metadata, Viewport } from 'next'
import React from 'react'
import { getSettings } from '@/lib/data'
import { indexable } from '@/lib/site'
import { SITE_URL } from '@/lib/seo'
import './styles.css'

export async function generateMetadata(): Promise<Metadata> {
  const [s, live] = await Promise.all([getSettings(), indexable()])
  return {
    metadataBase: new URL(SITE_URL),
    robots: live ? { index: true, follow: true } : { index: false, follow: false },
    title: { default: 'MyMuse · בניית אתרים בהתאמה אישית', template: '%s · MyMuse' },
    description: s.metaDescription ?? undefined,
    openGraph: { siteName: 'MyMuse', locale: 'he_IL', type: 'website' },
  }
}

// No maximum-scale / user-scalable=no: visitors must be able to zoom.
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#111517' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin=""
          href="https://vwqslahndspan0rp.public.blob.vercel-storage.com/fonts/telaviv-modernist-regular.woff2"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Karantina:wght@400;700&display=swap"
        />
      </head>
      <body>
        <a className="skip" href="#content">
          דילוג לתוכן
        </a>
        {children}
      </body>
    </html>
  )
}
