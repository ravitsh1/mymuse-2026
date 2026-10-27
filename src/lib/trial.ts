import { cookies } from 'next/headers'
import type { Home, Project, Setting } from '@/payload-types'

/**
 * Palette trial "Mist" (brand book, 2026-10-27): light background, slate text, coral accent, for comparing with Neon
 * in the meeting with the designer. It replaces the colours read from the CMS instead of changing them, because
 * preview builds share the production database (the light test of 2026-10-26 went live that way).
 * The switch (PaletteToggle) sets the "palette" cookie; without it production shows Neon and previews show Mist.
 * Remove the switch, or move the chosen palette into the CMS, before launch.
 */
const DEFAULT_MIST = process.env.VERCEL_ENV !== 'production'

export const isMist = async () => {
  const c = (await cookies()).get('palette')?.value
  return c ? c === 'mist' : DEFAULT_MIST
}

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

export const mistSettings = (s: Setting, on: boolean): Setting => (on ? { ...s, ...SITE } : s)

export const mistHome = (h: Home, on: boolean): Home =>
  on
    ? {
        ...h,
        words: h.words?.map((w, i) => ({ ...w, ...WORDS[i % WORDS.length] })),
        services: h.services?.map((c, i) => ({ ...c, ...CARDS[i % CARDS.length] })),
      }
    : h

/** Project pages take the four light Mist pairs in turn (by id, so a project keeps its pair), all with slate text. */
export const mistProject = (p: Project, on: boolean): Project => {
  if (!on) return p
  const w = WORDS[Number(p.id) % WORDS.length]
  return { ...p, bg: w.bg, ink: SITE.ink, accent: w.accent }
}
