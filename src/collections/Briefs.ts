import type { CollectionConfig } from 'payload'

/**
 * Briefs sent from the assistant in the contact section (components/BriefAssistant + app/brief/route.ts). Saved
 * here first, then mailed, so nothing is lost when the mail fails. Visitors cannot read or write this collection
 * through the API: only the route creates documents, and only a logged-in user sees them.
 */
export const Briefs: CollectionConfig = {
  slug: 'briefs',
  labels: { singular: 'בריף', plural: 'בריפים' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'contact', 'business', 'createdAt'],
    description: 'פניות שהגיעו מעוזר הבריף באתר. כל פנייה נשלחת גם למייל שבהגדרות.',
    group: 'פניות',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  defaultSort: '-createdAt',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', label: 'שם', type: 'text', required: true },
        { name: 'contact', label: 'טלפון או מייל', type: 'text', required: true },
      ],
    },
    { name: 'business', label: 'העסק', type: 'textarea' },
    { name: 'situation', label: 'מצב היום', type: 'textarea' },
    { name: 'goal', label: 'המטרה', type: 'textarea' },
    { name: 'systems', label: 'מערכות', type: 'textarea' },
    { name: 'timeline', label: 'לוח זמנים', type: 'textarea' },
    { name: 'notes', label: 'עוד', type: 'textarea' },
    { name: 'transcript', label: 'השיחה המלאה', type: 'json', admin: { readOnly: true } },
    { name: 'mailed', label: 'נשלח במייל', type: 'checkbox', admin: { readOnly: true, position: 'sidebar' } },
  ],
}
