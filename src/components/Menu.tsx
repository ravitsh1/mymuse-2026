'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

const LINKS = [
  { href: '/#work', label: 'עבודות' },
  { href: '/#services', label: 'שירותים' },
  { href: '/#about', label: 'עלינו' },
  { href: '/#contact', label: 'צור קשר' },
]

/**
 * Hamburger menu: a full-screen panel with the home page sections. While it is open the page behind it is inert
 * (no focus, no screen-reader access), Escape closes it and focus returns to the button. Every section is also reached
 * by scrolling, so without JS nothing is missing.
 */
export function Menu() {
  const [open, setOpen] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)

  useEffect(() => {
    const behind = [document.getElementById('content'), document.querySelector('footer')].filter(Boolean) as HTMLElement[]
    behind.forEach((el) => (el.inert = open))
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    panel.current?.querySelector('a')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      btn.current?.focus()
    }
    addEventListener('keydown', onKey)
    return () => {
      removeEventListener('keydown', onKey)
      behind.forEach((el) => (el.inert = false))
      document.documentElement.classList.remove('menu-open')
    }
  }, [open])

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
      <nav ref={panel} id="site-menu" className="menu" aria-label="תפריט ראשי" data-open={open || undefined} hidden={!open}>
        <ul>
          {LINKS.map((l, k) => (
            <li key={l.href} style={{ '--k': k } as React.CSSProperties}>
              <Link href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
