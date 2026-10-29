'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useLayoutEffect } from 'react'

/**
 * All scroll-driven motion for a page. The server renders complete, readable HTML;
 * this component only enhances it, and does nothing under prefers-reduced-motion
 * except the progress bar.
 */

let navigatedByMotion = false
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)
// Project pages are dynamic, so a default prefetch fetches almost nothing and the hand-over waits on the server.
const FULL = { kind: 'full' } as Parameters<ReturnType<typeof useRouter>['prefetch']>[1]

export function Motion() {
  const router = useRouter()

  /* ---------- arrival: before the first paint, or the title shows in place and then jumps into its rise ---------- */
  useLayoutEffect(() => {
    document.querySelectorAll('.fly').forEach((f) => {
      f.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).finished.then(() => f.remove())
    })
    if (!navigatedByMotion) return
    navigatedByMotion = false
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelector('[data-site]')?.classList.add('arrived')
    document.querySelector<HTMLElement>('#pt')?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches
    const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)
    const $$ = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T>(s)]

    const site = $('[data-site]')!
    const bar = $('[data-bar]')
    let busy = false
    let timer: ReturnType<typeof setTimeout> | null = null
    let lastP = 0

    if (!reduce) $$<HTMLVideoElement>('video[data-autoplay]').forEach((v) => v.play().catch(() => {}))

    const go = (href: string) => {
      if (busy) return
      busy = true
      navigatedByMotion = true
      router.push(href)
    }

    /* ---------- home: index rows ---------- */
    const rows = $('[data-rows]')
    const peek = $('[data-peek]')
    const base = { bg: site.dataset.bg!, ink: site.dataset.ink!, acc: site.dataset.acc!, accSm: site.dataset.accSm!, accLg: site.dataset.accLg! }
    let ixOn: number | null = null
    type Pal = { bg: string; ink: string; acc: string; accSm?: string; accLg?: string }
    /** Resting colours of the index: the site's, or (after a category filter) the first shown project's. */
    let rest: Pal = base
    let painted: Pal | null = null
    const paint = (c: Pal) => {
      if (c === painted) return
      painted = c
      site.style.setProperty('--p-bg', c.bg)
      site.style.setProperty('--p-ink', c.ink)
      site.style.setProperty('--p-acc', c.acc)
      site.style.setProperty('--p-acc-sm', c.accSm || c.acc)
      site.style.setProperty('--p-acc-lg', c.accLg || c.acc)
      site.style.setProperty('--p-soft', c.ink + '26')
    }
    const rowEls = rows ? $$<HTMLAnchorElement>('[data-rows] .row') : []
    const rowOf = (i: number) => rowEls.find((r) => Number(r.dataset.i) === i)!
    const palOf = (r: HTMLAnchorElement): Pal => ({ bg: r.dataset.bg!, ink: r.dataset.ink!, acc: r.dataset.acc!, accSm: r.dataset.accSm, accLg: r.dataset.accLg })
    const ixEl = $('[data-ix]')
    const ixInView = () => {
      if (!ixEl) return false
      const r = ixEl.getBoundingClientRect()
      return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5
    }
    /** CategoryFilter announces a new filter: the index takes the colours of the first project it now shows. */
    const onFilter = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      const first = id === 'all' ? undefined : rowEls.find((a) => a.offsetParent)
      rest = first ? palOf(first) : base
      // a highlighted row may now be hidden: drop it, and on touch let the scroll logic pick the nearest shown row again
      if (ixOn !== null && !rowOf(ixOn).offsetParent) setIx(null)
      if (ixOn === null) paint(ixInView() ? rest : base)
      if (!hoverable) requestAnimationFrame(() => update())
    }
    addEventListener('mm:filter', onFilter)
    /** A highlighted row is the likely next click: fetch its page and start its hero image (on touch there is no peek to load it). */
    const warm = (i: number) => {
      router.prefetch(rowOf(i).getAttribute('href')!, FULL)
      $(`[data-visual-for="${i}"]`)?.querySelectorAll('img[loading="lazy"]').forEach((img) => img.setAttribute('loading', 'eager'))
    }
    const setIx = (i: number | null) => {
      if (i === ixOn || !rows) return
      ixOn = i
      rows.classList.toggle('has-on', i !== null)
      rowEls.forEach((r) => r.classList.toggle('on', Number(r.dataset.i) === i))
      if (i === null) return paint(ixInView() ? rest : base)
      warm(i)
      paint(palOf(rowOf(i)))
    }
    const visualFor = (i: number) => {
      const src = $(`[data-visual-for="${i}"]`)
      const v = src?.firstElementChild?.cloneNode(true) as HTMLElement | undefined
      return v
    }
    const expand = (i: number, href: string, rect: DOMRect) => {
      const v = visualFor(i)
      if (reduce || !v) return go(href)
      const fly = document.createElement('div')
      fly.className = 'fly'
      fly.appendChild(v)
      document.body.appendChild(fly)
      peek?.classList.remove('show')
      const from = `inset(${rect.top}px ${innerWidth - rect.right}px ${innerHeight - rect.bottom}px ${rect.left}px round 14px)`
      fly
        .animate([{ clipPath: from }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], {
          duration: 800,
          easing: 'cubic-bezier(.75,0,.2,1)',
          fill: 'forwards',
        })
        .finished.then(() => go(href))
    }

    let mx = 0, my = 0, px = 0, py = 0, raf = 0
    const peekLoop = () => {
      if (!peek) return
      px += (mx - px) * 0.18
      py += (my - py) * 0.18
      peek.style.transform = `translate3d(${px - peek.offsetWidth / 2}px, ${py - peek.offsetHeight / 2}px, 0)`
      raf = peek.classList.contains('show') ? requestAnimationFrame(peekLoop) : 0
    }
    const onRowClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('.row')
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return
      e.preventDefault()
      const usePeek = hoverable && peek?.classList.contains('show')
      expand(Number(a.dataset.i), a.getAttribute('href')!, (usePeek ? peek! : a).getBoundingClientRect())
    }
    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
    }
    const onOver = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('.row')
      if (!a || !peek) return
      const i = Number(a.dataset.i)
      // only the English name, outlined: the picture is kept for the fly-in on click
      if (ixOn !== i) peek.textContent = a.dataset.name || ''
      setIx(i)
      if (!peek.classList.contains('show')) {
        px = mx = e.clientX
        py = my = e.clientY
        peek.classList.add('show')
      }
      if (!raf) raf = requestAnimationFrame(peekLoop)
    }
    const onLeave = () => {
      peek?.classList.remove('show')
      setIx(null)
    }
    const onFocusIn = (e: FocusEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>('.row')
      if (a) setIx(Number(a.dataset.i))
    }
    const onFocusOut = () => setIx(null)
    if (rows) {
      rows.addEventListener('click', onRowClick)
      rows.addEventListener('focusin', onFocusIn)
      rows.addEventListener('focusout', onFocusOut)
      if (hoverable && !reduce) {
        rows.addEventListener('mousemove', onMove)
        rows.addEventListener('mouseover', onOver)
        rows.addEventListener('mouseleave', onLeave)
      }
    }

    /* ---------- elements for update() ---------- */
    const ph = $('[data-ph]')
    const phs = $('[data-phs]')
    const wcol = $('[data-wcol]')
    const ticks = $$('[data-tick]')
    const phbgs = $$('[data-phbg]')
    const words: { bg: string; accent: string }[] = ph ? JSON.parse(ph.dataset.words || '[]') : []
    let wordIdx = -1
    const ix = $('[data-ix]')
    const reveal = $('[data-reveal]')
    const revealWords = reveal ? [...reveal.children] : []
    const heroMoving = $$('.hero [data-h]')
    const par = $$('[data-speed]')
    const next = $('[data-next]')
    const nframe = $('[data-nframe]')
    const nvis = nframe?.querySelector<HTMLElement>('.visual')
    const ntint = nframe?.querySelector<HTMLElement>('.next-tint')
    const nui = next?.querySelector<HTMLElement>('.next-ui > div')
    // desktop: the section after Passion slides over it (.after-ph), so the words finish one screen earlier
    const coverMQ = matchMedia('(min-width: 721px)')
    const ring = $<SVGCircleElement>('[data-ring]')
    const pct = $('[data-pct]')
    if (next) router.prefetch(next.dataset.next!, FULL)

    const update = () => {
      const vh = innerHeight
      const y = scrollY
      const max = document.documentElement.scrollHeight - vh
      if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`
      // the header is see-through at the top of the page and takes a background once the page moves under it
      site.classList.toggle('scrolled', y > 24)
      if (reduce) return

      if (ph && phs && wcol && words.length) {
        const r = ph.getBoundingClientRect()
        const cover = coverMQ.matches
        const hp = clamp(-r.top / (r.height - vh * (cover ? 2 : 1)), 0, 0.999)
        // while covered, the pinned section drifts up at a third of the scroll speed: the parallax hand-over
        const c = cover ? clamp((2 * vh - r.bottom) / vh, 0, 1) : 0
        phs.style.transform = c ? `translate3d(0,${(-c * vh * 0.3).toFixed(1)}px,0)` : ''
        const k = Math.floor(hp * words.length)
        if (k !== wordIdx) {
          wordIdx = k
          wcol.style.transform = `translateY(${-k * 1.1}em)`
          phs.style.setProperty('--h-bg', words[k].bg)
          phs.style.setProperty('--h-acc', words[k].accent)
          ticks.forEach((t, n) => t.classList.toggle('on', n <= k))
          phbgs.forEach((b, n) => b.classList.toggle('on', n === k))
        }
      }
      if (ixOn === null && rest !== base) paint(ixInView() ? rest : base)
      if (ix && rows && !hoverable) {
        const ir = ix.getBoundingClientRect()
        if (ir.top < vh * 0.5 && ir.bottom > vh * 0.5) {
          let best: number | null = null
          let bd = Infinity
          rowEls.forEach((a) => {
            if (!a.offsetParent) return // filtered out
            const rr = a.getBoundingClientRect()
            const d = Math.abs(rr.top + rr.height / 2 - vh / 2)
            if (d < bd) {
              bd = d
              best = Number(a.dataset.i)
            }
          })
          setIx(best)
        } else setIx(null)
      }
      if (reveal) {
        const ar = reveal.getBoundingClientRect()
        const rp = clamp((vh * 0.8 - ar.top) / (ar.height + vh * 0.3), 0, 1)
        const lit = Math.round(rp * revealWords.length)
        revealWords.forEach((s, n) => s.classList.toggle('dim', n >= lit))
      }
      heroMoving.forEach((el) => {
        el.style.transform = `translate3d(0,${(y * Number(el.dataset.h)).toFixed(1)}px,0)`
      })
      par.forEach((el) => {
        const r = el.parentElement!.getBoundingClientRect()
        const off = r.top + r.height / 2 - vh / 2
        el.style.transform = `translate3d(0,${(off * Number(el.dataset.speed)).toFixed(1)}px,0)`
      })

      if (next && nframe && nvis) {
        const r = next.getBoundingClientRect()
        const p = clamp(-r.top / (r.height - vh), 0, 1)
        const k = 1 - ease(p)
        lastP = p
        nframe.style.clipPath = `inset(${(26 * k).toFixed(2)}% ${(24 * k).toFixed(2)}% ${(26 * k).toFixed(2)}% ${(24 * k).toFixed(2)}% round ${(28 * k).toFixed(1)}px)`
        nvis.style.transform = `scale(${(1 + 0.35 * k).toFixed(3)})`
        // the colour band keeps the title readable, then clears over the last 20% so the hero arrives as it is
        if (ntint) ntint.style.opacity = p < 0.8 ? '1' : Math.max(0, (1 - p) / 0.2).toFixed(3)
        // the name sinks toward where the project page puts its title and is gone by 95%, so arriving is not a jump
        if (nui) {
          const d = clamp((p - 0.8) / 0.15, 0, 1)
          nui.style.opacity = d ? (1 - d).toFixed(3) : ''
          nui.style.transform = d ? `translate3d(0,${(d * d * vh * 0.18).toFixed(1)}px,0)` : ''
        }
        if (ring) ring.style.strokeDashoffset = (213.6 * (1 - p)).toFixed(1)
        if (pct) pct.textContent = Math.round(p * 100) + '%'
        if (p >= 0.995 && !timer && !busy) {
          timer = setTimeout(() => {
            timer = null
            if (lastP >= 0.995) go(next.dataset.next!)
          }, 250)
        } else if (p < 0.995 && timer) {
          clearTimeout(timer)
          timer = null
        }
      }
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        update()
      })
    }
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', update)
    update()

    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', update)
      removeEventListener('mm:filter', onFilter)
      if (timer) clearTimeout(timer)
      if (raf) cancelAnimationFrame(raf)
      peek?.classList.remove('show')
      if (rows) {
        rows.removeEventListener('click', onRowClick)
        rows.removeEventListener('focusin', onFocusIn)
        rows.removeEventListener('focusout', onFocusOut)
        rows.removeEventListener('mousemove', onMove)
        rows.removeEventListener('mouseover', onOver)
        rows.removeEventListener('mouseleave', onLeave)
      }
    }
  }, [router])

  return null
}
