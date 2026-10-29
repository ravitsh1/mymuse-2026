import type { GlobalConfig } from 'payload'
import { colorField } from '../fields/color'
import { refreshSite } from '../hooks/revalidate'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'הגדרות האתר',
  admin: { group: 'הגדרות' },
  access: { read: () => true },
  hooks: { afterChange: [() => refreshSite()] },
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
      fields: [{ type: 'row', fields: [{ name: 'label', label: 'שם', type: 'text', required: true }, { name: 'url', label: 'כתובת', type: 'text', required: true }] }],
    },
    {
      type: 'collapsible',
      label: 'צבעי עמוד הבית',
      fields: [
        {
          type: 'row',
          fields: [colorField('bg', 'רקע', '#1b1030'), colorField('ink', 'טקסט', '#ffe8c2'), colorField('accent', 'הדגשה', '#ff3d7f', 'משמש גם לטקסט קטן (כותרות משנה): ניגודיות של 4.5:1 לפחות מול הרקע')],
        },
      ],
    },
    {
      name: 'metaDescription',
      label: 'תיאור ברירת מחדל לגוגל',
      type: 'textarea',
      maxLength: 170,
      defaultValue: 'MyMuse – סטודיו לאתרים, אפליקציות ומערכות בהתאמה אישית מאז 2010: אפיון, עיצוב, פיתוח וליווי מתמשך, תחת קורת גג אחת.',
      admin: { description: 'משמש בכל עמוד שאין לו תיאור משלו.' },
    },
    {
      name: 'cookieText',
      label: 'הודעת עוגיות',
      type: 'textarea',
      defaultValue: 'אנו משתמשים בקבצי Cookies לשיפור חוויית הגלישה, ניתוח ושיווק. המשך גלישה באתר מהווה הסכמה לכך.',
      admin: {
        description: 'מוצגת בתחתית המסך עד שהגולש לוחץ "אישור", עם קישור למדיניות הפרטיות (העמוד privacy-policy). ריק = בלי הודעה.',
      },
    },
    {
      name: 'showTrials',
      label: 'להציג את "ניסיונות עיצוב"',
      type: 'checkbox',
      defaultValue: false,
      admin: { hidden: true, description: 'הכפתור בפינת האתר שמחליף פלטה ופתיחת דף הבית. כשהוא מוסתר, האתר מוצג בברירת המחדל (בדפדפן שכבר בחר, הבחירה נשמרת).' },
    },
    {
      name: 'shareImage',
      label: 'תמונת שיתוף',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'מה שמופיע כששולחים קישור בוואטסאפ או בפייסבוק. 1200×630. בעמוד פרויקט משמשת התמונה הראשית שלו.' },
    },
  ],
}
