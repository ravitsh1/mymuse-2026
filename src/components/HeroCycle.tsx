'use client'

import { useEffect, useRef, useState } from 'react'

const STEP = 3200

/**
 * Home hero trial "single" (lib/trial.ts): the background photos change on their own, each with its word's colours,
 * instead of with the scroll. Not under prefers-reduced-motion; the button stops it (WCAG 2.2.2). Also keeps the
 * header light while it sits on the hero.
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

  // the header is light (.top-light, rendered on) while it sits on the hero, until the page below reaches it
  useEffect(() => {
    const site = document.querySelector('[data-site]')
    const after = document.querySelector('.after-ph')
    if (!site || !after) return
    const check = () => site.classList.toggle('top-light', after.getBoundingClientRect().top > 40)
    check()
    addEventListener('scroll', check, { passive: true })
    addEventListener('resize', check)
    return () => {
      removeEventListener('scroll', check)
      removeEventListener('resize', check)
    }
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
