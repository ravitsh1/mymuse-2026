import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// Privacy policy (2026-11-11): sections on the brief assistant (Mimo, Claude by Anthropic, Resend) and the VEE
// accessibility widget, inserted before "שמירת מידע", plus the date of this update at the end. Content only, and only
// if the page does not mention Mimo yet, so Ravit's own edits are never overwritten.

type LexNode = { type: string; children?: LexNode[]; text?: string; [k: string]: unknown }

const text = (t: string): LexNode => ({ mode: 'normal', text: t, type: 'text', style: '', detail: 0, format: 0, version: 1 })
const h2 = (t: string): LexNode => ({ tag: 'h2', type: 'heading', format: '', indent: 0, version: 1, children: [text(t)], direction: 'rtl' })
const p = (t: string): LexNode => ({ type: 'paragraph', format: '', indent: 0, version: 1, children: [text(t)], direction: 'rtl', textStyle: '', textFormat: 0 })

const NEW: LexNode[] = [
  h2('עוזר הבריף מבוסס בינה מלאכותית (מימו)'),
  p(
    'באתר פועל "מימו", עוזר מבוסס בינה מלאכותית שעוזר לסכם פנייה לבריף קצר. כדי לענות, תוכן השיחה מועבר לעיבוד אצל Anthropic (מודל Claude), צד שלישי הפועל בהתאם למדיניות הפרטיות ולתנאי השימוש שלו, ולפיהם תוכן כזה אינו משמש לאימון המודלים.',
  ),
  p(
    'כל עוד לא לוחצים "שליחה לרוית", השיחה אינה נשמרת אצלנו. בלחיצה על השליחה נשמרים הבריף, השיחה, השם ופרטי ההתקשרות שמסרתם, ונשלחים בדואר אלקטרוני לרוית באמצעות שירות הדיוור Resend, לצורך חזרה אליכם בלבד. מומלץ לא למסור בשיחה מידע רגיש. אפשר לבקש את מחיקת הפנייה בכל עת בכתובת ravit@mymuse.co.il.',
  ),
  h2('רכיב הנגישות'),
  p(
    'רכיב הנגישות באתר מסופק על ידי VEE ונטען משרתיה. הוא עשוי לשמור במכשיר שלכם את העדפות התצוגה שבחרתם (למשל גודל טקסט או ניגודיות), כדי להחיל אותן גם בביקור הבא.',
  ),
]
const UPDATED = 'עדכון אחרון של מדיניות זו: נובמבר 2026.'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: 'privacy-policy' } }, limit: 1, depth: 0, req })
  const page = res.docs[0]
  const content = page?.content as { root?: { children?: LexNode[] } } | undefined
  const children = content?.root?.children
  if (!page || !content?.root || !Array.isArray(children)) return
  if (JSON.stringify(children).includes('מימו')) return // already there (or written by hand)
  const at = children.findIndex((n) => n.type === 'heading' && JSON.stringify(n).includes('שמירת מידע'))
  const next = at >= 0 ? [...children.slice(0, at), ...NEW, ...children.slice(at)] : [...children, ...NEW]
  if (!JSON.stringify(next).includes('עדכון אחרון של מדיניות')) next.push(p(UPDATED))
  await payload.update({
    collection: 'pages',
    id: page.id,
    data: { content: { ...content, root: { ...content.root, children: next } } as never },
    req,
  })
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // content only: nothing to undo in the schema; remove the sections in the admin if needed
}
