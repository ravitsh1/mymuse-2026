import path from 'path'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Media } from '@/payload-types'

// Ravit (2026-11-03): a scene of its own for every project's hero, from her licensed stock photos with the site's own
// screens put in (composed in the scratchpad with photo/compose.js, cropped around the devices: desktop 16:9 and
// mobile 9:16), in media-import/hero-photo. A hero is replaced only while it is still the 2026 mockup it was made
// over, so her own changes stay; the mockups stay in the media library (down puts them back). Same Blob-token guard.
const DIR = path.resolve(process.cwd(), 'media-import/hero-photo')

const SCENES: Record<string, string> = {
  '3-bears': 'טאבלט וטלפון על רקע צהוב, ליד אוזניות',
  amphora: 'טאבלט בידיים בבית קפה, ליד כוס קפוצ׳ינו',
  lotem: 'טאבלט וטלפון על שולחן לבן, ליד פרחים ומקלדת',
  shikui: 'טאבלט וטלפון על רקע ורוד, ליד כוס קפה ועט',
  firon: 'טאבלט וטלפון על שולחן עץ באור שמש',
  pauker: 'טאבלט וטלפון על שולחן אפור, ליד משקפיים ומחברת',
  'nene-royal': 'טאבלט וטלפון על שולחן בגוון סגול, ליד משקפיים ופרחים',
  gurgroup: 'טאבלט עם מקלדת ליד מסך מחשב, על שולחן עבודה',
  'our-kitchen': 'טאבלט עם מקלדת על שולחן בבית קפה, ליד כוס קפה ועציץ',
  vinspiration: 'טאבלט עם מקלדת ליד חלון, עם ספל ופרחים',
  'rachashei-lev': 'טלפון ביד בבית קפה, ליד כוס קפה',
  hamesila: 'טאבלט וטלפון על שולחן תכלת, ליד מחשב נייד וקפה',
  tushia: 'טאבלט וטלפון על שולחן אפור, ליד מחשב נייד ואוזניות',
  teo: 'טאבלט בידיים ליד שולחן קפה עגול',
  jullius: 'טאבלט עם מקלדת על שולחן עבודה, ליד פרחים ואוזניות',
  'udi-fish': 'טלפון בידיים בבית קפה, ליד עוגה וקפה',
  'moran-gil': 'טאבלט וטלפון על שולחן תכלת, ליד עפרונות ומשקפיים',
  'benny-goren': 'טאבלט עם מקלדת על שולחן, ליד פרחים יבשים',
  margalit: 'טאבלט עם מקלדת על שולחן עץ, ליד מחברת ומשקפיים',
  recanati: 'טאבלט עם מקלדת וטלפון על שולחן עץ',
  'delivery-app': 'האפליקציה בטאבלט בידיים, ליד שולחן קפה',
  mybase: 'האפליקציה בטלפון ביד, ליד טאבלט וכוס תה',
  'client-portal': 'הפורטל על מסך מחשב גדול בסטודיו לעיצוב',
}

const fileOf = (m: unknown) => (m && typeof m === 'object' ? (m as Media).filename : null)

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('hero photos: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')
  for (const [slug, scene] of Object.entries(SCENES)) {
    const p = (await payload.find({ collection: 'projects', where: { slug: { equals: slug } }, limit: 1, depth: 1, req })).docs[0]
    if (!p) continue
    const data: { hero?: number; heroMobile?: number } = {}
    if (fileOf(p.hero) === `${slug}-2026.webp`)
      data.hero = (await payload.create({ collection: 'media', data: { alt: `האתר של ${p.title}: ${scene}` }, filePath: path.join(DIR, `${slug}-hero.webp`), req })).id
    if (fileOf(p.heroMobile) === `${slug}-2026-m.webp`)
      data.heroMobile = (await payload.create({ collection: 'media', data: { alt: `האתר של ${p.title}: ${scene}` }, filePath: path.join(DIR, `${slug}-hero-m.webp`), req })).id
    if (Object.keys(data).length) await payload.update({ collection: 'projects', id: p.id, data, req })
    payload.logger.info(`hero photos: ${slug} ${Object.keys(data).join(', ')}`)
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const byName = async (filename: string) => (await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, req })).docs[0]?.id
  for (const slug of Object.keys(SCENES)) {
    const p = (await payload.find({ collection: 'projects', where: { slug: { equals: slug } }, limit: 1, depth: 1, req })).docs[0]
    if (!p) continue
    const data: { hero?: number; heroMobile?: number } = {}
    if (fileOf(p.hero)?.startsWith(`${slug}-hero`)) data.hero = await byName(`${slug}-2026.webp`)
    if (fileOf(p.heroMobile)?.startsWith(`${slug}-hero-m`)) data.heroMobile = await byName(`${slug}-2026-m.webp`)
    if (Object.keys(data).length) await payload.update({ collection: 'projects', id: p.id, data, req })
  }
}
