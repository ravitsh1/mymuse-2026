import Script from 'next/script'

/**
 * Google Analytics 4 (Settings → gaId). Only on the production deployment, so previews and local runs don't count
 * as visits. afterInteractive keeps it off the critical path.
 */
export function Analytics({ id }: { id?: string | null }) {
  const gaId = id?.trim()
  if (!gaId || !/^G-[A-Z0-9]+$/.test(gaId) || process.env.VERCEL_ENV !== 'production') return null
  return (
    <>
      <Script id="ga-loader" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
      </Script>
    </>
  )
}
