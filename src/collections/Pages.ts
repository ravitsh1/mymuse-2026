import type { CollectionConfig } from 'payload'
import { refresh } from '../hooks/revalidate'

/** Plain text pages: accessibility statement, privacy policy and the like. */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'עמוד', plural: 'עמודים' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    description: 'עמודי טקסט כמו הצהרת נגישות ומדיניות פרטיות.',
    preview: (doc) => `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/preview?path=/${doc?.slug ?? ''}`,
  },
  access: { read: () => true },
  versions: { drafts: true },
  hooks: {
    afterChange: [({ doc }) => refresh(`/${doc.slug}`)],
  },
  fields: [
    { name: 'title', label: 'כותרת', type: 'text', required: true },
    {
      name: 'slug',
      label: 'כתובת',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'למשל accessibility' },
      validate: (v: string | null | undefined) =>
        !v || /^[a-z0-9-]+$/.test(v) ? true : 'אותיות אנגליות קטנות, ספרות ומקפים בלבד',
    },
    {
      name: 'inFooter',
      label: 'קישור בתחתית האתר',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    { name: 'content', label: 'תוכן', type: 'richText' },
    { name: 'metaDescription', label: 'תיאור לגוגל', type: 'textarea', maxLength: 170 },
  ],
}
