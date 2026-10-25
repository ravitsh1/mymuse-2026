'use client'

import type { ChangeEvent } from 'react'
import type { TextFieldClientComponent } from 'payload'
import { TextInput, useField } from '@payloadcms/ui'

/** The site palette (Ocean Sunset + the light text colour), offered as swatches next to every colour field. */
const PALETTE: [string, string][] = [
  ['#001219', 'כחול לילה'],
  ['#005f73', 'פטרול'],
  ['#0a9396', 'טורקיז'],
  ['#94d2bd', 'מנטה'],
  ['#e9d8a6', 'חול'],
  ['#f5ebe0', 'טקסט בהיר'],
  ['#ee9b00', 'ענבר'],
  ['#ca6702', 'כתום'],
  ['#bb3e03', 'חלודה'],
  ['#ae2012', 'אדום'],
  ['#9b2226', 'יין'],
]

/**
 * Colour field: the usual hex text input (type any colour) plus one-click swatches of the palette. Validation stays
 * on the field config (fields/color.ts).
 */
export const ColorField: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue, showError } = useField<string>({ path })
  const current = (value || '').toLowerCase()
  const label = typeof field.label === 'string' ? field.label : field.name
  return (
    <TextInput
      path={path}
      label={field.label}
      description={field.admin?.description}
      placeholder={field.admin?.placeholder}
      required={field.required}
      readOnly={readOnly}
      showError={showError}
      value={value || ''}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      BeforeInput={<span className="mm-color-chip" style={{ background: value || 'transparent' }} aria-hidden="true" />}
      AfterInput={
        <div className="mm-swatches" role="group" aria-label={`צבעים מהפלטה עבור ${label}`}>
          {PALETTE.map(([hex, name]) => (
            <button
              key={hex}
              type="button"
              className="mm-swatch"
              style={{ background: hex }}
              title={`${name} ${hex}`}
              aria-label={`${name} ${hex}`}
              aria-pressed={current === hex}
              disabled={readOnly}
              onClick={() => setValue(hex)}
            />
          ))}
        </div>
      }
    />
  )
}
