import path from 'path'
import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// Ravit (2026-10-29): the nine new sites on her list, each with its brand-book mockups (media-import/new26, made by
// mockup26.js from fresh captures), three screenshots for the gallery, a category and its place in her order (the
// free keys left by projects_2026). Texts are drafts from each site's own words, for her to edit in the admin.
// A project is added only if its slug is not taken yet. Same Blob-token guard as the other media imports.
const DIR = path.resolve(process.cwd(), 'media-import/new26')

type Row = {
  slug: string
  order: string
  title: string
  nameEn: string
  category: string
  field: string
  scope: string
  platform: string
  lead: string
  statement: string
  siteUrl: string
}

const ROWS: Row[] = [
  {
    slug: 'amphora',
    order: 'a2',
    title: 'יקב אמפורה',
    nameEn: 'AMPHORAE',
    category: 'יין ואוכל',
    field: 'יקב',
    scope: 'אתר תדמית וחנות מקוונת',
    platform: 'WordPress · WooCommerce',
    lead: 'אתר וחנות ליקב אמפורה, יקב פרימיום ברכס הכרמל המערבי שמייצר יין כבר יותר מרבע מאה. סדרות היין, מארזים, קהילת היין ואירועים ביקב, באתר אחד שמוביל מהסיפור אל הבקבוק.',
    statement: 'יין מהכרמל, *מאז שנות ה־90*.',
    siteUrl: 'https://amphoraewines.com/',
  },
  {
    slug: 'lotem',
    order: 'a3',
    title: 'יקב לוטם',
    nameEn: 'LOTEM',
    category: 'יין ואוכל',
    field: 'יקב בוטיק אורגני',
    scope: 'אתר תדמית וחנות מקוונת',
    platform: 'WordPress · WooCommerce',
    lead: 'אתר וחנות ליקב לוטם, היקב האורגני הגדול בישראל, בקיבוץ לוטם שבגליל. הזמנת מקום לביקור, אירועים, מועדון היקב וחנות, עם הרבה מקום לטבע שמסביב.',
    statement: 'הכי קרוב *לטבע*.',
    siteUrl: 'https://lotemwinery.co.il/',
  },
  {
    slug: 'shikui',
    order: 'a4',
    title: 'שיקוי',
    nameEn: 'SHIKUI',
    category: 'עיצוב, ספרים ואופנה',
    field: 'רפואת צמחים',
    scope: 'אתר תדמית וחנות מקוונת',
    platform: 'WordPress · WooCommerce',
    lead: 'אתר וחנות לשיקוי, תערובות צמחים שנרקחו כדי להקל במצבים של היומיום. כל שיקוי מקבל עמוד משלו, לצד הסבר על הצמחים ואפשרות להזמין שיקוי אישי.',
    statement: 'צמחים *שמשנים*.',
    siteUrl: 'https://shikui.co.il/',
  },
  {
    slug: 'pauker',
    order: 'a6',
    title: 'יקב פאוקר',
    nameEn: 'PAUKER',
    category: 'יין ואוכל',
    field: 'יקב בוטיק',
    scope: 'אתר תדמית וחנות מקוונת',
    platform: 'WordPress · WooCommerce',
    lead: 'אתר וחנות ליקב פאוקר מניר עוז, יקב משפחתי שהקימו ילדיו ונכדיו של גדעון פאוקר ז״ל אחרי השבעה באוקטובר, כהמשך לדרכו. הסיפור, הכרם, אירועים ביקב, מועדון לקוחות ומכירה לעסקים.',
    statement: 'סיפור על אדמה, שורשים *ויכולת לקום מחדש*.',
    siteUrl: 'https://pauker.co.il/',
  },
  {
    slug: 'nene-royal',
    order: 'a7',
    title: 'ננה רויאל',
    nameEn: 'NENE ROYAL',
    category: 'תרבות וקהילה',
    field: 'מוזיקאית',
    scope: 'אתר אמנית וחנות',
    platform: 'WordPress · WooCommerce',
    lead: 'אתר באנגלית לננה רויאל, גיטריסטית וזמרת מפוקט שזכתה להכרה בינלאומית בעונה 21 של America’s Got Talent. מוזיקה, ביוגרפיה, מועדון מעריצים וחנות רשמית.',
    statement: 'גיטרה, רוק *ובמה*.',
    siteUrl: 'https://neneroyal.com/',
  },
  {
    slug: 'rachashei-lev',
    order: 'aB',
    title: 'רחשי לב',
    nameEn: 'RACHASHEI LEV',
    category: 'תרבות וקהילה',
    field: 'עמותה',
    scope: 'אתר עמותה',
    platform: 'WordPress',
    lead: 'אתר לעמותת רחשי לב, שמלווה ילדים המתמודדים עם סרטן ואת משפחותיהם. פרוטוקול ההחלמה של העמותה, מרכז מידע וזכויות, סיפורי הצלחה ודרכים לתרום ולאמץ פרויקט.',
    statement: 'מה שהלב שלהם באמת צריך *מתחיל כאן*.',
    siteUrl: 'https://rachasheilev.check-it.co.il/',
  },
  {
    slug: 'hamesila',
    order: 'aC',
    title: 'המסילה',
    nameEn: 'HAMESILA',
    category: 'תרבות וקהילה',
    field: 'בית תרבות וקהילה',
    scope: 'אתר תדמית',
    platform: 'WordPress',
    lead: 'אתר למסילה, בית לתרבות, פנאי וקהילה בהרצליה. קורסים וסדנאות, מחול ואמנויות הבמה, אירועים על הגג והשכרת חללים, וכל תחנה במסילה מקבלת מקום משלה.',
    statement: 'מקום שמחבר בין יצירה, תרבות *ואנשים*.',
    siteUrl: 'https://hamesila.org.il/',
  },
  {
    slug: 'tushia',
    order: 'aD',
    title: 'יקב תושיה',
    nameEn: 'TUSHIA',
    category: 'יין ואוכל',
    field: 'משק ויקב בוטיק',
    scope: 'אתר תדמית וחנות מקוונת',
    platform: 'WordPress · WooCommerce',
    lead: 'אתר וחנות למשק ויקב תושיה בבאר מילכה, בין דיונות החול של הנגב. יין בוטיק ושמן זית אורגני, סיורים בין הכרמים, העשייה החינוכית של המשק ותיאום ביקור.',
    statement: 'יין ושמן זית *מהמדבר*.',
    siteUrl: 'https://tushia.co.il/',
  },
  {
    slug: 'udi-fish',
    order: 'aG',
    title: 'אודי דגים',
    nameEn: 'UDI FISH',
    category: 'יין ואוכל',
    field: 'חנות דגים',
    scope: 'חנות מקוונת עם משלוחים',
    platform: 'WordPress · WooCommerce',
    lead: 'חנות מקוונת לאודי בכור דגים, דגי ים ובריכות טריים. הזמנה לפי שעת משלוח או איסוף עצמי, דגים טריים, קפואים ומעושנים, ומשלוחים מהיום להיום.',
    statement: 'דגים טריים, *יום יום*.',
    siteUrl: 'https://udifish.check-it.co.il/',
  },
]

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('new projects 2026: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  for (const r of ROWS) {
    const taken = await payload.find({ collection: 'projects', where: { slug: { equals: r.slug } }, limit: 1, req })
    if (taken.docs.length) continue
    const cat = (await payload.find({ collection: 'categories', where: { title: { equals: r.category } }, limit: 1, req })).docs[0]
    const media = async (file: string, alt: string) =>
      (await payload.create({ collection: 'media', data: { alt }, filePath: path.join(DIR, file), req })).id
    const hero = await media(`${r.slug}-2026.webp`, `האתר של ${r.title} במחשב ובטלפון, על רקע משטחים צבועים`)
    const heroMobile = await media(`${r.slug}-2026-m.webp`, `האתר של ${r.title} בטלפון, על רקע משטחים צבועים`)
    const gallery = [
      await media(`${r.slug}-01.webp`, `עמוד הבית של ${r.title}`),
      await media(`${r.slug}-02.webp`, `מתוך האתר של ${r.title}`),
      await media(`${r.slug}-03.webp`, `מתוך האתר של ${r.title}`),
    ]
    const p = await payload.create({
      collection: 'projects',
      data: {
        title: r.title,
        slug: r.slug,
        nameEn: r.nameEn,
        field: r.field,
        scope: r.scope,
        platform: r.platform,
        lead: r.lead,
        statement: r.statement,
        siteUrl: r.siteUrl,
        category: cat?.id,
        featured: true,
        hero,
        heroMobile,
        gallery,
        bg: '#f8f7f9',
        ink: '#1c0f30',
        accent: '#ff2d83',
      },
      req,
    })
    await db.execute(sql`UPDATE "projects" SET "_order" = ${r.order} WHERE "id" = ${p.id}`)
    payload.logger.info(`new projects 2026: ${r.slug}`)
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  for (const r of ROWS) await payload.delete({ collection: 'projects', where: { slug: { equals: r.slug } }, req })
}
