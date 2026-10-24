'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const KEY = 'mm-cookies-ok'

/**
 * Cookie notice at the bottom of the screen until the visitor presses "אישור".
 * Not a dialog: it never takes focus or blocks the page. While it shows, the page gets a bottom scroll padding
 * of its height so the element in focus is never hidden behind it (WCAG 2.4.11).
 * Rendered only after mount, so it never flashes for a visitor who already confirmed.
 */
export function CookieNotice({ text, privacyHref, bg, ink, acc }: { text: string; privacyHref?: string; bg: string; ink: string; acc: string }) {
  const [show, setShow] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      setShow(true) // storage blocked: show it; it just comes back on the next visit
    }
  }, [])

  useEffect(() => {
    const el = box.current
    if (!show || !el) return
    const root = document.documentElement
    const pad = () => root.style.setProperty('scroll-padding-bottom', `${el.offsetHeight + 24}px`)
    pad()
    const ro = new ResizeObserver(pad)
    ro.observe(el)
    return () => {
      ro.disconnect()
      root.style.removeProperty('scroll-padding-bottom')
    }
  }, [show])

  if (!show) return null

  const ok = () => {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* storage blocked */
    }
    // The button is about to disappear: keep keyboard focus in the page instead of dropping it to <body>.
    const main = document.getElementById('content')
    if (main && box.current?.contains(document.activeElement)) {
      main.setAttribute('tabindex', '-1')
      main.focus({ preventScroll: true })
    }
    setShow(false)
  }

  return (
    <div ref={box} className="cookie" role="region" aria-label="הודעה על עוגיות" style={{ '--k-bg': bg, '--k-ink': ink, '--k-acc': acc } as React.CSSProperties}>
      <p>
        {text}
        {privacyHref && (
          <>
            {' '}
            לפרטים נוספים ראו את <Link href={privacyHref}>מדיניות הפרטיות</Link> שלנו.
          </>
        )}
      </p>
      <button type="button" onClick={ok}>
        אישור
      </button>
    </div>
  )
}
