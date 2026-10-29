import type { GlobalConfig } from 'payload'
import { colorField } from '../fields/color'
import { refresh } from '../hooks/revalidate'

// Default wording (kept out of the field list so the schema stays readable).
const SERVICE_TEXTS = [
  'לפני שמעצבים, מקשיבים: מי הקהל, מה הוא מחפש ומה אתם רוצים שיקרה באתר. משם נבנים מבנה העמודים, התוכן והדרך של הגולש עד לפנייה.',
  'עיצוב שנולד מהאופי של העסק ולא מתבנית, ובנייה מקצועית: מהיר בנייד, מוכן לקידום בגוגל ופשוט לעדכון בעצמכם.',
  'חנויות WooCommerce, חיבור דרך API למערכות שכבר עובדות אצלכם, סנכרון נתונים בין מערכות, תוספים ורכיבים שנכתבים במיוחד, כשמה שיש על המדף לא מספיק.',
  'כשגיליון וקבוצת וואטסאפ כבר לא מספיקים: מערכות ניהול ואפליקציות שנבנות סביב הדרך שבה העסק עובד באמת, מהזמנות ומשלוחים ועד משימות ועדכונים מול לקוחות, עם AI במקומות שבהם הוא באמת חוסך עבודה.',
  'אחסון, גיבויים, עדכוני אבטחה ושיפורים שוטפים. האתר גדל יחד עם העסק, ויש לכם כתובת אחת לכל שאלה, גם שנים אחרי ההשקה.',
]
const ABOUT_HEADLINE = 'מאז 2010 בנינו מאות אתרים, וכל אחד מהם נראה כמו העסק שמאחוריו, לא כמו תבנית.'
const ABOUT_BODY = [
  'MyMuse הוקמה ב־2010 על ידי רוית שליוינסקי, מפתחת אתרים, בעשר אצבעות ועם שפע של מקורות השראה. מאז בנינו, בשיתוף פעולה מלא עם הלקוחות, מאות אתרים: ליקבים ולמותגי יין, לחברות טכנולוגיה וביטוח, למרכזי קהילה ותרבות ולמותגי לייף־סטייל. לצד האתרים אנחנו בונות גם אפליקציות ומערכות ניהול, כשהעבודה של העסק צריכה כלי משלה.',
  'אנחנו מאמינות שלכל עסק יש אופי משלו, ולכן אין אצלנו אתרים מתבנית: כל לקוח מקבל יחס אישי, תשובות ישירות ואתר שנבנה סביב המטרות שלו.',
  'ההשראה שלנו היא ההצלחה שלכם.',
].join('\n\n')
const CONTACT_BODY = 'יש לכם עסק עם אופי ורעיון לאתר, או אתר קיים שצריך לחשוב עליו מחדש? ספרו לנו במה מדובר ונחזור אליכם.'

