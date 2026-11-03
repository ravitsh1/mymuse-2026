'use client'

import type { ChangeEvent } from 'react'
import type { TextFieldClientComponent } from 'payload'
import { TextInput, useField } from '@payloadcms/ui'

/** The site palette (brand book 2026, palette A "Electric Contrast"), offered as swatches next to every colour field. */
const PALETTE: [string, string][] = [
  ['#f8f7f9', 'פורצלן (רקע)'],
  ['#1c0f30', 'דיו (טקסט)'],
  ['#2e1f45', 'סגול עמוק'],
  ['#801f48', 'בורדו'],
  ['#ff2d83', 'ורוד'],
  ['#f4e85a', 'לימון'],
  ['#ffffff', 'לבן'],
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
