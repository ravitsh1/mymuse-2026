import 'server-only'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'
import config from '@payload-config'
import type { Home, Media, Project, Setting } from '@/payload-types'

export const payload = cache(async () => getPayload({ config }))

const isDraft = async () => {
  try {
    return (await draftMode()).isEnabled
  } catch {
    return false
  }
}

/** All projects in the order set in the admin (drag-to-reorder). */
export const getProjects = cache(async (): Promise<Project[]> => {
  const draft = await isDraft()
  const res = await (await payload()).find({
    collection: 'projects',
    sort: '_order',
    depth: 1,
    limit: 200,
    draft,
    where: draft ? {} : { _status: { equals: 'published' } },
  })
  return res.docs
})

export const getHome = cache(async (): Promise<Home> => (await payload()).findGlobal({ slug: 'home', depth: 0 }))
export const getSettings = cache(async (): Promise<Setting> => (await payload()).findGlobal({ slug: 'settings', depth: 0 }))

export const getFooterPages = cache(async () => {
  const res = await (await payload()).find({
    collection: 'pages',
    where: { and: [{ inFooter: { equals: true } }, { _status: { equals: 'published' } }] },
    select: { title: true, slug: true },
    limit: 20,
    depth: 0,
  })
  return res.docs
})

export const getPage = cache(async (slug: string) => {
  const draft = await isDraft()
  const res = await (await payload()).find({
    collection: 'pages',
    where: draft ? { slug: { equals: slug } } : { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
    draft,
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ?? null
})

/* ---------- helpers ---------- */

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

export const asMedia = (m: unknown): Media | null => (m && typeof m === 'object' && 'url' in m ? (m as Media) : null)
