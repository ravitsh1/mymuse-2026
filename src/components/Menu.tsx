'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const LINKS = [
  { href: '/#work', label: 'עבודות' },
  { href: '/#services', label: 'שירותים' },
  { href: '/#about', label: 'עלינו' },
  { href: '/#contact', label: 'צור קשר' },
]
/** how long the page takes to shrink back (styles.css, .site transition) before the panel behind it may go */
const CLOSE_MS = 750

/**
 * Hamburger menu. Opening shrinks the whole page into a card that slides right (RTL) and reveals the menu behind it on
 * the left, next to the button. The page is the card: what was on screen stays on screen, smaller (styles.css,
 * html.menu-open). The panel and a click-catcher over the card live in a portal on <body>, outside the page that moves.
 * While open the page is inert (no focus, no screen-reader access); Escape, the button or a click on the card closes
 * it and focus returns to the button. Every section is also reached by scrolling, so without JS nothing is missing.
 */
export function Menu() {
  const [open, setOpen] = useState(false)
  const [shown, setShown] = useState(false) // the panel stays while the card shrinks back
  const [mounted, setMounted] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const root = document.documentElement
    const behind = [document.getElementById('content'), document.querySelector('footer')].filter(Boolean) as HTMLElement[]
    if (open) {
      // the card keeps exactly what was on screen: clip the page to this slice and shrink it around its middle
      root.style.setProperty('--mo-y', `${scrollY}px`)
      setShown(true)
      behind.forEach((el) => (el.inert = true))
      // next frame, so the panel exists before the page starts to move
      requestAnimationFrame(() => root.classList.add('menu-open'))
      const onKey = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return
        setOpen(false)
        btn.current?.focus()
      }
      addEventListener('keydown', onKey)
      return () => removeEventListener('keydown', onKey)
    }
    root.classList.remove('menu-open')
    behind.forEach((el) => (el.inert = false))
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(() => {
      setShown(false)
      root.classList.remove('menu-closing')
    }, reduce ? 0 : CLOSE_MS)
    if (shown) root.classList.add('menu-closing') // keeps the page above the panel and the header in the card until it is full size again
    return () => clearTimeout(t)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // focus the first link once the panel is really there (it renders hidden until `shown`)
  useEffect(() => {
    if (open && shown) panel.current?.querySelector('a')?.focus({ preventScroll: true })
  }, [open, shown])

  // leaving the page through a menu link: let the browser jump to the section once the page is full size again
  useEffect(() => () => document.documentElement.classList.remove('menu-open', 'menu-closing'), [])

  return (
    <>
      <button
        ref={btn}
        type="button"
        className="burger"
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label={open ? 'סגירת התפריט' : 'תפריט'}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true" />
      </button>
      {mounted &&
        createPortal(
          <>
            <nav ref={panel} id="site-menu" className="menu" aria-label="תפריט ראשי" hidden={!shown}>
              <ul>
                {LINKS.map((l, k) => (
                  <li key={l.href} style={{ '--k': k } as React.CSSProperties}>
                    <Link
                      href={l.href}
                      onClick={() => {
                        // jumping to a section: the page snaps back at once so the jump lands where it should
                        document.documentElement.classList.add('menu-jump')
                        setTimeout(() => document.documentElement.classList.remove('menu-jump'), CLOSE_MS)
                        setOpen(false)
                      }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {/* a click anywhere on the shrunken page closes the menu (keyboard: Escape or the button) */}
            <div className="menu-scrim" aria-hidden="true" hidden={!open} onClick={() => setOpen(false)} />
          </>,
          document.body,
        )}
    </>
  )
}
