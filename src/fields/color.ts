import type { TextField } from 'payload'

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/** A hex colour as a text field with validation (e.g. #1b2a24), edited with palette swatches in the admin. */
export const colorField = (name: string, label: string, defaultValue: string, description?: string): TextField => ({
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
  validate: (value: string | null | undefined) =>
    !value || HEX.test(value) ? true : 'צריך קוד צבע בפורמט #RRGGBB',
})
