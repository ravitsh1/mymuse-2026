import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// The last four projects on old-site imports (their sites block automated capture): Ravit took the screenshots, the
// mockups are in each brand's colours (media-import/mockup/remake/). Same guard as remake_project_images: a project
// changes only while its hero and gallery are still exactly the import's; the old media stays in the library.
const DIR = path.resolve(process.cwd(), 'media-import/remake')
const ITEMS: { slug: string; hero: string; alts: string[]; heroAlt: string; galleryAlts: [string, string] }[] = [
  {
    "slug": "benny-goren",
    "hero": "rv_bg3.jpg",
    "alts": [
      "מסך 1 מתוך האתר של בני גורן",
      "מסך 2 מתוך האתר של בני גורן",
      "מסך 3 מתוך האתר של בני גורן"
    ],
    "heroAlt": "האתר של בני גורן על מסך לפטופ ועל טלפון",
    "galleryAlts": [
      "עמוד הבית של בני גורן: חוברות הכנה לבגרות במתמטיקה",
      "ספרי המתמטיקה של בני גורן לפי כיתות"
    ]
  },
  {
    "slug": "barantech",
    "hero": "brn_i.jpg",
    "alts": [
      "מסך 1 מתוך האתר של ברנטק",
      "מסך 2 מתוך האתר של ברנטק",
      "מסך 3 מתוך האתר של ברנטק",
      "מסך 4 מתוך האתר של ברנטק",
      "מסך 5 מתוך האתר של ברנטק",
      "מסך 6 מתוך האתר של ברנטק"
    ],
    "heroAlt": "האתר של ברנטק בחלון דפדפן ועל טלפון",
    "galleryAlts": [
      "עמוד הבית של ברנטק: מתגי פיזו, ובשורה התחתונה החברה במספרים",
      "\"Why Barantech?\" והמוצרים של ברנטק"
    ]
  },
  {
    "slug": "firon",
    "hero": "0001s_0002_Layer-5.jpg",
    "alts": [
      "מסך 1 מתוך האתר של פירון",
      "מסך 2 מתוך האתר של פירון",
      "מסך 3 מתוך האתר של פירון"
    ],
    "heroAlt": "האתר של פירון על מסך לפטופ ועל טלפון",
    "galleryAlts": [
      "עמוד הבית של פירון: \"Our people make the difference\" והמשרד במספרים",
      "עמוד הצוות באתר פירון, עם חיפוש לפי שם, תחום וסניף"
    ]
  },
  {
    "slug": "boutique77",
    "hero": "0000s_0000_Layer-10.jpg",
    "alts": [
      "מסך 1 מתוך האתר של בוטיק 77",
      "מסך 2 מתוך האתר של בוטיק 77",
      "מסך 3 מתוך האתר של בוטיק 77"
    ],
    "heroAlt": "האתר של בוטיק 77 בחלון דפדפן ועל טלפון",
    "galleryAlts": [
      "עמוד הבית של בוטיק 77: קמפיין R13 New York",
      "בוטיק 77: המעצב Jerome Dreyfuss"
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
