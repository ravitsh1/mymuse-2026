import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// The apps Ravit built and approved for public display (2026-10-25): MyBase, the delivery-management system and the
// MyMuse client portal, under a new "אפליקציות ומערכות" category (last in the filter row). Screenshots are Ravit's own
// (demo data); the mockups follow her image rule. Each project is created once and skipped if its slug exists; the
// category is created only if missing. Same Blob-token guard as the other media imports.
const DIR = path.resolve(process.cwd(), 'media-import/remake')
const CATEGORY = 'אפליקציות ומערכות'

type App = {
  slug: string
  images: [string, string, string] // alts: mockup, screen 2, screen 3
  data: {
    title: string
    nameEn: string
    field: string
    scope: string
    platform: string
    lead: string
    statement: string
    bg: string
    ink: string
    accent: string
  }
}

const APPS: App[] = [
  {
    slug: 'mybase',
    images: [
      'MyBase על שלושה טלפונים: משימות, לוח הבית וכספים',
      'מסך הכספים ב־MyBase: הכנסות, הוצאות ותקציב לפי קטגוריה',
      'לוח השנה החודשי ב־MyBase, עם המשימות והתזכורות',
    ],
    data: {
      title: 'MyBase',
      nameEn: 'MYBASE',
      field: 'אפליקציה לניהול העסק והבית',
      scope: 'אפיון, עיצוב ופיתוח אפליקציה',
      platform: 'אפליקציית ווב · מחשב ונייד',
      lead: 'MyBase מרכזת במקום אחד את כל מה שמנהלים ביום־יום: משימות, לוח שנה, לקוחות ואנשי קשר, מעקב שעות, כספים ודוחות, תזכורות ורשימות. בכספים אפשר לייבא תנועות מ־Morning ולראות תקציב לפי קטגוריה, ובמעקב השעות יש טיימר שמתחבר ישר ללקוח. לצד המצב העסקי יש מצב משפחתי, עם רשימת קניות, תזכורות ותקציב הבית.',
      statement: 'כל מה שמנהלים ביום־יום, *במקום אחד*.',
      bg: '#1f3d2c',
      ink: '#f5ebe0',
      accent: '#f26a2e',
    },
  },
  {
    slug: 'delivery-app',
    images: [
      'אפליקציית המשלוחים על שלושה טלפונים: לוח הבית, הקו של הנהג ואריזה למחר',
      'רשימת ההזמנות במערכת המשלוחים, עם סטטוס לכל הזמנה',
      'קליטת הזמנה מהמייל: ה־AI קורא את מסמך ההזמנה וממלא אותה',
    ],
    data: {
      title: 'ניהול משלוחים',
      nameEn: 'DELIVERY',
      field: 'מערכת לניהול הפצה',
      scope: 'אפיון, עיצוב ופיתוח מערכת ואפליקציה לנהגים',
      platform: 'אפליקציית ווב · AI',
      lead: 'מערכת שמנהלת את כל שרשרת ההפצה. ההזמנות נקלטות ישירות מהמייל: AI קורא את מסמך ההזמנה וממלא אותה לבד, ונשאר רק לאשר. משם הן משובצות לקווי חלוקה לפי אזור, נארזות לפי רשימה מסודרת ויוצאות לדרך. לנהג יש אפליקציה משלו, עם סדר העצירות, ניווט ב־Waze, חיוג ללקוח ואישור מסירה בלחיצה, ובמשרד רואים בכל רגע מה כבר נמסר ומה עוד בדרך.',
      statement: 'מההזמנה במייל ועד *המסירה בדלת*.',
      bg: '#3d353b',
      ink: '#f5ebe0',
      accent: '#c0703a',
    },
  },
  {
    slug: 'client-portal',
    images: [
      'פורטל הלקוחות בחלון דפדפן ועל טלפון',
      'סבב תיקונים בפורטל: צילומי מסך והערות לכל פריט',
      'ניהול סבב התיקונים בממשק הניהול של הפורטל',
    ],
    data: {
      title: 'פורטל לקוחות',
      nameEn: 'CLIENT PORTAL',
      field: 'פורטל לקוחות למעקב אחרי פרויקטים',
      scope: 'אפיון, עיצוב ופיתוח',
      platform: 'אפליקציית ווב',
      lead: 'הפורטל שבו הלקוחות שלנו עוקבים אחרי הפרויקט שלהם: איפה אנחנו עומדים, מה אנחנו צריכים מהם, סבבי תיקונים עם צילומי מסך והערות לכל פריט, קבצים והודעות במקום אחד ולוח תשלומים לפי אבני דרך. בממשק הניהול פותחים פרויקט, מעלים צילומי מסך לסבב ומנהלים משתמשים והרשאות. כך כל העדכונים, השאלות והאישורים נשארים מסודרים, במקום להתפזר במיילים ובוואטסאפ.',
      statement: 'כל הפרויקט, *במבט אחד*.',
      bg: '#15171a',
      ink: '#f5ebe0',
      accent: '#f26b6b',
    },
  },
]

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const existing = await payload.find({
    collection: 'projects',
    where: { slug: { in: APPS.map((a) => a.slug) } },
    limit: APPS.length,
    depth: 0,
    req,
  })
  const have = new Set(existing.docs.map((d) => d.slug))
  const todo = APPS.filter((a) => !have.has(a.slug))
  if (!todo.length) return payload.logger.info('apps: all projects already exist')

  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('apps: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  const found = await payload.find({ collection: 'categories', where: { title: { equals: CATEGORY } }, limit: 1, depth: 0, req })
  const category = found.docs[0]?.id ?? (await payload.create({ collection: 'categories', data: { title: CATEGORY }, req })).id

  for (const app of todo) {
    const add = async (file: string, alt: string) =>
      (await payload.create({ collection: 'media', data: { alt }, filePath: path.join(DIR, app.slug, file), req })).id
    const hero = await add(`${app.slug}-01-mockup.jpg`, app.images[0])
    const g1 = await add(`${app.slug}-02.jpg`, app.images[1])
    const g2 = await add(`${app.slug}-03.jpg`, app.images[2])
    await payload.create({
      collection: 'projects',
      req,
      data: { ...app.data, slug: app.slug, featured: true, hidden: false, category, hero, gallery: [g1, g2] },
    })
    payload.logger.info(`apps: ${app.slug} created`)
  }
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.delete({ collection: 'projects', where: { slug: { in: APPS.map((a) => a.slug) } }, req })
  await payload.delete({ collection: 'categories', where: { title: { equals: CATEGORY } }, req })
}
