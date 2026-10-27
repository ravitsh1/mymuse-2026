import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Home, Project, Setting } from '@/payload-types'
import { trialHome, trialPalette, trialProject, trialSettings } from '@/lib/trial'

export const payload = cache(() => getPayload({ config }))

/** Visible projects in the order set in the admin (drag-to-reorder). This order is the "next project" chain. */
export const getProjects = cache(async (): Promise<Project[]> => {
  const res = await (await payload()).find({
    collection: 'projects',
    where: { hidden: { not_equals: true } },
    sort: '_order',
    depth: 1,
    limit: 200,
  })
  const trial = await trialPalette()
  return res.docs.map((p) => trialProject(p, trial))
})

/** Categories in their admin (drag) order: the filter buttons on the home page. */
export const getCategories = cache(async () => {
  const res = await (await payload()).find({ collection: 'categories', sort: '_order', depth: 0, limit: 50 })
  return res.docs
})

export const getHome = cache(async (): Promise<Home> => trialHome(await (await payload()).findGlobal({ slug: 'home', depth: 1 }), await trialPalette()))
export const getSettings = cache(async (): Promise<Setting> =>
  trialSettings(await (await payload()).findGlobal({ slug: 'settings', depth: 1 }), await trialPalette()),
)

export const getFooterPages = cache(async () => {
  const res = await (await payload()).find({
    collection: 'pages',
    where: { inFooter: { equals: true } },
    sort: 'createdAt',
    select: { title: true, slug: true },
    limit: 20,
    depth: 0,
  })
  return res.docs
})

export const getPage = cache(async (slug: string) => {
  const res = await (await payload()).find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1, depth: 1 })
  return res.docs[0] ?? null
})

/* ---------- palette ---------- */

export type Palette = { bg: string; ink: string; acc: string }

export const projectPalette = (p: Project): Palette => ({
  bg: p.bg || '#1b2a24',
  ink: p.ink || '#ffe8c2',
  acc: p.accent || '#ff3d7f',
})

export const sitePalette = (s: Setting): Palette => ({
  bg: s.bg || '#1b1030',
  ink: s.ink || '#ffe8c2',
  acc: s.accent || '#ff3d7f',
})

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) || 0)
const hex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const lum = (c: number[]) => {
  const [r, g, b] = c.map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

/**
 * The accent as text: the palette colour itself where it reads on the background, otherwise moved toward the text
 * colour just far enough. Ravit picks accents from the palette for their look (swatch, bar, ring, shapes use them
 * as they are); text needs 4.5:1 (small) or 3:1 (large) whatever she picks.
 */
export const accentText = (p: Palette, min: number) => {
  const [acc, bg, ink] = [rgb(p.acc), rgb(p.bg), rgb(p.ink)]
  for (let t = 0; t <= 1; t += 0.05) {
    const c = acc.map((v, i) => v + (ink[i] - v) * t)
    if (contrast(c, bg) >= min) return hex(c)
  }
  return p.ink
}

/** --p-acc-sm: accent for small text (4.5:1); --p-acc-lg: for large text (3:1). */
export const accentTones = (p: Palette) => ({ sm: accentText(p, 4.5), lg: accentText(p, 3) })

/** CSS custom properties for a palette, applied on the page wrapper. */
export const paletteVars = (p: Palette): React.CSSProperties => {
  const t = accentTones(p)
  return { '--p-bg': p.bg, '--p-ink': p.ink, '--p-acc': p.acc, '--p-acc-sm': t.sm, '--p-acc-lg': t.lg, '--p-soft': p.ink + '26' } as React.CSSProperties
}

export const nextProject = (list: Project[], current: Project | null) => {
  if (!list.length) return null
  if (!current) return list[0]
  const i = list.findIndex((p) => p.id === current.id)
  return list[(i + 1) % list.length]
}