export const Home: GlobalConfig = {
  slug: 'home',
  label: 'עמוד הבית',
  admin: { group: 'תוכן', livePreview: { url: '/' } },
  access: { read: () => true },
  hooks: { afterChange: [() => refresh('/')] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'פתיחה',
          fields: [
            {
              name: 'words',
              label: 'מילים אחרי Passion &',
              type: 'array',
              minRows: 1,
              maxRows: 6,
              labels: { singular: 'מילה', plural: 'מילים' },
              admin: { description: 'המילה מתחלפת בגלילה, ואיתה הרקע, תמונת הרקע וצבע ההדגשה.' },
              defaultValue: [
                { word: 'Expertise', bg: '#1b1030', accent: '#ff3d7f' },
                { word: 'Culture', bg: '#235c68', accent: '#ffe8c2' },
                { word: 'Flavor', bg: '#a42b5f', accent: '#ff9f1c' },
                { word: 'Lifestyle', bg: '#7b2351', accent: '#ff9f1c' },
              ],
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'word', label: 'מילה', type: 'text', required: true },
                    colorField('bg', 'רקע', '#1b1030'),
                    colorField('accent', 'הדגשה', '#ff3d7f'),
                  ],
                },
                {
                  name: 'image',
                  label: 'תמונת רקע',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'תמונה או וידאו מאחורי הסלוגן, מוחשכים כדי שהטקסט ייקרא. בלי תמונה: רקע בצבע שנבחר.' },
                },
              ],
            },
            {
              name: 'subtitle',
              label: 'משפט מתחת',
              type: 'text',
              defaultValue: 'אתרים, אפליקציות ומערכות בהתאמה אישית, מהאפיון ועד הליווי שאחרי ההשקה.',
            },
          ],
        },
        {
          label: 'עבודות',
          fields: [
            {
              name: 'workTitle',
              label: 'כותרת',
              type: 'text',
              defaultValue: 'עבודות נבחרות',
              admin: { description: 'הפרויקטים שמסומנים "להציג בעמוד הבית" מוצגים כאן לפי הסדר ברשימת הפרויקטים.' },
            },
          ],
        },
        {
          label: 'שירותים',
          fields: [
            { name: 'servicesTitle', label: 'כותרת', type: 'text', defaultValue: 'הכל תחת קורת גג אחת' },
            {
              name: 'services',
              label: 'כרטיסים',
              type: 'array',
              labels: { singular: 'שירות', plural: 'שירותים' },
              defaultValue: [
                { title: 'אפיון', text: SERVICE_TEXTS[0], bg: '#ffe8c2', ink: '#1b1030' },
                { title: 'הקמת האתר', text: SERVICE_TEXTS[1], bg: '#c6f432', ink: '#1b1030' },
                { title: 'פיתוח, API ואינטגרציות', text: SERVICE_TEXTS[2], bg: '#ff9f1c', ink: '#1b1030' },
                { title: 'אפליקציות ומערכות', text: SERVICE_TEXTS[3], bg: '#a42b5f', ink: '#ffe8c2' },
                { title: 'ליווי מתמשך', text: SERVICE_TEXTS[4], bg: '#235c68', ink: '#ffe8c2' },
              ],
              fields: [
                { name: 'title', label: 'שם', type: 'text', required: true },
                { name: 'text', label: 'תיאור', type: 'textarea' },
                { type: 'row', fields: [colorField('bg', 'רקע הכרטיס', '#ffe8c2'), colorField('ink', 'טקסט הכרטיס', '#1b1030')] },
              ],
            },
          ],
        },
        {
          label: 'עלינו',
          fields: [
            {
              name: 'aboutHeadline',
              label: 'משפט גדול',
              type: 'text',
              defaultValue: ABOUT_HEADLINE,
              admin: { description: 'נצבע מילה אחרי מילה בגלילה.' },
            },
            {
              name: 'aboutBody',
              label: 'פסקה',
              type: 'textarea',
              defaultValue: ABOUT_BODY,
              admin: { description: 'שורה ריקה מתחילה פסקה חדשה.' },
            },
          ],
        },
        {
          label: 'לקוחות',
          fields: [
            {
              name: 'clients',
              label: 'שמות לקוחות',
              type: 'array',
              labels: { singular: 'לקוח', plural: 'לקוחות' },
              defaultValue: ['HELIOS', 'GurGroup', 'Meteor Center', 'TEO', 'Jullius', 'Mosessco', 'Barantech', 'Benny Goren', 'Enosh', 'Little Fences', 'Samurai', 'Recanati', 'Margalit', 'WINECASE', 'Netofa', '3 Bears', 'Studio Gur', 'Agur', 'MOA Winery', 'Vinspiration', 'Firon', 'Gordon Pool'].map((name) => ({ name })),
              fields: [{ name: 'name', label: 'שם', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'יצירת קשר',
          fields: [
            { name: 'contactTitle', label: 'כותרת', type: 'text', defaultValue: 'נדבר?' },
            {
              name: 'contactBody',
              label: 'משפט מתחת לכותרת',
              type: 'textarea',
              defaultValue: CONTACT_BODY,
              admin: { description: 'ריק: רק הכותרת, המייל והטלפון.' },
            },
          ],
        },
      ],
    },
  ],
}
