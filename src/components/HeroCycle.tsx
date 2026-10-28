'use client'

import { useEffect, useRef, useState } from 'react'

const STEP = 3200

/**
 * Home hero trial "single" (lib/trial.ts): the background photos change on their own, each with its word's colours,
 * instead of with the scroll. Not under prefers-reduced-motion; the button stops it (WCAG 2.2.2).
 */
export function HeroCycle() {
  const ref = useRef<HTMLButtonElement>(null)
  const [on, setOn] = useState(false)
  const [reduce, setReduce] = useState(true)

  useEffect(() => {
    const r = matchMedia('(prefers-reduced-motion: reduce)').matches
    setReduce(r)
    setOn(!r)
  }, [])

  useEffect(() => {
    if (!on) return
    const ph = ref.current?.closest<HTMLElement>('[data-ph]')
    const phs = ph?.querySelector<HTMLElement>('[data-phs]')
    const layers = [...(ph?.querySelectorAll<HTMLElement>('[data-phbg]') ?? [])]
    const words: { bg: string; accent: string }[] = JSON.parse(ph?.dataset.words || '[]')
    if (!phs || layers.length < 2) return
    let k = Math.max(0, layers.findIndex((l) => l.classList.contains('on')))
    const t = setInterval(() => {
      k = (k + 1) % layers.length
      layers.forEach((l, n) => l.classList.toggle('on', n === k))
      const w = words[k % words.length]
      if (w) {
        phs.style.setProperty('--h-bg', w.bg)
        phs.style.setProperty('--h-acc', w.accent)
      }
    }, STEP)
    return () => clearInterval(t)
  }, [on])

  if (reduce) return null
  return (
    <button ref={ref} type="button" className="ph-cbtn" onClick={() => setOn((v) => !v)}>
      {on ? 'עצירת התמונות' : 'הפעלת התמונות'}
    </button>
  )
}
