'use client'

import { useEffect, useState } from 'react'
import type { OptionObject, TextFieldClientComponent } from 'payload'
import { SelectInput, useField } from '@payloadcms/ui'

/**
 * Service tags on a project or a home service card: a multi-select whose options are the list in Settings → שירותים
 * (Settings.serviceTags). The field stores each tag's row id, so renaming a tag in Settings renames it everywhere.
 */
export const ServiceTagsField: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue, showError } = useField<string[]>({ path })
  const [options, setOptions] = useState<OptionObject[]>([])

  useEffect(() => {
    let live = true
    fetch('/api/globals/settings?depth=0', { credentials: 'include' })
      .then((r) => r.json())
      .then((s: { serviceTags?: { id?: string; label?: string }[] }) => {
        if (!live) return
        setOptions((s.serviceTags ?? []).filter((t) => t.id && t.label).map((t) => ({ value: t.id!, label: t.label! })))
      })
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  const known = new Set(options.map((o) => o.value))
  // a tag deleted in Settings drops out of the field once the options are in
  const current = (Array.isArray(value) ? value : []).filter((v) => !options.length || known.has(v))

  return (
    <SelectInput
      name={field.name}
      path={path}
      label={field.label}
      description={field.admin?.description}
      hasMany
      isClearable
      readOnly={readOnly}
      showError={showError}
      options={options}
      value={current}
      onChange={(sel) => {
        const list = Array.isArray(sel) ? sel : sel ? [sel] : []
        setValue(list.map((o) => String((o as OptionObject).value)))
      }}
    />
  )
}
