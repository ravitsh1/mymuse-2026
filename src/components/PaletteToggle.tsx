'use client'

import type React from 'react'

const GROUPS = [
  {
    cookie: 'palette',
    label: 'פלטת צבעים',
    options: [
      ['neon', 'Neon'],
      ['mist', 'Mist'],
      ['viola', 'Viola'],
      ['b26', '2026'],
    ],
  },
  {
    cookie: 'hero',
    label: 'פתיחת דף הבית',
    options: [
      ['single', 'משפט אחד'],
      ['classic', 'מקורי'],
      ['work', 'עבודות'],
      ['statement', 'כותרת'],
      ['both', 'שניהם'],
    ],
  },
] as const

/**
 * Trial switches (lib/trial.ts): palette and home hero. Each sets its cookie and reloads, since both are chosen on
 * the server.
 */
export function PaletteToggle({ current }: { current: { palette: string; hero: string } }) {
  const pick = (cookie: 'palette' | 'hero', id: string) => {
    if (id === current[cookie]) return
    document.cookie = `${cookie}=${id}; path=/; max-age=31536000; samesite=lax`
    location.reload()
  }
  // the panel stays open across the reload a pick causes (per tab)
  const remember = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    try {
      sessionStorage.setItem('trial-open', e.currentTarget.open ? '1' : '')
    } catch {}
  }
  const opened = () => {
    try {
      return sessionStorage.getItem('trial-open') === '1'
    } catch {
      return false
    }
  }
  return (
    <details className="pal-toggles" ref={(d) => void (d && opened() && (d.open = true))} onToggle={remember}>
      <summary>ניסיונות עיצוב</summary>
      {GROUPS.map((g) => (
        <div key={g.cookie} className="pal-toggle" role="group" aria-label={g.label}>
          {g.options.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={id === current[g.cookie]} onClick={() => pick(g.cookie, id)}>
              {label}
            </button>
          ))}
        </div>
      ))}
    </details>
  )
}
