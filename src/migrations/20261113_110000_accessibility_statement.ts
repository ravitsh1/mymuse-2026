import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import BEFORE from '../../docs/backups/accessibility-2026-11-13.json'

// Accessibility statement cleanup (2026-11-13, Ravit: "תתקני"): Ravit's own text, with the fixes from the review —
// the site name where it was missing, one link per phrase instead of one per word, H1/H2/H3, the contact sentence as a
// paragraph (not a heading), real lists, the phone in the site's format — and the front-office section filled in with
// what Ravit gave (הסדנאות 8, הרצליה). It also says plainly that MyMuse built the site and VEE supplies the widget.
// Content only, and only while the page still holds the "יש/אין" template line, so later edits are never overwritten.

type LexNode = { type: string; children?: LexNode[]; [k: string]: unknown }

const text = (t: string, format = 0): LexNode => ({ mode: 'normal', text: t, type: 'text', style: '', detail: 0, format, version: 1 })
const link = (t: string, url: string): LexNode => ({ type: 'link', fields: { url, newTab: false, linkType: 'custom' }, format: '', indent: 0, version: 3, direction: 'rtl', children: [text(t)] })
const p = (...children: (string | LexNode)[]): LexNode => ({ type: 'paragraph', format: '', indent: 0, version: 1, direction: 'rtl', textStyle: '', textFormat: 0, children: children.map((c) => (typeof c === 'string' ? text(c) : c)) })
const h2 = (t: string): LexNode => ({ tag: 'h2', type: 'heading', format: '', indent: 0, version: 1, direction: 'rtl', children: [text(t)] })
const ul = (items: string[]): LexNode => ({
  type: 'list', listType: 'bullet', tag: 'ul', start: 1, format: '', indent: 0, version: 1, direction: 'rtl',
  children: items.map((t, i) => ({ type: 'listitem', value: i + 1, format: '', indent: 0, version: 1, direction: 'rtl', children: [text(t)] })),
})

