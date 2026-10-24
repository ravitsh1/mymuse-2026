import { NextResponse, type NextRequest } from 'next/server'

/**
 * Addresses of the old WordPress site at mymuse.co.il → their place on the new site, so links and Google results
 * keep working after the domain moves (same approach as threebears-2026). Old WordPress URLs end with "/" and
 * project slugs carry the Hebrew name. A project mapped to '' goes to the home page — use that
 * for a project removed from the new site.
 */
const LEGACY: Record<string, string> = {
  '/about-us': '/',
  '/work': '/',
  '/contact': '/',
  '/portfolio': '/',
  '/הצהרת-נגישות': '/accessibility',
}
const LEGACY_PROJECTS: Record<string, string> = {
  // all imported by src/import/wordpress.ts (same slug rule: the Latin part of the old slug)
  'jullius-יוליוס': 'jullius',
  'mosessco-מוססקו': 'mosessco',
  'margalit-מרגלית': 'margalit',
  'recanati-רקנאטי': 'recanati',
  'vinspiration-וינספיריישן': 'vinspiration',
  'helios-הליוס': 'helios',
  'gurgroup-קבוצת-גור-ביטוח': 'gurgroup',
  'meteor-center-מרכז-קהילתי-מטאור': 'meteor-center',
  'teo-תאו': 'teo',
  'barantech-ברנטק': 'barantech',
  'benny-goren-בני-גורן': 'benny-goren',
  'enosh-אנוש': 'enosh',
  'little-fences-גדרות-קטנות': 'little-fences',
  'samurai-סמוראי': 'samurai',
  'ווין-קייס-winecase': 'winecase',
  'netofa-נטופה': 'netofa',
  '3-bears-שלושת-הדובים': '3-bears',
  'studio-gur-סטודיו-גור': 'studio-gur',
  'agur-עגור': 'agur',
  'boutiqe77-בוטיק': 'boutique77',
  'moa-winery-יקב-מואה': 'moa-winery',
  'firon-פירון': 'firon',
  'gordon-pool-בריכת-גורדון': 'gordon-pool',
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
