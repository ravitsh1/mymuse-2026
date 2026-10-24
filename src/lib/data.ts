import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Home, Project, Setting } from '@/payload-types'

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
  return res.docs
})

export const getHome = cache(async (): Promise<Home> => (await payload()).findGlobal({ slug: 'home', depth: 1 }))
export const getSettings = cache(async (): Promise<Setting> => (await payload()).findGlobal({ slug: 'settings', depth: 1 }))

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
  ink: p.ink || '#efe8de',
  acc: p.accent || '#d6a05b',
})

export const sitePalette = (s: Setting): Palette => ({
  bg: s.bg || '#16141a',
  ink: s.ink || '#efe8de',
  acc: s.accent || '#d6a05b',
})

/** CSS custom properties for a palette, applied on the page wrapper. */
export const paletteVars = (p: Palette): React.CSSProperties =>
  ({ '--p-bg': p.bg, '--p-ink': p.ink, '--p-acc': p.acc, '--p-soft': p.ink + '26' }) as React.CSSProperties

export const nextProject = (list: Project[], current: Project | null) => {
  if (!list.length) return null
  if (!current) return list[0]
  const i = list.findIndex((p) => p.id === current.id)
  return list[(i + 1) % list.length]
}