const CONTENT = {
  root: {
    type: 'root', format: '', indent: 0, version: 1, direction: 'rtl',
    children: [
      p('MyMuse אחראית על הקמת האתר ', link('mymuse.co.il', 'https://mymuse.co.il'), ' ועל הפעלתו.'),
      p('אנו רואים חשיבות רבה במתן שירות שוויוני לכלל האזרחים ובשיפור השירות הניתן לאזרחים עם מוגבלות. אנו משקיעים משאבים רבים בהנגשת האתר והנכסים הדיגיטליים שלנו, כדי להפוך את השירותים שלנו לזמינים יותר עבור אנשים עם מוגבלות.'),
      p('במדינת ישראל כ־20 אחוזים מקרב האוכלוסייה הם אנשים עם מוגבלות הזקוקים לנגישות דיגיטלית, כדי לצרוך מידע ושירותים כלליים. הנגשת האתר של MyMuse נועדה להפוך אותו לזמין, ידידותי ונוח יותר לשימוש עבור אוכלוסיות עם צרכים מיוחדים, הנובעים בין היתר ממוגבלויות מוטוריות שונות, לקויות קוגניטיביות, קוצר ראייה, עיוורון או עיוורון צבעים, לקויות שמיעה, וכן עבור בני הגיל השלישי.'),
      p('האתר תוכנן ונבנה על ידי MyMuse מתוך הקפדה על נגישות. רכיב הנגישות באתר מסופק על ידי ', link('VEE הנגשת אתרים', 'https://vee.co.il/'), '.'),
      h2('רמת הנגישות באתר: AA'),
      p('MyMuse מקפידה על עמידה בדרישות תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג־2013, ובתקן הישראלי ת"י 5568 ברמת AA, ומיישמת את המלצות מסמך WCAG 2.2 של ארגון W3C. האתר מותאם לדפדפנים הנפוצים ולשימוש בטלפון הנייד, ונבדק גם עם קוראי מסך.'),
      p('הנגשת האתר בוצעה בהתאם ל', link('הנחיות רשות התקשוב להנגשת יישומים בדפדפני אינטרנט', 'https://www.isoc.org.il/files/w3c-wai/guidelines.html'), '.'),
      h2('כיצד עוברים למצב נגיש?'),
      p('באתר מוצב אייקון נגישות, בפינה התחתונה של המסך. לחיצה על האייקון פותחת את תפריט הנגישות. לאחר בחירת הפונקציה המתאימה בתפריט יש להמתין לשינוי הרצוי בתצוגה. כדי לבטל פעולה, לוחצים על הפונקציה בתפריט פעם נוספת. בכל מצב אפשר לאפס את הגדרות הנגישות.'),
      p('הרכיב פועל בדפדפנים הנפוצים: Chrome, Firefox, Safari ו־Edge. הגלישה במצב נגישות מומלצת בדפדפן Chrome.'),
      p('האתר מספק מבנה סמנטי עבור טכנולוגיות מסייעות, ותמיכה בדפוס השימוש המקובל להפעלה עם מקלדת: Tab למעבר בין רכיבים, Enter להפעלה ו־Esc ליציאה מתפריטים וחלונות. לחוויית גלישה מיטבית עם קורא מסך אנו ממליצים על הגרסה העדכנית של NVDA.'),
      h2('התאמות שבוצעו באתר'),
      ul([
        'התאמה לקוראי מסך ולטכנולוגיות מסייעות, כגון NVDA ו־JAWS.',
        'אמצעי הניווט באתר פשוטים וברורים, וניתן לנווט בכל האתר במקלדת.',
        'תכני האתר כתובים באופן ברור, מסודר והיררכי.',
        'האתר מותאם לצפייה בדפדפנים מודרניים ובמגוון מסכים ורזולוציות.',
        'לכל הדפים באתר מבנה כותרות קבוע (H1, H2, H3 וכו׳).',
        'לכל התמונות באתר יש טקסט חלופי (alt).',
        'התנועה באתר אינה הכרחית להבנת התוכן, ונעצרת למי שביקש להפחית תנועה בהגדרות המכשיר.',
      ]),
      h2('פונקציות רכיב הנגישות'),
      ul([
        'עצירת הבהובים, עצירת אלמנטים נעים וחסימת אנימציות.',
        'דילוג ישיר לתוכן, על התפריט הראשי.',
        'התאמה לניווט במקלדת.',
        'הגדלה והקטנה של טקסט.',
        'ריווח בין אותיות, מילים ושורות.',
        'ניגודיות וצבע: גבוהה, הפוכה, שחור לבן.',
        'גופן קריא.',
        'הדגשת קישורים.',
        'מדריך קריאה.',
        'שינוי סמן העכבר.',
        'תיאור לתמונות.',
      ]),
      h2('החרגות'),
      p('למרות מאמצינו להנגיש את כלל הדפים והאלמנטים באתר, ייתכן שיתגלו חלקים או יכולות שלא הונגשו כראוי או שטרם הונגשו. אנו פועלים לשפר את נגישות האתר כל העת, כחלק מהמחויבות שלנו לאפשר לכלל האוכלוסייה להשתמש בו, כולל אנשים עם מוגבלות.'),
      h2('נגישות הסטודיו'),
      p('קבלת קהל ופגישות מתקיימות בסטודיו, ברחוב הסדנאות 8, הרצליה.'),
      ul(['חניות נכים: יש, ברחוב.', 'מעלית: יש.', 'שירותי נכים: יש.']),
      h2('יצירת קשר בנושא נגישות'),
      p('נתקלתם בבעיית נגישות באתר? נשמח לקבל הערות ובקשות דרך פנייה לרכזת הנגישות שלנו. כדי שנוכל לטפל בבעיה בדרך הטובה ביותר, מומלץ לצרף פרטים מלאים ככל שאפשר:'),
      ul(['תיאור הבעיה.', 'הפעולה שניסיתם לבצע.', 'קישור לדף שבו גלשתם.', 'סוג הדפדפן וגרסתו.', 'מערכת ההפעלה.', 'סוג הטכנולוגיה המסייעת (אם השתמשתם).']),
      p('MyMuse תעשה כל שביכולתה כדי להנגיש את האתר בצורה המיטבית ולענות לפניות במקצועיות ובמהירות.'),
      p(text('רכזת נגישות: ', 1), 'רוית שליוינסקי'),
      p('טלפון: ', link('054-6454404', 'tel:+972546454404')),
      p('דוא"ל: ', link('ravit@mymuse.co.il', 'mailto:ravit@mymuse.co.il')),
      p('תאריך עדכון הצהרת הנגישות: 13.11.2026'),
    ],
  },
}

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: 'accessibility' } }, limit: 1, depth: 0, req })
  const page = res.docs[0]
  if (!page || !JSON.stringify(page.content ?? '').includes('יש/אין')) return
  await payload.update({ collection: 'pages', id: page.id, data: { content: CONTENT as never }, depth: 0, req })
}

// pages keep no versions, so the text as it was before this migration is kept in docs/backups and restored here
export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const res = await payload.find({ collection: 'pages', where: { slug: { equals: 'accessibility' } }, limit: 1, depth: 0, req })
  if (res.docs[0]) await payload.update({ collection: 'pages', id: res.docs[0].id, data: { content: BEFORE as never }, depth: 0, req })
}
