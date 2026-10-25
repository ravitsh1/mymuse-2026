/**
 * One-off import of the portfolio from the old WordPress site (mymuse.co.il) into Payload.
 *   Local:       LOCAL_PGLITE=1 npm run import:wp
 *   Production:  see docs/IMPORT.md (runs from Ravit's machine with the Vercel env)
 * Safe to re-run: projects whose slug already exists are skipped, images already uploaded are reused,
 * so nothing Ravit edited in the admin is overwritten.
 *
 * The portfolio post type is not in the WP REST API, so the project pages are read from the sitemap + HTML.
 */
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'
import sharp from 'sharp'
import type { Media } from '@/payload-types'

const OLD = 'https://mymuse.co.il'

/** Short labels for the work index, taken from the texts on the old pages (the old pages have no such field). */
const FIELDS: Record<string, string> = {
  netofa: 'יקב',
  teo: 'מרכז לתרבות ואומנות',
  winecase: 'מארזי יין',
  jullius: 'מזקקת בוטיק',
  mosessco: 'אדריכלים',
  'moa-winery': 'יקב',
  enosh: 'עמותה לבריאות הנפש',
  boutique77: 'רשת חנויות אופנה',
  'little-fences': 'ספר',
  '3-bears': 'סטודיו לעיצוב',
  'studio-gur': 'סטודיו למיתוג',
  vinspiration: 'טיולי יין וקולינריה',
  firon: 'משרד עורכי דין',
  'gordon-pool': 'בריכה',
  agur: 'יקב',
  margalit: 'יקב',
  'benny-goren': 'ספרי לימוד',
  barantech: 'פיתוח מוצרים',
  samurai: 'ייעוץ עסקי וכלכלי',
  recanati: 'יקב',
  helios: 'פלדה ירוקה',
  gurgroup: 'ביטוח',
  'meteor-center': 'מרכז קהילתי',
}

/** Old slug typos that should not live on in the new URLs, and names the old title cut short. */
const SLUG_FIX: Record<string, string> = { boutiqe77: 'boutique77' }
const NAME_FIX: Partial<Record<string, { title: string; nameEn: string }>> = { boutique77: { title: 'בוטיק 77', nameEn: 'BOUTIQUE 77' } }

/** The palettes approved in the prototype; every other project gets one derived from its image. */
const PALETTES: Record<string, { bg: string; ink: string; accent: string }> = {
  jullius: { bg: '#1b2a24', ink: '#e9dcc0', accent: '#c8953f' },
  mosessco: { bg: '#e6e3dc', ink: '#1d1c1a', accent: '#a3432a' },
  margalit: { bg: '#3a0f1c', ink: '#f3e6e0', accent: '#e0a96d' },
  recanati: { bg: '#0f2a3a', ink: '#e7eef0', accent: '#7fc4c9' },
  vinspiration: { bg: '#4b5a2a', ink: '#f1efe2', accent: '#e7c75a' },
}

/* ---------- reading the old site ---------- */

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
const strip = (h: string) => decode(h.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).trim()
const between = (s: string, a: string, b: string) => {
  const i = s.indexOf(a)
  const j = s.indexOf(b, i)
  return i < 0 ? '' : s.slice(i, j < 0 ? undefined : j)
}
const hebrew = /[֐-׿]/

type OldProject = {
  url: string
  oldSlug: string
  slug: string
  title: string
  nameEn: string
  field?: string
  lead: string
  credit?: string
  siteUrl?: string
  hero?: string
  gallery: string[]
}

async function get(url: string) {
  const res = await fetch(url, { headers: { 'user-agent': 'MyMuse import' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res
}

async function readProject(url: string, featured?: string): Promise<OldProject> {
  const s = await (await get(url)).text()
  const oldSlug = decodeURIComponent(url).replace(/\/$/, '').split('/portfolio/')[1]
  const latin = oldSlug.split('-').filter((t) => /^[a-z0-9]+$/.test(t)).join('-')
  const slug = SLUG_FIX[latin] ?? latin

  // "Jullius יוליוס" → title "יוליוס", nameEn "JULLIUS"
  const full = strip(s.match(/<span class="anim-slide">([\s\S]*?)<\/span>/)?.[1] ?? slug)
  const words = full.split(/\s+/)
  const title = words.filter((w) => hebrew.test(w)).join(' ') || full
  const nameEn = words.filter((w) => !hebrew.test(w)).join(' ').toUpperCase() || slug.toUpperCase()

  const body = between(s, 'id="down"', 'prev/next project start')
  const credit = [...body.matchAll(/<div\s+class="body-text-s[^"]*"[^>]*>([\s\S]*?)<\/div>/g)].map((m) => strip(m[1]))[0]
  const paras = [...body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => strip(m[1]))
    .filter((p) => p && p !== credit)
  // one paragraph on the new page: line breaks become sentence breaks
  const lead = paras
    .flatMap((p) => p.split('\n'))
    .map((l) => l.trim().replace(/^\/\/\s*|\s*\/\/$/g, ''))
    .filter(Boolean)
    .map((l) => (/[.!?:]$/.test(l) ? l : l + '.'))
    .join(' ')
  const siteUrl = body.match(/<a href="([^"]+)" class="overlay-btn/)?.[1]
  const gallery = [...body.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1])
  const hero = featured || between(s, 'id="up"', 'id="down"').match(/background-image:url\(([^)]+)\)/)?.[1]

  const fix = NAME_FIX[slug]
  return { url, oldSlug, slug, title: fix?.title ?? title, nameEn: fix?.nameEn ?? nameEn, field: FIELDS[slug], lead, credit, siteUrl, hero, gallery }
}

