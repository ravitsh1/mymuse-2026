import path from 'path'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Media } from '@/payload-types'

// Ravit (2026-10-29): the nine new sites also get a photo mockup (her licensed stock photos, composed by
// media-import/mockup/photo) as the first gallery image, like the other projects. Only while the gallery still starts
// with the screenshot new_projects_2026 put there. Same Blob-token guard as the other media imports.
const DIR = path.resolve(process.cwd(), 'media-import/photo')

const ROWS: { slug: string; alt: string }[] = [
  { slug: 'amphora', alt: 'האתר של יקב אמפורה על טאבלט בידיים, ליד שולחן קפה' },
  { slug: 'lotem', alt: 'האתר של יקב לוטם על טאבלט עם מקלדת, ליד פרחים יבשים' },
  { slug: 'shikui', alt: 'האתר של שיקוי על טאבלט בידיים, בבית קפה מואר' },
  { slug: 'pauker', alt: 'האתר של יקב פאוקר על טאבלט עם מקלדת, ליד אוזניות ופרחים' },
  { slug: 'nene-royal', alt: 'האתר של ננה רויאל בטלפון ביד' },
  { slug: 'rachashei-lev', alt: 'האתר של רחשי לב על טאבלט בידיים, בבית קפה' },
  { slug: 'hamesila', alt: 'האתר של המסילה בטלפון ביד ובטאבלט על שולחן עץ' },
  { slug: 'tushia', alt: 'האתר של יקב תושיה על טאבלט עם מקלדת, ליד זר פרחים' },
  { slug: 'udi-fish', alt: 'האתר של אודי דגים על טאבלט עם מקלדת, בבית קפה' },
]

const idOf = (m: unknown) => (m && typeof m === 'object' ? (m as Media).id : (m as number))
const fileOf = (m: unknown) => (m && typeof m === 'object' ? (m as Media).filename : null)

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('new projects photos: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')
  for (const row of ROWS) {
    const p = (await payload.find({ collection: 'projects', where: { slug: { equals: row.slug } }, limit: 1, depth: 1, req })).docs[0]
    const gallery = p?.gallery ?? []
    if (!p || !fileOf(gallery[0])?.startsWith(`${row.slug}-01`)) continue
    const photo = await payload.create({ collection: 'media', data: { alt: row.alt }, filePath: path.join(DIR, `${row.slug}-photo.jpg`), req })
    await payload.update({ collection: 'projects', id: p.id, data: { gallery: [photo.id, ...gallery.map(idOf)] }, req })
    payload.logger.info(`new projects photos: ${row.slug}`)
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  for (const row of ROWS) {
    const p = (await payload.find({ collection: 'projects', where: { slug: { equals: row.slug } }, limit: 1, depth: 1, req })).docs[0]
    const gallery = p?.gallery ?? []
    if (!p || !fileOf(gallery[0])?.startsWith(`${row.slug}-photo`)) continue
    await payload.update({ collection: 'projects', id: p.id, data: { gallery: gallery.slice(1).map(idOf) }, req })
  }
}
