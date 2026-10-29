import path from 'path'
import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Media } from '@/payload-types'

// Ravit (2026-10-29), with the 2026 brand book:
// 1. Her updated list of projects: 19 sites and 3 apps, in her order. Projects not on it are hidden (not deleted);
//    the nine new sites on it get their keys in the order when they are added.
// 2. Two categories: "אתרים" (was "יין ואוכל") and "אפליקציות" (was "אפליקציות ומערכות"); the others stay but no
//    visible project uses them, so their filter buttons disappear.
// 3. New hero mockups in the brand-book look (porcelain room, painted slabs, no people), desktop and mobile, from
//    media-import/brand26 (made by mockup26.js). A hero is replaced only while it is still the one it was made over.
// Same Blob-token guard as the other media imports.
const DIR = path.resolve(process.cwd(), 'media-import/brand26')
const D = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// her list, position → slug (positions of the sites still to be added are left free)
const ORDER: [number, string][] = [
  [1, '3-bears'],
  [5, 'firon'],
  [8, 'gurgroup'],
  [9, 'our-kitchen'],
  [10, 'vinspiration'],
  [14, 'teo'],
  [15, 'jullius'],
  [17, 'benny-goren'],
  [18, 'margalit'],
  [19, 'recanati'],
  [20, 'delivery-app'],
  [21, 'mybase'],
  [22, 'client-portal'],
]
const APPS = ['delivery-app', 'mybase', 'client-portal']
// visible until now (down shows them again), then the ones already hidden (they only move to the end of the order)
const WAS_VISIBLE = ['meteor-center', 'helios', 'samurai', 'agur', 'gordon-pool', 'little-fences', 'boutique77', 'enosh', 'mosessco']
const HIDE = [...WAS_VISIBLE, 'barantech', 'studio-gur', 'moa-winery', 'winecase', 'netofa']

// slug → [current hero file, current mobile hero file, name for the alt]
const HEROES: Record<string, [string, string, string]> = {
  '3-bears': ['3bears-10-mockup-playful-inset.jpg', '3-bears-mobile.webp', 'שלושת הדובים'],
  firon: ['firon-hero.webp', 'firon-mobile.webp', 'פירון'],
  gurgroup: ['gurgroup-hero.webp', 'gurgroup-mobile.webp', 'קבוצת גור'],
  'our-kitchen': ['ourkitchen-01-mockup.jpg', 'our-kitchen-mobile.webp', 'המטבח שלנו'],
  vinspiration: ['vinspiration-hero.webp', 'vinspiration-mobile.webp', 'וינספיריישן'],
  teo: ['teo-hero.webp', 'teo-mobile.webp', 'תאו'],
  jullius: ['jullius-hero.webp', 'jullius-mobile.webp', 'יוליוס'],
  'benny-goren': ['benny-goren-hero.webp', 'benny-goren-mobile.webp', 'בני גורן'],
  margalit: ['margalit-hero.webp', 'margalit-mobile.webp', 'מרגלית'],
  recanati: ['recanati-hero.webp', 'recanati-mobile.webp', 'רקאנטי'],
  'delivery-app': ['delivery-app-01-mockup.jpg', 'delivery-app-mobile.webp', 'ניהול משלוחים'],
  mybase: ['mybase-hero.webp', 'mybase-mobile.webp', 'MyBase'],
  'client-portal': ['client-portal-hero.webp', 'client-portal-mobile.webp', 'פורטל לקוחות'],
}

const idOf = (m: unknown) => (m && typeof m === 'object' ? (m as Media).id : (m as number))
const fileOf = (m: unknown) => (m && typeof m === 'object' ? (m as Media).filename : null)

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('projects 2026: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  // order: the list first ("a" + one digit), the hidden ones after it ("b" + two digits)
  for (const [pos, slug] of ORDER) await db.execute(sql`UPDATE "projects" SET "_order" = ${'a' + D[pos]} WHERE "slug" = ${slug}`)
  for (const [k, slug] of HIDE.entries()) {
    await db.execute(sql`UPDATE "projects" SET "hidden" = true, "_order" = ${'b' + String(k).padStart(2, '0')} WHERE "slug" = ${slug}`)
  }

  await db.execute(sql`UPDATE "categories" SET "title" = 'אתרים' WHERE "title" = 'יין ואוכל'`)
  await db.execute(sql`UPDATE "categories" SET "title" = 'אפליקציות' WHERE "title" = 'אפליקציות ומערכות'`)
  for (const [, slug] of ORDER) {
    const cat = APPS.includes(slug) ? 'אפליקציות' : 'אתרים'
    await db.execute(sql`UPDATE "projects" SET "category_id" = (SELECT "id" FROM "categories" WHERE "title" = ${cat} LIMIT 1) WHERE "slug" = ${slug}`)
  }

  for (const [slug, [hero, mobile, name]] of Object.entries(HEROES)) {
    const p = (await payload.find({ collection: 'projects', where: { slug: { equals: slug } }, limit: 1, depth: 1, req })).docs[0]
    if (!p) continue
    const data: { hero?: number; heroMobile?: number } = {}
    if (fileOf(p.hero) === hero)
      data.hero = idOf(
        await payload.create({ collection: 'media', data: { alt: `האתר של ${name} במחשב ובטלפון, על רקע משטחים צבועים` }, filePath: path.join(DIR, `${slug}-2026.webp`), req }),
      )
    if (fileOf(p.heroMobile) === mobile)
      data.heroMobile = idOf(
        await payload.create({ collection: 'media', data: { alt: `האתר של ${name} בטלפון, על רקע משטחים צבועים` }, filePath: path.join(DIR, `${slug}-2026-m.webp`), req }),
      )
    if (Object.keys(data).length) await payload.update({ collection: 'projects', id: p.id, data, req })
    payload.logger.info(`projects 2026: ${slug} ${Object.keys(data).join(', ')}`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  for (const [slug, [hero, mobile]] of Object.entries(HEROES)) {
    const p = (await payload.find({ collection: 'projects', where: { slug: { equals: slug } }, limit: 1, depth: 1, req })).docs[0]
    if (!p) continue
    const back = async (file: string) =>
      (await payload.find({ collection: 'media', where: { filename: { equals: file } }, limit: 1, req })).docs[0]?.id
    const data: { hero?: number; heroMobile?: number } = {}
    if (fileOf(p.hero)?.startsWith(`${slug}-2026`)) data.hero = await back(hero)
    if (fileOf(p.heroMobile)?.startsWith(`${slug}-2026-m`)) data.heroMobile = await back(mobile)
    if (Object.keys(data).length) await payload.update({ collection: 'projects', id: p.id, data, req })
  }
  for (const slug of WAS_VISIBLE) await db.execute(sql`UPDATE "projects" SET "hidden" = false WHERE "slug" = ${slug}`)
  await db.execute(sql`UPDATE "categories" SET "title" = 'יין ואוכל' WHERE "title" = 'אתרים'`)
  await db.execute(sql`UPDATE "categories" SET "title" = 'אפליקציות ומערכות' WHERE "title" = 'אפליקציות'`)
}
