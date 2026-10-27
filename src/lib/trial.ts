import type { Home, Project, Setting } from '@/payload-types'

/**
 * Palette trial "Mist" (brand book, 2026-10-27): light background, slate text, coral accent. It replaces the colours
 * read from the CMS instead of changing them, because preview builds share the production database (the light test
 * of 2026-10-26 went live that way). Never on production: if this branch were merged as is, the live site would not change.
 */
export const MIST = process.env.VERCEL_ENV !== 'production'

const SITE = { bg: '#f1f7f7', ink: '#3f4d4d', accent: '#b4585c' }
// Passion words: background + "&" colour, each "&" at least 3:1 (large text) on its background
const WORDS = [
  { bg: '#f1f7f7', accent: '#b4585c' },
  { bg: '#b0d7d8', accent: '#5d6b6b' },
  { bg: '#d5e5e5', accent: '#b4585c' },
  { bg: '#ddd3d3', accent: '#5d6b6b' },
]
// Service cards: background + text, 5:1 or more
const CARDS = [
  { bg: '#3f4d4d', ink: '#f1f7f7' },
  { bg: '#b0d7d8', ink: '#3f4d4d' },
  { bg: '#ddd3d3', ink: '#3f4d4d' },
  { bg: '#d5e5e5', ink: '#3f4d4d' },
  { bg: '#5d6b6b', ink: '#f1f7f7' },
]

export const mistSettings = (s: Setting): Setting => (MIST ? { ...s, ...SITE } : s)

/** Words lose their photos: the slate text needs a light background. */
export const mistHome = (h: Home): Home =>
  MIST
    ? {
        ...h,
        words: h.words?.map((w, i) => ({ ...w, ...WORDS[i % WORDS.length], image: null })),
        services: h.services?.map((c, i) => ({ ...c, ...CARDS[i % CARDS.length] })),
      }
    : h

/** Project pages take the four light Mist pairs in turn (by id, so a project keeps its pair), all with slate text. */
export const mistProject = (p: Project): Project => {
  if (!MIST) return p
  const w = WORDS[Number(p.id) % WORDS.length]
  return { ...p, bg: w.bg, ink: SITE.ink, accent: w.accent }
}
