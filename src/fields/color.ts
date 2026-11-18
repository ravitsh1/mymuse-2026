import type { TextField } from 'payload'

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/** A hex colour as a text field with validation (e.g. #1b2a24), edited with palette swatches in the admin. */
export const colorField = (
  name: string,
  label: string,
  defaultValue: string,
  description?: string,
  /** an extra rule on a valid hex (e.g. enough contrast): true, or the error to show */
  check?: (hex: string) => true | string,
): TextField => ({
  name,
  label,
  type: 'text',
  defaultValue,
  admin: {
    placeholder: defaultValue,
    description: description ?? 'בחרו מהפלטה או הקלידו קוד צבע, למשל #1b2a24',
    // hex input plus one-click palette swatches
    components: { Field: '@/components/admin/ColorField#ColorField' },
  },
  validate: (value: string | null | undefined) => {
    if (!value) return true
    if (!HEX.test(value)) return 'צריך קוד צבע בפורמט #RRGGBB'
    return check ? check(value) : true
  },
})

/** A colour column the site no longer reads (the 2026 brand colours are fixed in lib/brand.ts): kept, not shown. */
export const hiddenColorField = (name: string, label: string, defaultValue: string): TextField => {
  const f = colorField(name, label, defaultValue)
  return { ...f, admin: { ...f.admin, hidden: true } }
}
