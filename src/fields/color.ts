import type { TextField } from 'payload'

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/** A hex colour as a text field with validation (e.g. #1b2a24). */
export const colorField = (name: string, label: string, defaultValue: string, description?: string): TextField => ({
  name,
  label,
  type: 'text',
  defaultValue,
  admin: { placeholder: defaultValue, description: description ?? 'קוד צבע, למשל #1b2a24' },
  validate: (value: string | null | undefined) =>
    !value || HEX.test(value) ? true : 'צריך קוד צבע בפורמט #RRGGBB',
})
