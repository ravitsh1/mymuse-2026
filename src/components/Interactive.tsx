'use client'

import { useState } from 'react'

/** Client marquee with a pause button (WCAG 2.2.2). */
export function Marquee({ names }: { names: string[] }) {
  const [paused, setPaused] = useState(false)
  return (
    <section className={`clients${paused ? ' paused' : ''}`} aria-label="לקוחות">
      <button className="mq-btn" type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
        {paused ? 'המשך' : 'עצירה'}
      </button>
      <div className="track">
        {names.map((n, i) => (
          <span key={'a' + i}>{n}</span>
        ))}
        {names.map((n, i) => (
          <span key={'b' + i} aria-hidden="true">
            {n}
          </span>
        ))}
      </div>
    </section>
  )
}

/** Shows a value as selectable text with a copy button. */
export function CopyValue({ value }: { value: string }) {
  const [done, setDone] = useState(false)
  const copy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget.previousElementSibling as HTMLElement | null
    try {
      await navigator.clipboard.writeText(value)
      setDone(true)
      setTimeout(() => setDone(false), 1600)
    } catch {
      if (el) {
        const r = document.createRange()
        r.selectNodeContents(el)
        const s = getSelection()
        s?.removeAllRanges()
        s?.addRange(r)
      }
    }
  }
  return (
    <div className="ci">
      <span className="val">{value}</span>
      <button className="cp" type="button" onClick={copy}>
        {done ? 'הועתק' : 'העתקה'}
      </button>
    </div>
  )
}
