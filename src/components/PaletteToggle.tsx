'use client'

const OPTIONS = [
  ['neon', 'Neon'],
  ['mist', 'Mist'],
  ['viola', 'Viola'],
] as const

/**
 * Palette trial switch (lib/trial.ts): sets the "palette" cookie and reloads, since the colours are chosen on the
 * server.
 */
export function PaletteToggle({ current }: { current: string }) {
  const pick = (id: string) => {
    if (id === current) return
    document.cookie = `palette=${id}; path=/; max-age=31536000; samesite=lax`
    location.reload()
  }
  return (
    <div className="pal-toggle" role="group" aria-label="פלטת צבעים">
      {OPTIONS.map(([id, label]) => (
        <button key={id} type="button" aria-pressed={id === current} onClick={() => pick(id)}>
          {label}
        </button>
      ))}
    </div>
  )
}
