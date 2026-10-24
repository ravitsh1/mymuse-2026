import type { CollectionConfig } from 'payload'
import { colorField } from '../fields/color'
import { metaDescriptionField } from '../fields/seo'
import { refreshSite } from '../hooks/revalidate'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: { singular: 'פרויקט', plural: 'פרויקטים' },
  orderable: true, // drag to reorder in the list; the order sets "the next project"
  admin: {
    useAsTitle: 'title',
    group: 'תוכן',
    defaultColumns: ['title', 'field', 'featured', 'hidden'],
    description: 'גררו כדי לשנות את הסדר. הסדר קובע לאיזה פרויקט עוברים בסוף כל פרויקט.',
    livePreview: { url: ({ data }) => `/portfolio/${data?.slug || ''}` },
  },
  access: { read: () => true },
  hooks: {
    afterChange: [() => refreshSite()],
    afterDelete: [() => refreshSite()],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'תוכן',
          fields: [
            { name: 'title', label: 'שם הפרויקט', type: 'text', required: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'slug',
                  label: 'כתובת',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  admin: { description: 'באנגלית, בלי רווחים. למשל jullius → /portfolio/jullius' },
                  validate: (v: string | null | undefined) =>
                    !v || /^[a-z0-9-]+$/.test(v) ? true : 'אותיות אנגליות קטנות, ספרות ומקפים בלבד',
                },
                {
                  name: 'nameEn',
                  label: 'שם באנגלית',
                  type: 'text',
                  admin: { description: 'מופיע כאותיות קו־מתאר בוויז׳ואל' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'field', label: 'תחום', type: 'text', admin: { placeholder: 'יקב' } },
                { name: 'scope', label: 'היקף העבודה', type: 'text', admin: { placeholder: 'אתר תדמית וחנות מקוונת' } },
                { name: 'platform', label: 'פלטפורמה', type: 'text', admin: { placeholder: 'WordPress · WooCommerce' } },
              ],
            },
            { name: 'lead', label: 'פסקת פתיחה', type: 'textarea' },
            {
              name: 'statement',
              label: 'משפט מרכזי',
              type: 'text',
              admin: { description: 'מילה בין כוכביות מקבלת את צבע ההדגשה: חנות שמרגישה כמו *המזקקה* עצמה.' },
            },
            { name: 'siteUrl', label: 'קישור לאתר', type: 'text', admin: { placeholder: 'https://' } },
            {
              name: 'credit',
              label: 'קרדיט',
              type: 'text',
              admin: {
                placeholder: 'עיצוב: סטודיו גור',
                description: 'מוצג בפרטי הפרויקט: מה שלפני הנקודתיים הוא הכותרת. ריק = לא מוצג.',
              },
            },
            {
              name: 'featured',
              label: 'להציג בעמוד הבית',
              type: 'checkbox',
              defaultValue: true,
              admin: { position: 'sidebar', description: 'ברשימת "עבודות נבחרות".' },
            },
            {
              name: 'hidden',
              label: 'מוסתר באתר',
              type: 'checkbox',
              defaultValue: false,
              admin: { position: 'sidebar', description: 'לא מופיע באתר ולא ברצף "הפרויקט הבא". טוב לפרויקט שעוד בעבודה.' },
            },
          ],
        },
        {
          label: 'מדיה',
          fields: [
            {
              name: 'hero',
              label: 'תמונה ראשית',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'רוחב 2400px לפחות. בלי תמונה מוצגת גרפיקה בצבעי הפרויקט.' },
            },
            {
              name: 'heroVideo',
              label: 'וידאו ראשי (לא חובה)',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'לופ קצר ושקט (mp4). לא מתנגן כשהגולש ביקש להפחית תנועה.' },
            },
            {
              name: 'gallery',
              label: 'גלריה',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'שתי הראשונות מוצגות בפרלקסה, השאר בגלריה מתחתיהן.' },
            },
          ],
        },
        {
          label: 'צבעים',
          description: 'הצבעים צובעים את כל עמוד הפרויקט ואת הרקע בעמוד הבית כשמרחפים על השם.',
          fields: [
            {
              type: 'row',
              fields: [
                colorField('bg', 'רקע', '#1b2a24'),
                colorField('ink', 'טקסט', '#efe8de', 'ניגודיות של 4.5:1 לפחות מול הרקע'),
                colorField('accent', 'הדגשה', '#d6a05b', 'משמש גם לטקסט קטן (תחום, כותרות משנה): ניגודיות של 4.5:1 לפחות מול הרקע'),
              ],
            },
          ],
        },
        {
          label: 'קידום',
          fields: [
            { name: 'metaTitle', label: 'כותרת לגוגל', type: 'text', admin: { description: 'ריק = שם הפרויקט.' } },
            metaDescriptionField('פסקת הפתיחה של הפרויקט'),
          ],
        },
      ],
    },
  ],
}
