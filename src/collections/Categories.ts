import type { CollectionConfig } from 'payload'
import { refreshSite } from '../hooks/revalidate'

/** Project categories: the filter buttons above the home page index, in this (drag) order. */
export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: { singular: 'קטגוריה', plural: 'קטגוריות' },
  orderable: true, // drag to reorder: the order of the filter buttons
  admin: {
    useAsTitle: 'title',
    group: 'תוכן',
    description: 'כפתורי הסינון מעל רשימת העבודות בעמוד הבית, לפי הסדר כאן. קטגוריה בלי פרויקטים לא מוצגת.',
  },
  access: { read: () => true },
  hooks: {
    afterChange: [() => refreshSite()],
    afterDelete: [() => refreshSite()],
  },
  fields: [{ name: 'title', label: 'שם', type: 'text', required: true }],
}
