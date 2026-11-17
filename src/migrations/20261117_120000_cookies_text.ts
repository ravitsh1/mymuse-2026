import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// Cookies (2026-11-17), after the launch on mymuse.co.il: say what the site really stores. Google Analytics (_ga,
// _ga_<id>), the VEE accessibility widget, the notice's own "ok"; no marketing cookies or Facebook pixel. Content only,
// and each text is replaced only while it is still the original placeholder, so Ravit's own edits are never overwritten.

type LexNode = { type: string; children?: LexNode[]; text?: string; [k: string]: unknown }

const text = (t: string): LexNode => ({ mode: 'normal', text: t, type: 'text', style: '', detail: 0, format: 0, version: 1 })
const p = (t: string): LexNode => ({ type: 'paragraph', format: '', indent: 0, version: 1, children: [text(t)], direction: 'rtl', textStyle: '', textFormat: 0 })

const OLD_NOTICE = 'אנו משתמשים בקבצי Cookies לשיפור חוויית הגלישה, ניתוח ושיווק. המשך גלישה באתר מהווה הסכמה לכך.'
const NOTICE =
  'אנו משתמשים בעוגיות (Cookies) למדידה סטטיסטית של השימוש באתר (Google Analytics) ולשמירת העדפות הנגישות שלכם. אין באתר עוגיות פרסום. המשך הגלישה באתר מהווה הסכמה לכך.'

const COOKIES: LexNode[] = [
  p('באתר נעשה שימוש בעוגיות (Cookies) ובאחסון מקומי בדפדפן, קבצים קטנים שנשמרים במכשיר שלכם:'),
  p(
    'Google Analytics (העוגיות _ga ו־_ga_4HWM6WRFMX): מדידה סטטיסטית של השימוש באתר, למשל אילו עמודים נצפו ומאיזה מקור הגעתם. העוגיות מזהות את הדפדפן במזהה אקראי, לא את זהותכם, ונשמרות עד שנתיים.',
  ),
  p('רכיב הנגישות של VEE: שומר במכשיר את העדפות התצוגה שבחרתם.'),
  p('אישור הודעת העוגיות: נשמר בדפדפן, כדי שההודעה לא תוצג לכם שוב.'),
  p(
    'אין באתר עוגיות פרסום או שיווק. אפשר לחסום או למחוק עוגיות בהגדרות הדפדפן, ולהפסיק את המדידה של Google Analytics באמצעות התוסף של Google: tools.google.com/dlpage/gaoptout.',
  ),
]
const ANALYTICS = p(
  'לניתוח סטטיסטי של השימוש באתר נעשה שימוש ב־Google Analytics של Google. המידע משמש להבנת השימוש באתר ולשיפורו, ולא לפרסום או לשיווק. השימוש בכלי זה כפוף גם למדיניות הפרטיות של Google.',
)

const has = (n: LexNode, s: string) => JSON.stringify(n).includes(s)

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const settings = await payload.findGlobal({ slug: 'settings', depth: 0, req })
  if ((settings.cookieText ?? '').trim() === OLD_NOTICE) {
    await payload.updateGlobal({ slug: 'settings', data: { cookieText: NOTICE }, depth: 0, req })
  }

  const res = await payload.find({ collection: 'pages', where: { slug: { equals: 'privacy-policy' } }, limit: 1, depth: 0, req })
  const page = res.docs[0]
  const content = page?.content as { root?: { children?: LexNode[] } } | undefined
  const children = content?.root?.children
  if (!page || !content?.root || !Array.isArray(children)) return
  let changed = false
  const next = children.flatMap((n) => {
    if (n.type === 'paragraph' && has(n, 'קבצי טקסט קטנים המאוחסנים על הכונן הקשיח')) {
      changed = true
      return COOKIES
    }
    if (n.type === 'paragraph' && has(n, 'פייסבוק פיקסל')) {
      changed = true
      return [ANALYTICS]
    }
    return [n]
  })
  if (!changed) return
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { content: { ...content, root: { ...content.root, children: next } } as never },
    req,
  })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // content only: nothing to undo in the schema; edit the texts in the admin if needed
}
