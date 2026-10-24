import type { Metadata } from 'next'
import { asMedia, mediaUrl } from './media'

/** The live address. Canonicals, sitemap and share tags always point here (the *.vercel.app copy is noindex). */
export const SITE_URL = 'https://mymuse.co.il'
export const SITE_NAME = 'MyMuse'
export const DEFAULT_DESCRIPTION = 'MyMuse – בניית אתרים בהתאמה אישית: אפיון, הקמה, פיתוח ממשק וליווי מתמשך.'

export const abs = (path: string) => new URL(path, SITE_URL).toString()

/** A share image (absolute URL) for a media item. Videos and SVGs don't work as share images. */
export function shareImageOf(m: unknown): { url: string; width?: number; height?: number } | null {
  const media = asMedia(m)
  const url = mediaUrl(m)
  if (!media || !url) return null
  const mime = media.mimeType || ''
  if (mime.startsWith('video/') || mime === 'image/svg+xml') return null
  return { url: abs(url), width: media.width || undefined, height: media.height || undefined }
}

/** Metadata for one page: canonical on mymuse.co.il, Open Graph and Twitter cards. */
export function pageMetadata({
  path,
  title,
  description,
  image,
  type = 'website',
}: {
  path: string
  title?: string
  description?: string | null
  image?: { url: string; width?: number; height?: number } | null
  type?: 'website' | 'article'
}): Metadata {
  const desc = (description || '').trim() || DEFAULT_DESCRIPTION
  const url = abs(path)
  return {
    metadataBase: new URL(SITE_URL),
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title: title || SITE_NAME,
      description: desc,
      locale: 'he_IL',
      images: image ? [{ url: image.url, width: image.width, height: image.height, alt: title || SITE_NAME }] : undefined,
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title: title || SITE_NAME, description: desc, images: image ? [image.url] : undefined },
  }
}

/** A JSON-LD block, ready for <script type="application/ld+json">. `<` is escaped so text can't close the tag. */
export const jsonLd = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, '\\u003c') })
