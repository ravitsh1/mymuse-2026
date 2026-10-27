import path from 'path'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Media } from '@/payload-types'

// Ravit (2026-10-27): the hero mockups are re-rendered with the client's brand-colour area left transparent, so the
// page colour shows through. In Neon the project colour is that same brand colour (project_bg_from_images), so the
// live site looks the same; the trial palettes get the devices on their own colour. Generator: TRANSPARENT=1 in
// media-import/mockup/remake. Four desktop heroes were not made by the generator and stay as they are (hero: null).
// Each swap happens only while the project still shows the file it was rendered from. Same Blob-token guard as the
// other media imports.
const DIR = path.resolve(process.cwd(), 'media-import/transparent')

// The file each project shows now (hero = desktop, mobile = heroMobile); null: not replaced
const ROWS: { slug: string; hero: string | null; mobile: string | null }[] = [
  { slug: 'meteor-center', hero: 'meteor-center-01-mockup.jpg', mobile: 'meteor-center-00-mobile-v2.jpg' },
  { slug: 'gurgroup', hero: 'gurgroup-01-mockup.jpg', mobile: 'gurgroup-00-mobile-v2.jpg' },
  { slug: 'helios', hero: 'helios-01-mockup.jpg', mobile: 'helios-00-mobile-v2.jpg' },
  { slug: 'recanati', hero: 'recanati-01-mockup.jpg', mobile: 'recanati-00-mobile-v2.jpg' },
  { slug: 'samurai', hero: 'samurai-01-mockup.jpg', mobile: 'samurai-00-mobile-v2.jpg' },
  { slug: 'barantech', hero: 'barantech-01-mockup.jpg', mobile: 'barantech-00-mobile-v2.jpg' },
  { slug: 'benny-goren', hero: 'benny-goren-01-mockup.jpg', mobile: 'benny-goren-00-mobile-v2.jpg' },
  { slug: 'margalit', hero: 'margalit-01-mockup.jpg', mobile: 'margalit-00-mobile-v2.jpg' },
  { slug: 'agur', hero: 'agur-01-mockup.jpg', mobile: 'agur-00-mobile-v2.jpg' },
  { slug: 'gordon-pool', hero: 'gordon-pool-01-mockup.jpg', mobile: 'gordon-pool-00-mobile-v2.jpg' },
  { slug: 'firon', hero: 'firon-01-mockup.jpg', mobile: 'firon-00-mobile-v2.jpg' },
  { slug: 'vinspiration', hero: 'vinspiration-01-mockup.jpg', mobile: 'vinspiration-00-mobile-v2.jpg' },
  { slug: 'studio-gur', hero: 'studio-gur-01-mockup.jpg', mobile: 'studio-gur-00-mobile-v2.jpg' },
  { slug: '3-bears', hero: null, mobile: '3-bears-00-mobile-v3.jpg' },
  { slug: 'little-fences', hero: null, mobile: 'little-fences-00-mobile-v2.jpg' },
  { slug: 'boutique77', hero: 'boutique77-01-mockup.jpg', mobile: 'boutique77-00-mobile-v2.jpg' },
  { slug: 'enosh', hero: 'enosh-01-mockup.jpg', mobile: 'enosh-00-mobile-v2.jpg' },
  { slug: 'moa-winery', hero: 'moa-winery-01-mockup.jpg', mobile: 'moa-winery-00-mobile-v2.jpg' },
  { slug: 'mosessco', hero: 'mosessco-01-mockup.jpg', mobile: 'mosessco-00-mobile-v2.jpg' },
  { slug: 'jullius', hero: 'jullius-01-mockup.jpg', mobile: 'jullius-00-mobile-v2.jpg' },
  { slug: 'winecase', hero: 'winecase-01-mockup.jpg', mobile: 'winecase-00-mobile-v2.jpg' },
  { slug: 'teo', hero: 'teo-01-mockup.jpg', mobile: 'teo-00-mobile-v2.jpg' },
  { slug: 'netofa', hero: 'netofa-01-mockup.jpg', mobile: 'netofa-00-mobile-v2.jpg' },
  { slug: 'our-kitchen', hero: null, mobile: 'our-kitchen-00-mobile-v2.jpg' },
  { slug: 'mybase', hero: 'mybase-01-mockup.jpg', mobile: 'mybase-00-mobile-v2.jpg' },
  { slug: 'delivery-app', hero: null, mobile: 'delivery-app-00-mobile-v2.jpg' },
  { slug: 'client-portal', hero: 'client-portal-01-mockup.jpg', mobile: 'client-portal-00-mobile-v2.jpg' },
]

const fileOf = (m: unknown) => (m && typeof m === 'object' ? (m as Media).filename : null)

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('transparent heroes: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  for (const row of ROWS) {
    const found = await payload.find({ collection: 'projects', where: { slug: { equals: row.slug } }, limit: 1, depth: 1, req })
    const p = found.docs[0]
    if (!p) continue
    const data: { hero?: number; heroMobile?: number } = {}
    for (const [field, from, file] of [
      ['hero', row.hero, `${row.slug}-hero.webp`],
      ['heroMobile', row.mobile, `${row.slug}-mobile.webp`],
    ] as const) {
      const cur = p[field]
      if (!from || fileOf(cur) !== from) continue
      const alt = (cur as Media).alt ?? undefined
      data[field] = (await payload.create({ collection: 'media', data: { alt }, filePath: path.join(DIR, file), req })).id
    }
    if (Object.keys(data).length) {
      await payload.update({ collection: 'projects', id: p.id, data, req })
      payload.logger.info(`transparent heroes: ${row.slug} ${Object.keys(data).join(', ')}`)
    }
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const byFile = async (filename: string) =>
    (await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0, req })).docs[0]?.id
  for (const row of ROWS) {
    const found = await payload.find({ collection: 'projects', where: { slug: { equals: row.slug } }, limit: 1, depth: 1, req })
    const p = found.docs[0]
    if (!p) continue
    const data: { hero?: number; heroMobile?: number } = {}
    for (const [field, from, prefix] of [
      ['hero', row.hero, `${row.slug}-hero`],
      ['heroMobile', row.mobile, `${row.slug}-mobile`],
    ] as const) {
      // Payload may add a numeric suffix to the uploaded name (x-hero-1.webp)
      if (!from || !fileOf(p[field])?.startsWith(prefix)) continue
      const id = await byFile(from)
      if (id) data[field] = id
    }
    if (Object.keys(data).length) await payload.update({ collection: 'projects', id: p.id, data, req })
  }
}
