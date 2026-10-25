import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Ravit's image rule (see the skill) for the 15 projects still showing the old-site import: a main mockup in the
// project's own brand colours (generator in media-import/mockup/remake/) and two landscape screens of the live site.
// Each project changes only while its hero and gallery are still exactly the import's; the old media stays in the
// library. Barantech, Benny Goren, Firon and Boutique 77 block automated capture and keep their images.
const DIR = path.resolve(process.cwd(), 'media-import/remake')
const ITEMS: { slug: string; hero: string; alts: string[]; heroAlt: string; galleryAlts: [string, string] }[] = [
  {
    "slug": "helios",
    "hero": "Mockup3-helios.jpg",
    "alts": [
      "מסך 1 מתוך האתר של הליוס",
      "מסך 2 מתוך האתר של הליוס",
      "מסך 3 מתוך האתר של הליוס"
    ],
    "heroAlt": "האתר של הליוס על מסך לפטופ ועל טלפון",
    "galleryAlts": [
      "עמוד הבית של הליוס: \"What is Helios?\" ומטיל פלדה מעל כדור הארץ",
      "מדור Knowledge Booster באתר הליוס"
    ]
  },
  {
    "slug": "recanati",
    "hero": "recanati-2-scaled.jpg",
    "alts": [
      "מסך 1 מתוך האתר של רקנאטי",
      "מסך 2 מתוך האתר של רקנאטי",
      "מסך 3 מתוך האתר של רקנאטי"
    ],
    "heroAlt": "האתר של רקנאטי בחלון דפדפן ועל טלפון",
    "galleryAlts": [
      "קולאז׳ תמונות ושערי ניווט באתר רקנאטי",
      "עמוד \"בואו לבקר אותנו\" באתר רקנאטי"
    ]
  },
  {
    "slug": "samurai",
    "hero": "Samurai-4-scaled.jpg",
    "alts": [
      "מסך 1 מתוך האתר של סמוראי",
      "מסך 2 מתוך האתר של סמוראי",
      "מסך 3 מתוך האתר של סמוראי"
    ],
    "heroAlt": "האתר של סמוראי בתצוגת נייד, על שלושה טלפונים",
    "galleryAlts": [
      "סליידר הלקוחות \"A Boost of Partnership\" באתר סמוראי",
      "השירותים של סמוראי ו־\"Nice to meet us\""
    ]
  },
  {
    "slug": "margalit",
    "hero": "Margalit_Vertical_Tasting_Bottles-1-1.jpg",
    "alts": [
      "מסך 1 מתוך האתר של מרגלית",
      "מסך 2 מתוך האתר של מרגלית",
      "מסך 3 מתוך האתר של מרגלית"
    ],
    "heroAlt": "שלושה עמודים מהאתר של מרגלית, מוערמים בזווית",
    "galleryAlts": [
      "חנות היין והמדורים של יקב מרגלית",
      "גלריית התמונות של יקב מרגלית"
    ]
  },
  {
    "slug": "agur",
    "hero": "agur-bg.jpg",
    "alts": [
      "מסך 1 מתוך האתר של עגור",
      "מסך 2 מתוך האתר של עגור",
      "מסך 3 מתוך האתר של עגור"
    ],
    "heroAlt": "האתר של עגור בחלון דפדפן ועל טלפון",
    "galleryAlts": [
      "אנשי היקב באתר עגור",
      "גלריית התמונות באתר עגור"
    ]
  },
  {
    "slug": "gordon-pool",
    "hero": "gordon-One-screen-1.jpg",
    "alts": [
      "מסך 1 מתוך האתר של בריכת גורדון",
      "מסך 2 מתוך האתר של בריכת גורדון",
      "מסך 3 מתוך האתר של בריכת גורדון"
    ],
    "heroAlt": "האתר של בריכת גורדון בחלון דפדפן ועל טלפון",
    "galleryAlts": [
      "צוות המנהלים באתר בריכת גורדון",
      "מסעדת סטולרו והמנויים הממליצים באתר בריכת גורדון"
    ]
  },
  {
    "slug": "vinspiration",
    "hero": "vinspiration-mockup.jpg",
    "alts": [
      "מסך 1 מתוך האתר של וינספיריישן",
      "מסך 2 מתוך האתר של וינספיריישן",
      "מסך 3 מתוך האתר של וינספיריישן"
    ],
    "heroAlt": "האתר של וינספיריישן בחלון דפדפן ועל טלפון",
    "galleryAlts": [
      "כרטיסי הטיולים הקרובים באתר וינספיריישן",
      "טיולים נוספים ותחתית האתר של וינספיריישן"
    ]
  },
  {
    "slug": "studio-gur",
    "hero": "itramar-mockup.jpg",
    "alts": [
      "מסך 1 מתוך האתר של סטודיו גור",
      "מסך 2 מתוך האתר של סטודיו גור",
      "מסך 3 מתוך האתר של סטודיו גור"
    ],
    "heroAlt": "האתר של סטודיו גור על מסך לפטופ ועל טלפון",
    "galleryAlts": [
      "גלריית העבודות של סטודיו גור",
      "עבודות מיתוג ליין באתר סטודיו גור"
    ]
  },
  {
    "slug": "enosh",
    "hero": "enosh2-1.jpg",
    "alts": [
      "מסך 1 מתוך האתר של אנוש",
      "מסך 2 מתוך האתר של אנוש",
      "מסך 3 מתוך האתר של אנוש"
    ],
    "heroAlt": "האתר של אנוש על מסך לפטופ ועל טלפון",
    "galleryAlts": [
      "אנוש במספרים, לצד \"מי אנחנו\"",
      "כרטיסי תוכן וחדשות באתר אנוש"
    ]
  },
  {
    "slug": "moa-winery",
    "hero": "moa1.jpg",
    "alts": [
      "מסך 1 מתוך האתר של יקב מואה",
      "מסך 2 מתוך האתר של יקב מואה",
      "מסך 3 מתוך האתר של יקב מואה"
    ],
    "heroAlt": "שלושה עמודים מהאתר של יקב מואה, מוערמים בזווית",
    "galleryAlts": [
      "חנות היין באתר יקב מואה",
      "עמוד \"הכרם המדברי\" באתר יקב מואה"
    ]
  },
  {
    "slug": "mosessco",
    "hero": "mosessco-tablet-screen.jpg",
    "alts": [
      "מסך 1 מתוך האתר של מוססקו",
      "מסך 2 מתוך האתר של מוססקו",
      "מסך 3 מתוך האתר של מוססקו"
    ],
    "heroAlt": "האתר של מוססקו בתצוגת נייד, על שלושה טלפונים",
    "galleryAlts": [
      "עמוד הפרויקטים של מוססקו, לפי תחומים",
      "פרויקטים של מוססקו: משרדים, מגורים, מבני ציבור ופנים"
    ]
  },
  {
    "slug": "jullius",
    "hero": "MyMuse_1920s.jpg",
    "alts": [
      "מסך 1 מתוך האתר של יוליוס",
      "מסך 2 מתוך האתר של יוליוס",
      "מסך 3 מתוך האתר של יוליוס"
    ],
    "heroAlt": "האתר של יוליוס בחלון דפדפן ועל טלפון",
    "galleryAlts": [
      "המוצרים של יוליוס באתר",
      "גלריית התמונות מהמזקקה באתר יוליוס"
    ]
  },
  {
    "slug": "winecase",
    "hero": "winecase1.jpg",
    "alts": [
      "מסך 1 מתוך האתר של ווין קייס",
      "מסך 2 מתוך האתר של ווין קייס",
      "מסך 3 מתוך האתר של ווין קייס"
    ],
    "heroAlt": "האתר של ווין קייס על מסך לפטופ ועל טלפון",
    "galleryAlts": [
      "\"איך זה עובד?\" באתר ווין קייס",
      "היינות וסדנאות היין באתר ווין קייס"
    ]
  },
  {
    "slug": "teo",
    "hero": "teo.jpg",
    "alts": [
      "מסך 1 מתוך האתר של תאו",
      "מסך 2 מתוך האתר של תאו",
      "מסך 3 מתוך האתר של תאו",
      "מסך 4 מתוך האתר של תאו"
    ],
    "heroAlt": "האתר של תאו בתצוגת נייד, על שלושה טלפונים",
    "galleryAlts": [
      "\"עכשיו בתאו\": אירועים קרובים",
      "תחומי הפעילות של מרכז התרבות תאו"
    ]
  },
  {
    "slug": "netofa",
    "hero": "netofa3.jpg",
    "alts": [
      "מסך 1 מתוך האתר של נטופה",
      "מסך 2 מתוך האתר של נטופה",
      "מסך 3 מתוך האתר של נטופה"
    ],
    "heroAlt": "שלושה עמודים מהאתר של נטופה, מוערמים בזווית",
    "galleryAlts": [
      "היינות של נטופה באתר",
      "עמוד \"הכרמים שלנו\" באתר נטופה"
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
