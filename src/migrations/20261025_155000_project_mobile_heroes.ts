import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Portrait heroes for mobile (Ravit, 2026-10-25): every project gets a 1080×1920 mockup in its brand colours with the
// phone in the middle, clear of the title at the bottom (generator: media-import/mockup/remake/, PORTRAIT=1). Set only
// where the project has no mobile hero yet; same Blob-token guard as the other media imports.
const DIR = path.resolve(process.cwd(), 'media-import/remake')
const ITEMS: { slug: string; alt: string }[] = [
  {
    "slug": "meteor-center",
    "alt": "מרכז קהילתי מטאור בתצוגת נייד"
  },
  {
    "slug": "gurgroup",
    "alt": "קבוצת גור ביטוח בתצוגת נייד"
  },
  {
    "slug": "helios",
    "alt": "הליוס בתצוגת נייד"
  },
  {
    "slug": "recanati",
    "alt": "רקנאטי בתצוגת נייד"
  },
  {
    "slug": "samurai",
    "alt": "סמוראי בתצוגת נייד"
  },
  {
    "slug": "barantech",
    "alt": "ברנטק בתצוגת נייד"
  },
  {
    "slug": "benny-goren",
    "alt": "בני גורן בתצוגת נייד"
  },
  {
    "slug": "margalit",
    "alt": "מרגלית בתצוגת נייד"
  },
  {
    "slug": "agur",
    "alt": "עגור בתצוגת נייד"
  },
  {
    "slug": "gordon-pool",
    "alt": "בריכת גורדון בתצוגת נייד"
  },
  {
    "slug": "firon",
    "alt": "פירון בתצוגת נייד"
  },
  {
    "slug": "vinspiration",
    "alt": "וינספיריישן בתצוגת נייד"
  },
  {
    "slug": "studio-gur",
    "alt": "סטודיו גור בתצוגת נייד"
  },
  {
    "slug": "3-bears",
    "alt": "שלושת הדובים בתצוגת נייד"
  },
  {
    "slug": "little-fences",
    "alt": "גדרות קטנות בתצוגת נייד"
  },
  {
    "slug": "boutique77",
    "alt": "בוטיק 77 בתצוגת נייד"
  },
  {
    "slug": "enosh",
    "alt": "אנוש בתצוגת נייד"
  },
  {
    "slug": "moa-winery",
    "alt": "יקב מואה בתצוגת נייד"
  },
  {
    "slug": "mosessco",
    "alt": "מוססקו בתצוגת נייד"
  },
  {
    "slug": "jullius",
    "alt": "יוליוס בתצוגת נייד"
  },
  {
    "slug": "winecase",
    "alt": "ווין קייס בתצוגת נייד"
  },
  {
    "slug": "teo",
    "alt": "תאו בתצוגת נייד"
  },
  {
    "slug": "netofa",
    "alt": "נטופה בתצוגת נייד"
  },
  {
    "slug": "our-kitchen",
    "alt": "המטבח שלנו בתצוגת נייד"
  },
  {
    "slug": "mybase",
    "alt": "MyBase בתצוגת נייד"
  },
  {
    "slug": "delivery-app",
    "alt": "מערכת ניהול המשלוחים בתצוגת נייד"
  },
  {
    "slug": "client-portal",
    "alt": "פורטל הלקוחות בתצוגת נייד"
  }
]

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('mobile heroes: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')
  for (const it of ITEMS) {
    const found = await payload.find({ collection: 'projects', where: { slug: { equals: it.slug } }, depth: 0, limit: 1, req })
    const p = found.docs[0]
    if (!p || p.heroMobile) continue
    const media = await payload.create({ collection: 'media', data: { alt: it.alt }, filePath: path.join(DIR, it.slug, `${it.slug}-00-mobile.jpg`), req })
    await payload.update({ collection: 'projects', id: p.id, data: { heroMobile: media.id }, req })
    payload.logger.info(`mobile heroes: ${it.slug} set`)
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('mobile heroes: down is a no-op (the images stay in the media library)')
}
