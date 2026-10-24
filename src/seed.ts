/**
 * Sample content so the site has something to show on first run.
 * Run once (locally):  LOCAL_PGLITE=1 npm run seed
 * Never on the live site: it only adds missing items, but the sample texts are placeholders.
 * Safe to re-run: existing projects/pages (by slug) are skipped.
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const projects = [
  { slug: 'jullius', title: 'יוליוס', nameEn: 'JULLIUS', field: 'מזקקה', scope: 'אתר תדמית וחנות מקוונת', platform: 'WordPress · WooCommerce',
    lead: 'אתר דו־לשוני למזקקה, עם חנות שמחוברת לקטלוג המוצרים ומעבר חלק בין עברית לאנגלית.',
    statement: 'חנות שמרגישה כמו *המזקקה* עצמה.', siteUrl: 'https://jullius.com', bg: '#1b2a24', ink: '#e9dcc0', accent: '#c8953f' },
  { slug: 'mosessco', title: 'מוססקו', nameEn: 'MOSESSCO', field: 'משרד אדריכלים', scope: 'אתר תדמית ותיק עבודות', platform: 'WordPress · Elementor',
    lead: 'תיק עבודות לאדריכלים שבו התמונות מובילות, והטקסט נותן להן מקום.',
    statement: 'קווים נקיים, *הרבה* אוויר.', siteUrl: 'https://mosessco.com', bg: '#e6e3dc', ink: '#1d1c1a', accent: '#a3432a' },
  { slug: 'margalit', title: 'מרגלית', nameEn: 'MARGALIT', field: 'יקב', scope: 'אתר יקב וחנות יין', platform: 'WordPress · WooCommerce',
    lead: 'אתר יקב עם חנות מקוונת, שבנוי כדי להפוך ביקור באתר להזמנה.',
    statement: 'מהכרם *לסל* בשלוש גלילות.', bg: '#3a0f1c', ink: '#f3e6e0', accent: '#e0a96d' },
  { slug: 'recanati', title: 'רקנאטי', nameEn: 'RECANATI', field: 'יקב', scope: 'אתר תדמית', platform: 'WordPress',
    lead: 'אתר תדמית ליקב, עם מבנה תוכן ברור לסדרות היין ולסיפור היקב.',
    statement: 'כל סדרה מקבלת *במה* משלה.', bg: '#0f2a3a', ink: '#e7eef0', accent: '#7fc4c9' },
  { slug: 'vinspiration', title: 'וינספיריישן', nameEn: 'VINSPIRATION', field: 'תיירות יין וקולינריה', scope: 'אתר תדמית וטפסי הרשמה', platform: 'WordPress · Elementor',
    lead: 'אתר למסעות יין וקולינריה, עם עמודי טיולים וטפסים שמובילים לשיחה.',
    statement: 'מסע שמתחיל *בגלילה*.', siteUrl: 'https://vinspiration.wine', bg: '#4b5a2a', ink: '#f1efe2', accent: '#e7c75a' },
]

const para = (text: string) => ({
  type: 'paragraph', version: 1, direction: 'rtl' as const, format: '' as const, indent: 0, textFormat: 0, textStyle: '',
  children: [{ type: 'text', version: 1, text, format: 0, style: '', mode: 'normal' as const, detail: 0 }],
})
const doc = (...texts: string[]) => ({
  root: { type: 'root', version: 1, direction: 'rtl' as const, format: '' as const, indent: 0, children: texts.map(para) },
})

const pages = [
  { slug: 'accessibility', title: 'הצהרת נגישות',
    content: doc('[להשלמה] פרטי ההצהרה: רמת ההתאמה, תאריך הבדיקה ודרכי פנייה לרכז/ת הנגישות.') },
  { slug: 'privacy-policy', title: 'מדיניות פרטיות',
    content: doc('[להשלמה] מדיניות הפרטיות.') },
]

async function seed() {
  const payload = await getPayload({ config })

  for (const p of projects) {
    const exists = await payload.find({ collection: 'projects', where: { slug: { equals: p.slug } }, limit: 1 })
    if (exists.docs.length) continue
    await payload.create({ collection: 'projects', data: { ...p, featured: true } })
    payload.logger.info(`project: ${p.title}`)
  }

  for (const pg of pages) {
    const exists = await payload.find({ collection: 'pages', where: { slug: { equals: pg.slug } }, limit: 1 })
    if (exists.docs.length) continue
    // The texts are placeholders ("[להשלמה]") — fill them in before launch.
    await payload.create({ collection: 'pages', data: { ...pg, inFooter: true } })
    payload.logger.info(`page: ${pg.title}`)
  }

  // Save the globals once so their default values are stored.
  await payload.updateGlobal({ slug: 'home', data: {} })
  await payload.updateGlobal({ slug: 'settings', data: {} })
  payload.logger.info('done')
}

await seed()
process.exit(0)
