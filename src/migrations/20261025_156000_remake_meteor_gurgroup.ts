import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Meteor Center and GurGroup had Ravit's earlier mockups; she asked for new ones under the image rule too (brand-colour
// mockup + two landscape screens). Same guard as remake_project_images: only while hero and gallery are unchanged.
const DIR = path.resolve(process.cwd(), 'media-import/remake')
const ITEMS: { slug: string; hero: string; alts: string[]; heroAlt: string; galleryAlts: [string, string] }[] = [
  {
    "slug": "meteor-center",
    "hero": "Mockup-meteor.jpg",
    "alts": [
      "מסך 1 מתוך האתר של מרכז קהילתי מטאור",
      "מסך 2 מתוך האתר של מרכז קהילתי מטאור",
      ""
    ],
    "heroAlt": "שלושה עמודים מהאתר של מרכז קהילתי מטאור, מוערמים בזווית",
    "galleryAlts": [
      "מרכז קהילתי מטאור: הגג והמבנה, לצד \"קרא עוד\" על המרכז",
      "בניין מרכז קהילתי מטאור בהרצליה"
    ]
  },
  {
    "slug": "gurgroup",
    "hero": "card-mockup-gurgroup.jpg",
    "alts": [
      "מסך 1 מתוך האתר של קבוצת גור ביטוח",
      "מסך 2 מתוך האתר של קבוצת גור ביטוח",
      "מסך 3 מתוך האתר של קבוצת גור ביטוח",
      ""
    ],
    "heroAlt": "האתר של קבוצת גור ביטוח בתצוגת נייד, על שלושה טלפונים",
    "galleryAlts": [
      "עמוד הבית של קבוצת גור: \"איזה שירות מתאים לך?\"",
      "תחומי הביטוח של קבוצת גור, בכרטיסים"
    ]
  }
]

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('remake: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')
  for (const it of ITEMS) {
    const found = await payload.find({ collection: 'projects', where: { slug: { equals: it.slug } }, depth: 1, limit: 1, req })
    const p = found.docs[0]
    if (!p) continue
    const hero = typeof p.hero === 'object' ? p.hero : null
    const alts = (p.gallery ?? []).map((g) => (typeof g === 'object' ? g.alt : null))
    const untouched = hero?.filename === it.hero && alts.length === it.alts.length && alts.every((a, i) => a === it.alts[i])
    if (!untouched) {
      payload.logger.info(`remake: ${it.slug} was edited in the admin, left as is`)
      continue
    }
    const add = async (file: string, alt: string) =>
      (await payload.create({ collection: 'media', data: { alt }, filePath: path.join(DIR, it.slug, file), req })).id
    const heroId = await add(`${it.slug}-01-mockup.jpg`, it.heroAlt)
    const g1 = await add(`${it.slug}-02.jpg`, it.galleryAlts[0])
    const g2 = await add(`${it.slug}-03.jpg`, it.galleryAlts[1])
    await payload.update({ collection: 'projects', id: p.id, data: { hero: heroId, gallery: [g1, g2] }, req })
    payload.logger.info(`remake: ${it.slug} updated`)
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('remake: down is a no-op (the previous images are still in the media library)')
}
