import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'קובץ מדיה', plural: 'מדיה' },
  access: { read: () => true },
  fields: [
    {
      name: 'alt',
      label: 'טקסט חלופי',
      type: 'text',
      admin: { description: 'מה רואים בתמונה, לקוראי מסך. השאירו ריק לתמונה דקורטיבית בלבד.' },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    imageSizes: [
      { name: 'card', width: 900 },
      { name: 'large', width: 1600 },
      { name: 'hero', width: 2400 },
    ],
    formatOptions: { format: 'webp', options: { quality: 82 } },
    adminThumbnail: 'card',
  },
}
