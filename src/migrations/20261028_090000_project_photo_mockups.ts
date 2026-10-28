import path from 'path'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import type { Media } from '@/payload-types'

// Ravit (2026-10-28): every project gets a photo mockup as its second image (first in the gallery, the large one in the
// band): one of her licensed stock photos (Envato Elements) with the site on the device's screen. Made by
// media-import/mockup/photo (compose.js puts a screenshot on the photo's white screen, in perspective). The images that
// were there move up one: the old first is the small one in the band, the old second goes to the gallery below.
// Each project is changed only while its gallery still starts with the image it had when the photo was made. Same
// Blob-token guard as the other media imports.
const DIR = path.resolve(process.cwd(), 'media-import/photo')

// slug, file of the current first gallery image, alt for the photo
const ROWS: { slug: string; first: string | null; alt: string }[] = [
  { slug: 'our-kitchen', first: 'ourkitchen-02-album.jpg', alt: 'האתר של המטבח שלנו על טאבלט בידיים, ליד שולחן קפה' },
  { slug: 'jullius', first: 'jullius-02.jpg', alt: 'האתר של יוליוס על טאבלט בידיים, ליד שולחן קפה' },
  { slug: 'moa-winery', first: 'moa-winery-02.jpg', alt: 'האתר של יקב מואה על טאבלט בידיים, ליד שולחן קפה' },
  { slug: 'gurgroup', first: 'gurgroup-02.jpg', alt: 'האתר של קבוצת גור ביטוח על טאבלט בידיים, בבית קפה' },
  { slug: 'winecase', first: 'winecase-02.jpg', alt: 'האתר של ווין קייס על טאבלט עם מקלדת, ליד משקפיים ומחברות' },
  { slug: 'teo', first: 'teo-02.jpg', alt: 'האתר של תאו על טאבלט בידיים, בבית קפה מואר' },
  { slug: '3-bears', first: '3bears-01-hero.jpg', alt: 'האתר של שלושת הדובים על טאבלט בידיים, בבית קפה מואר' },
  { slug: 'helios', first: 'helios-02.jpg', alt: 'האתר של הליוס על טאבלט ובטלפון, במבט מלמעלה על שולחן עבודה' },
  { slug: 'gordon-pool', first: 'gordon-pool-02.jpg', alt: 'האתר של בריכת גורדון על טאבלט ובטלפון, במבט מלמעלה על שולחן עבודה' },
  { slug: 'little-fences', first: 'gderot-01-hero.jpg', alt: 'האתר של גדרות קטנות על טאבלט ובטלפון, במבט מלמעלה על שולחן עבודה' },
  { slug: 'firon', first: 'firon-02.jpg', alt: 'האתר של פירון בטלפון ביד' },
  { slug: 'boutique77', first: 'boutique77-02.jpg', alt: 'האתר של בוטיק 77 בטלפון ביד' },
  { slug: 'mybase', first: 'mybase-02.jpg', alt: 'MyBase בטלפון ביד ובטאבלט על שולחן עץ' },
  { slug: 'meteor-center', first: 'meteor-center-02.jpg', alt: 'האתר של מרכז קהילתי מטאור בטלפון ביד ובטאבלט על שולחן עץ' },
  { slug: 'delivery-app', first: 'delivery-app-02.jpg', alt: 'ניהול משלוחים בטלפון ביד ובטאבלט על שולחן עץ' },
  { slug: 'agur', first: 'agur-02.jpg', alt: 'האתר של עגור על טאבלט עם מקלדת, ליד פרחים יבשים' },
  { slug: 'margalit', first: 'margalit-02.jpg', alt: 'האתר של מרגלית על טאבלט עם מקלדת, ליד פרחים יבשים' },
  { slug: 'recanati', first: 'recanati-02.jpg', alt: 'האתר של רקנאטי על טאבלט עם מקלדת, בבית קפה' },
  { slug: 'client-portal', first: 'client-portal-02.jpg', alt: 'פורטל לקוחות על טאבלט עם מקלדת, בבית קפה' },
  { slug: 'studio-gur', first: 'studio-gur-02.jpg', alt: 'האתר של סטודיו גור על טאבלט עם מקלדת, על שולחן עבודה' },
  { slug: 'barantech', first: 'barantech-02.jpg', alt: 'האתר של ברנטק על טאבלט עם מקלדת, על שולחן עבודה' },
  { slug: 'enosh', first: 'enosh-02.jpg', alt: 'האתר של אנוש על טאבלט עם מקלדת, ליד אוזניות ופרחים' },
  { slug: 'vinspiration', first: 'vinspiration-02.jpg', alt: 'האתר של וינספיריישן על טאבלט עם מקלדת, ליד אוזניות ופרחים' },
  { slug: 'netofa', first: 'netofa-02.jpg', alt: 'האתר של נטופה על טאבלט עם מקלדת, ליד זר פרחים' },
  { slug: 'benny-goren', first: 'benny-goren-02.jpg', alt: 'האתר של בני גורן על טאבלט עם מקלדת, ליד זר פרחים' },
  { slug: 'mosessco', first: 'mosessco-02.jpg', alt: 'האתר של מוססקו על טאבלט עם מקלדת, ליד משקפיים ומחברות' },
  { slug: 'samurai', first: 'samurai-02.jpg', alt: 'האתר של סמוראי על טאבלט עם מקלדת, ליד משקפיים ומחברות' },
]

const idOf = (m: unknown) => (m && typeof m === 'object' ? (m as Media).id : (m as number))
const fileOf = (m: unknown) => (m && typeof m === 'object' ? (m as Media).filename : null)

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('photo mockups: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  for (const row of ROWS) {
    const found = await payload.find({ collection: 'projects', where: { slug: { equals: row.slug } }, limit: 1, depth: 1, req })
    const p = found.docs[0]
    const gallery = p?.gallery ?? []
    if (!p || fileOf(gallery[0]) !== row.first) continue
    const photo = await payload.create({ collection: 'media', data: { alt: row.alt }, filePath: path.join(DIR, `${row.slug}-photo.jpg`), req })
    await payload.update({ collection: 'projects', id: p.id, data: { gallery: [photo.id, ...gallery.map(idOf)] }, req })
    payload.logger.info(`photo mockups: ${row.slug}`)
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  for (const row of ROWS) {
    const found = await payload.find({ collection: 'projects', where: { slug: { equals: row.slug } }, limit: 1, depth: 1, req })
    const p = found.docs[0]
    const gallery = p?.gallery ?? []
    // Payload may add a numeric suffix to the uploaded name (x-photo-1.jpg)
    if (!p || !fileOf(gallery[0])?.startsWith(`${row.slug}-photo`)) continue
    await payload.update({ collection: 'projects', id: p.id, data: { gallery: gallery.slice(1).map(idOf) }, req })
  }
}
