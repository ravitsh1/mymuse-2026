import type { Metadata, Viewport } from 'next'
import React from 'react'
import { CookieNotice } from '@/components/CookieNotice'
import { getPage, getSettings, sitePalette } from '@/lib/data'
import { indexable } from '@/lib/site'
import { SITE_URL } from '@/lib/seo'
import { PaletteToggle } from '@/components/PaletteToggle'
import { trialChrome, trialHero, trialPalette } from '@/lib/trial'
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
export async function generateViewport(): Promise<Viewport> {
  return { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: trialChrome(await trialPalette()) }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, privacy, trial, hero] = await Promise.all([getSettings(), getPage('privacy-policy'), trialPalette(), trialHero()])
  const site = sitePalette(settings)
  return (
    <html lang="he" dir="rtl" data-trial={trial ?? undefined}>
      <head>
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin=""
          href="https://vwqslahndspan0rp.public.blob.vercel-storage.com/fonts/talent-regular.woff2"
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
        {settings.cookieText && (
          <CookieNotice text={settings.cookieText} privacyHref={privacy ? '/privacy-policy' : undefined} bg={site.bg} ink={site.ink} acc={site.acc} />
        )}
        <PaletteToggle current={{ palette: trial ?? 'neon', hero }} />
      </body>
    </html>
  )
}
