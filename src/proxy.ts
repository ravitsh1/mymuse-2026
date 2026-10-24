import { NextResponse, type NextRequest } from 'next/server'

/**
 * Addresses of the old WordPress site at mymuse.co.il → their place on the new site, so links and Google results
 * keep working after the domain moves (same approach as threebears-2026). Old WordPress URLs end with "/" and
 * project slugs carry the Hebrew name. Projects not on the new site yet go to the home page's work list —
 * when one is added, put its new slug here.
 */
const LEGACY: Record<string, string> = {
  '/about-us': '/',
  '/work': '/',
  '/contact': '/',
  '/portfolio': '/',
  '/הצהרת-נגישות': '/accessibility',
}
const LEGACY_PROJECTS: Record<string, string> = {
  'jullius-יוליוס': 'jullius',
  'mosessco-מוססקו': 'mosessco',
  'margalit-מרגלית': 'margalit',
  'recanati-רקנאטי': 'recanati',
  'vinspiration-וינספיריישן': 'vinspiration',
  // not migrated yet → home page
  'helios-הליוס': '',
  'gurgroup-קבוצת-גור-ביטוח': '',
  'meteor-center-מרכז-קהילתי-מטאור': '',
  'teo-תאו': '',
  'barantech-ברנטק': '',
  'benny-goren-בני-גורן': '',
  'enosh-אנוש': '',
  'little-fences-גדרות-קטנות': '',
  'samurai-סמוראי': '',
  'ווין-קייס-winecase': '',
  'netofa-נטופה': '',
  '3-bears-שלושת-הדובים': '',
  'studio-gur-סטודיו-גור': '',
  'agur-עגור': '',
  'boutiqe77-בוטיק': '',
  'moa-winery-יקב-מואה': '',
  'firon-פירון': '',
  'gordon-pool-בריכת-גורדון': '',
}

const legacyTarget = (path: string): string | null => {
  if (LEGACY[path]) return LEGACY[path]
  const m = path.match(/^\/portfolio\/([^/]+)$/)
  // only old slugs are mapped: new slugs (/portfolio/jullius) must pass through untouched
  if (m && m[1] in LEGACY_PROJECTS) return LEGACY_PROJECTS[m[1]] ? `/portfolio/${LEGACY_PROJECTS[m[1]]}` : '/'
  if (/^\/portfolio_(category|tag)(\/|$)/.test(path)) return '/'
  return null
}

/**
 * A fresh URL on this host for a redirect. Not req.nextUrl.clone(): the clone remembers that the request ended
 * with "/" and puts the slash back when it is serialized, so "/x/" → "/x" redirected to itself in a loop.
 */
const to = (req: NextRequest, pathname: string, hash = '') => {
  const url = new URL(pathname, req.url)
  url.search = req.nextUrl.search
  url.hash = hash
  return url
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const bare = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  let decoded = bare
  try {
    decoded = decodeURIComponent(bare)
  } catch {
    /* malformed escape: keep as is */
  }
  // old-site addresses, in a single 301 hop
  const legacy = legacyTarget(decoded)
  if (legacy) return NextResponse.redirect(to(req, legacy, legacy === '/' && decoded.startsWith('/portfolio') ? 'work' : ''), 301)
  if (bare !== pathname) return NextResponse.redirect(to(req, bare), 308)
  return NextResponse.next()
}

export const config = {
  // everything except admin, api, Next internals and files with an extension
  matcher: ['/((?!admin|api|_next|.*\\.[\\w]+$).*)'],
}
