import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'משתמש', plural: 'משתמשים' },
  admin: { useAsTitle: 'email' },
  auth: true,
  fields: [{ name: 'name', label: 'שם', type: 'text' }],
}
