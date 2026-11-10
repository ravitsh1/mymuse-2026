import type { TextField } from 'payload'

/** The first list of service tags (until 2026-11-10 fixed in code). Their keys stay the row ids in Settings, so
 *  projects and links like /?service=ux keep working. Seeded by migration service_tags_settings. */
export const DEFAULT_SERVICE_TAGS = [
  { id: 'ux', label: 'אפיון UX' },
  { id: 'ui', label: 'עיצוב UI' },
  { id: 'wordpress', label: 'וורדפרס' },
  { id: 'woocommerce', label: 'חנות ווקומרס' },
  { id: 'multilingual', label: 'אתר רב־לשוני' },
  { id: 'content', label: 'אתר תוכן' },
  { id: 'tickets', label: 'מכירת כרטיסים' },
  { id: 'delivery', label: 'הזמנות ומשלוחים' },
  { id: 'app', label: 'אפליקציית ווב' },
  { id: 'system', label: 'מערכת ניהול' },
  { id: 'api', label: 'אינטגרציות API' },
  { id: 'ai', label: 'AI' },
  { id: 'accessibility', label: 'נגישות' },
  { id: 'support', label: 'ליווי ותחזוקה' },
]

/** A multi-pick of the service tags kept in Settings → שירותים (stores each tag's row id). */
export const serviceTagsField = (name: string, label: string, description: string): TextField => ({
  name,
  label,
  type: 'text',
  hasMany: true,
  admin: { description, components: { Field: '@/components/admin/ServiceTagsField#ServiceTagsField' } },
})
