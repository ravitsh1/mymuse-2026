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
          fields: [colorField('bg', 'רקע', '#16141a'), colorField('ink', 'טקסט', '#efe8de'), colorField('accent', 'הדגשה', '#d6a05b', 'משמש גם לטקסט קטן (כותרות משנה): ניגודיות של 4.5:1 לפחות מול הרקע')],
        },
      ],
    },
    {
      name: 'metaDescription',
      label: 'תיאור ברירת מחדל לגוגל',
      type: 'textarea',
      maxLength: 170,
      defaultValue: 'MyMuse – בניית אתרים בהתאמה אישית: אפיון, הקמה, פיתוח ממשק וליווי מתמשך, תחת קורת גג אחת.',
      admin: { description: 'משמש בכל עמוד שאין לו תיאור משלו.' },
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
