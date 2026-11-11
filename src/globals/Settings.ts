import type { GlobalConfig } from 'payload'
import { colorField } from '../fields/color'
import { refreshSite } from '../hooks/revalidate'
import { DEFAULT_SERVICE_TAGS } from '../fields/serviceTags'

/** The home hero texts as they were in BrandHero until 2026-11-10 (the migration hero_texts fills them in). */
export const HERO_TAG = 'סטודיו לעיצוב ופיתוח אתרים'
export const HERO_TITLE = 'מה שדמיינתם,\nעם כל מה שעוד\n*לא חשבתם עליו.*'
export const HERO_TEXT =
  'ב־MyMuse הופכים רעיונות לאתרים, חוויות דיגיטליות ופתרונות חכמים. משלבים יצירתיות, עיצוב וטכנולוגיה כדי לבנות בדיוק את מה שהעסק שלכם צריך, ולפעמים גם את מה שעוד לא ידעתם שהוא יכול לעשות.'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'הגדרות האתר',
  admin: { group: 'הגדרות' },
  access: { read: () => true },
  hooks: { afterChange: [() => refreshSite()] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'פרטי קשר',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'email', label: 'מייל', type: 'email', defaultValue: 'ravit@mymuse.co.il' },
                { name: 'phone', label: 'טלפון', type: 'text', defaultValue: '054-6454404' },
              ],
            },
            {
              name: 'social',
              label: 'רשתות חברתיות',
              type: 'array',
              labels: { singular: 'קישור', plural: 'קישורים' },
              defaultValue: [
                { label: 'Instagram', url: 'https://www.instagram.com/mymuse.sites/' },
                { label: 'Facebook', url: 'https://www.facebook.com/mymuse.sites' },
              ],
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'שם', type: 'text', required: true },
                    { name: 'url', label: 'כתובת', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'עמוד הבית',
          fields: [
            {
              type: 'collapsible',
              label: 'טקסטים בפתיחת עמוד הבית',
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'heroTag',
                  label: 'שורה קטנה מעל הכותרת',
                  type: 'text',
                  defaultValue: HERO_TAG,
                },
                {
                  name: 'heroTitle',
                  label: 'כותרת',
                  type: 'textarea',
                  defaultValue: HERO_TITLE,
                  admin: {
                    description:
                      'כל שורה היא שורה בכותרת. מילים בין כוכביות נצבעות בוורוד: *לא חשבתם עליו.*',
                    rows: 3,
                  },
                },
                {
                  name: 'heroText',
                  label: 'פסקה',
                  type: 'textarea',
                  defaultValue: HERO_TEXT,
                  admin: { rows: 4 },
                },
              ],
            },
            {
              name: 'projectOrder',
              label: 'סדר הפרויקטים בעמוד הבית',
              type: 'radio',
              defaultValue: 'random',
              options: [
                { label: 'אקראי (סדר חדש בכל כניסה)', value: 'random' },
                { label: 'לפי הסדר ברשימת הפרויקטים בניהול', value: 'admin' },
              ],
              admin: {
                description: 'ברשימת "כל הפרויקטים". סינון לפי קטגוריה תמיד לפי הסדר בניהול.',
              },
            },
          ],
        },
        {
          label: 'שירותים',
          fields: [
            {
              name: 'serviceTags',
              label: 'שירותים (תגיות)',
              type: 'array',
              labels: { singular: 'שירות', plural: 'שירותים' },
              defaultValue: DEFAULT_SERVICE_TAGS,
              admin: {
                description:
                  'התגיות שאפשר לסמן בפרויקטים ובכרטיסי השירותים בעמוד הבית. שינוי שם מתעדכן בכל מקום; שירות שנמחק יורד מכל הפרויקטים.',
              },
              fields: [{ name: 'label', label: 'שם השירות', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'עוזר הבריף',
          fields: [
            {
              name: 'briefAssistant',
              label: 'להציג את עוזר הבריף',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'עוזר AI בחלק "יצירת קשר" בעמוד הבית: שואל כמה שאלות, מסכם לבריף ושולח אלייך. דורש מפתח Anthropic בהגדרות של Vercel. כבוי: רק המייל והטלפון.',
              },
            },
          ],
        },
        {
          label: 'גוגל ושיתוף',
          fields: [
            {
              name: 'metaDescription',
              label: 'תיאור ברירת מחדל לגוגל',
              type: 'textarea',
              maxLength: 170,
              defaultValue:
                'MyMuse – סטודיו לאתרים, אפליקציות ומערכות בהתאמה אישית מאז 2010: אפיון, עיצוב, פיתוח וליווי מתמשך, תחת קורת גג אחת.',
              admin: { description: 'משמש בכל עמוד שאין לו תיאור משלו.' },
            },
            {
              name: 'shareImage',
              label: 'תמונת שיתוף',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'מה שמופיע כששולחים קישור בוואטסאפ או בפייסבוק. 1200×630. בעמוד פרויקט משמשת התמונה הראשית שלו.',
              },
            },
          ],
        },
        {
          label: 'עוגיות',
          fields: [
            {
              name: 'cookieText',
              label: 'הודעת עוגיות',
              type: 'textarea',
              defaultValue:
                'אנו משתמשים בקבצי Cookies לשיפור חוויית הגלישה, ניתוח ושיווק. המשך גלישה באתר מהווה הסכמה לכך.',
              admin: {
                description:
                  'מוצגת בתחתית המסך עד שהגולש לוחץ "אישור", עם קישור למדיניות הפרטיות (העמוד privacy-policy). ריק = בלי הודעה.',
              },
            },
          ],
        },
      ],
    },
    // decided and fixed in code (2026-11-11); the columns stay so older deployments keep reading them
    {
      type: 'collapsible',
      admin: { hidden: true },
      label: 'צבעי עמוד הבית (לא בשימוש: הצבעים קבועים לפי שפת המותג)',
      fields: [
        {
          type: 'row',
          fields: [
            colorField('bg', 'רקע', '#1b1030'),
            colorField('ink', 'טקסט', '#ffe8c2'),
            colorField(
              'accent',
              'הדגשה',
              '#ff3d7f',
              'משמש גם לטקסט קטן (כותרות משנה): ניגודיות של 4.5:1 לפחות מול הרקע',
            ),
          ],
        },
      ],
    },
    {
      name: 'showSwatches',
      label: 'להציג את פלטת הצבעים בעמודי הפרויקטים',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
        description: 'שלושת ריבועי הצבע (רקע, טקסט, הדגשה) בתחתית כל עמוד פרויקט.',
      },
    },
    {
      name: 'heroShade',
      label: 'הצללה מעל תמונות ההירו',
      type: 'radio',
      defaultValue: 'none',
      options: [
        { label: 'בלי הצללה (התמונה כמו שהיא, הכותרת על רקע אחיד)', value: 'none' },
        { label: 'עם הצללה (מעבר צבע מעל ומתחת לתמונה)', value: 'gradient' },
      ],
      admin: { hidden: true, description: 'בראש עמודי הפרויקטים ובמעבר לפרויקט הבא.' },
    },
    {
      name: 'nextMode',
      label: 'סוף עמוד פרויקט',
      type: 'radio',
      defaultValue: 'scroll',
      options: [
        { label: 'גלילה לפרויקט הבא (המסגרת גדלה עם הגלילה ועוברת לבד)', value: 'scroll' },
        { label: 'כרטיס "הפרויקט הבא" עם כפתור (עוברים רק בלחיצה)', value: 'card' },
      ],
      admin: { hidden: true, description: 'איך עוברים מסוף עמוד פרויקט לפרויקט הבא.' },
    },
    {
      name: 'showTrials',
      label: 'להציג את "ניסיונות עיצוב"',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
        description:
          'הכפתור בפינת האתר שמחליף פלטה ופתיחת דף הבית. כשהוא מוסתר, האתר מוצג בברירת המחדל (בדפדפן שכבר בחר, הבחירה נשמרת).',
      },
    },
  ],
}