async function readPortfolio() {
  const xml = await (await get(`${OLD}/portfolio-sitemap.xml`)).text()
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    url: m[1].match(/<loc>(.*?)<\/loc>/)![1],
    image: m[1].match(/<image:loc>(.*?)<\/image:loc>/)?.[1],
    lastmod: m[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1] ?? '',
  }))
  // newest first: that becomes the drag order in the admin (and the "next project" chain)
  entries.sort((a, b) => b.lastmod.localeCompare(a.lastmod))
  const out: OldProject[] = []
  for (const e of entries) out.push(await readProject(e.url, e.image))
  return out
}

/* ---------- colours ---------- */

const hex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const lum = (c: number[]) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => v + (b[i] - v) * t)

/**
 * A dark background in the image's colour, with the site's ink and accent kept readable on it. The colour is
 * the average of the most saturated pixels: most heroes are site mockups whose "dominant" colour is the
 * white or black device frame.
 */
async function paletteFrom(image: Buffer) {
  const ink = rgb('#f5ebe0')
  const { data } = await sharp(image).resize(48, 48, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const px: number[][] = []
  for (let i = 0; i < data.length; i += 3) px.push([data[i], data[i + 1], data[i + 2]])
  const sat = (c: number[]) => Math.max(...c) - Math.min(...c)
  px.sort((a, b) => sat(b) - sat(a))
  const top = px.slice(0, Math.ceil(px.length * 0.15))
  // a black-and-white image keeps the site's own background
  const base = sat(top[0]) < 40 ? rgb('#001219') : [0, 1, 2].map((k) => top.reduce((s, c) => s + c[k], 0) / top.length)
  let bg = base
  // 7:1 for body text; small text at opacity .85 then still clears 4.5:1
  for (let t = 0.1; contrast(bg, ink) < 7 && t <= 1; t += 0.1) bg = mix(base, [12, 11, 14], t)
  // the brand amber (Ocean Sunset palette), lightened just enough for 4.5:1 on this background
  let acc = rgb('#ee9b00')
  for (let t = 0.1; contrast(acc, bg) < 4.5 && t <= 1; t += 0.1) acc = mix(rgb('#ee9b00'), [255, 255, 255], t)
  return { bg: hex(bg), ink: hex(ink), accent: hex(acc) }
}

/* ---------- writing to Payload ---------- */

const MIME: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }

async function upload(payload: Payload, url: string, alt: string) {
  const name = decodeURIComponent(url.split('/').pop()!.split('?')[0])
  const found = await payload.find({ collection: 'media', where: { filename: { equals: name } }, limit: 1, depth: 0 })
  const data = Buffer.from(await (await get(url)).arrayBuffer())
  if (found.docs[0]) return { media: found.docs[0] as Media, data }
  const mimetype = MIME[name.split('.').pop()!.toLowerCase()] ?? 'image/jpeg'
  const media = await payload.create({ collection: 'media', data: { alt }, file: { data, mimetype, name, size: data.length } })
  return { media, data }
}

async function run() {
  const payload = await getPayload({ config })
  const projects = await readPortfolio()
  payload.logger.info(`old site: ${projects.length} projects`)

  for (const p of projects) {
    const exists = await payload.find({ collection: 'projects', where: { slug: { equals: p.slug } }, limit: 1, depth: 0 })
    if (exists.docs.length) {
      payload.logger.info(`skip (exists): ${p.slug}`)
      continue
    }
    // the hero is decorative on the page (the title sits on it), so no alt; screenshots get one
    const hero = p.hero ? await upload(payload, p.hero, '') : null
    const gallery = []
    for (const [k, src] of p.gallery.entries())
      gallery.push((await upload(payload, src, `מסך ${k + 1} מתוך האתר של ${p.title}`)).media.id)

    await payload.create({
      collection: 'projects',
      data: {
        slug: p.slug,
        title: p.title,
        nameEn: p.nameEn,
        field: p.field,
        lead: p.lead,
        credit: p.credit,
        siteUrl: p.siteUrl,
        hero: hero?.media.id,
        gallery,
        featured: true,
        ...(PALETTES[p.slug] ?? (hero ? await paletteFrom(hero.data) : {})),
      },
    })
    payload.logger.info(`project: ${p.slug} (${p.title}) ← ${p.oldSlug}, ${gallery.length} screenshots`)
  }
  payload.logger.info('done')
}

await run()
process.exit(0)
