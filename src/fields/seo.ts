import type { Field } from 'payload'

/**
 * "תיאור לגוגל" — the meta description of one page/project. Empty = the site falls back to the text it already
 * has, so leaving it blank never breaks anything. (Same field as threebears-2026, Hebrew only.)
 */
export const metaDescriptionField = (fallback: string): Field => ({
  name: 'metaDescription',
  type: 'textarea',
  label: 'תיאור לגוגל',
  maxLength: 300,
  admin: {
    description: `מה שמופיע מתחת לקישור בגוגל ובשיתוף. 120–160 תווים: מה יש בעמוד ולמי. ריק = ${fallback}.`,
    rows: 2,
  },
})
