'use client'

/**
 * Palette trial switch (lib/trial.ts), shown on previews only: flips the "palette" cookie between Mist and Neon and
 * reloads, since the colours are chosen on the server.
 */
export function PaletteToggle({ mist }: { mist: boolean }) {
  const flip = () => {
    document.cookie = `palette=${mist ? 'neon' : 'mist'}; path=/; max-age=31536000; samesite=lax`
    location.reload()
  }
  return (
    <button type="button" className="pal-toggle" onClick={flip} aria-label={`פלטה: ${mist ? 'Mist' : 'Neon'}. מעבר ל־${mist ? 'Neon' : 'Mist'}`}>
      <span aria-hidden="true" className={mist ? '' : 'on'}>
        Neon
      </span>
      <span aria-hidden="true" className={mist ? 'on' : ''}>
        Mist
      </span>
    </button>
  )
}
