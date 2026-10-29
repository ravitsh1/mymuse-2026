import { cookies } from 'next/headers'
import type { Home, Project, Setting } from '@/payload-types'

/**
 * Palette trial (brand book, 2026-10-27): Mist and Viola next to the CMS colours (Neon), for the meeting with the
 * designer. A trial palette replaces the colours read from the CMS instead of changing them, because preview builds
 * share the production database (the light test of 2026-10-26 went live that way).
 * The switch (PaletteToggle) sets the "palette" cookie; without it the site shows Viola (previews: b26).
 * Remove the switch, or move the chosen palette into the CMS, before launch.
 */
type Trial = {
  site: { bg: string; ink: string; accent: string }
  /** Passion words: background + "&" colour, each "&" at least 3:1 (large text); project pages take these in turn */
  words: { bg: string; accent: string }[]
  /** Service cards: background + text, 5:1 or more */
  cards: { bg: string; ink: string }[]
}

const TRIALS = {
  mist: {
    site: { bg: '#f1f7f7', ink: '#3f4d4d', accent: '#b4585c' },
    words: [
      { bg: '#f1f7f7', accent: '#b4585c' },
      { bg: '#b0d7d8', accent: '#5d6b6b' },
      { bg: '#d5e5e5', accent: '#b4585c' },
      { bg: '#ddd3d3', accent: '#5d6b6b' },
    ],
    cards: [
      { bg: '#3f4d4d', ink: '#f1f7f7' },
      { bg: '#b0d7d8', ink: '#3f4d4d' },
      { bg: '#ddd3d3', ink: '#3f4d4d' },
      { bg: '#d5e5e5', ink: '#3f4d4d' },
      { bg: '#5d6b6b', ink: '#f1f7f7' },
    ],
  },
  viola: {
    site: { bg: '#fff6e8', ink: '#2a0f3a', accent: '#8e1fa0' },
    words: [
      { bg: '#fff6e8', accent: '#8e1fa0' },
      { bg: '#ffe3b3', accent: '#76129a' },
      { bg: '#f3d9f0', accent: '#76129a' },
      { bg: '#ffc27a', accent: '#76129a' },
    ],
    cards: [
      { bg: '#2a0f3a', ink: '#fff6e8' },
      { bg: '#ffe3b3', ink: '#2a0f3a' },
      { bg: '#ffc27a', ink: '#2a0f3a' },
      { bg: '#f3d9f0', ink: '#2a0f3a' },
      { bg: '#76129a', ink: '#fff6e8' },
    ],
  },
  // Brand book 2026, palette A "Electric Contrast": porcelain, deep violet ink, burgundy depth, laser pink for one
  // word or an indicator, lemon only for the one primary button (styles.css, html[data-trial="b26"]).
  b26: {
    site: { bg: '#f8f7f9', ink: '#1c0f30', accent: '#ff2d83' },
    words: [{ bg: '#f8f7f9', accent: '#ff2d83' }],
    cards: [
      { bg: '#1c0f30', ink: '#f8f7f9' },
      { bg: '#801f48', ink: '#f8f7f9' },
      { bg: '#ffffff', ink: '#1c0f30' },
      { bg: '#2e1f45', ink: '#f8f7f9' },
      { bg: '#efebf1', ink: '#1c0f30' },
    ],
  },
} satisfies Record<string, Trial>

export type TrialName = keyof typeof TRIALS
export const TRIAL_NAMES = Object.keys(TRIALS) as TrialName[]

// Viola on the live site since 2026-10-28 (Ravit's pick for now); previews open on the 2026 brand book (b26)
const DEFAULT: TrialName | null = process.env.VERCEL_ENV === 'production' ? 'viola' : 'b26'

/** The trial palette in use, or null for the CMS colours (Neon). */
export const trialPalette = async (): Promise<TrialName | null> => {
  const c = (await cookies()).get('palette')?.value
  if (!c) return DEFAULT
  return (TRIAL_NAMES as string[]).includes(c) ? (c as TrialName) : null
}

export const trialSettings = (s: Setting, t: TrialName | null): Setting => (t ? { ...s, ...TRIALS[t].site } : s)

export const trialHome = (h: Home, t: TrialName | null): Home => {
  if (!t) return h
  const { words, cards } = TRIALS[t]
  return {
    ...h,
    words: h.words?.map((w, i) => ({ ...w, ...words[i % words.length] })),
    services: h.services?.map((c, i) => ({ ...c, ...cards[i % cards.length] })),
  }
}

/** Project pages take the palette's word pairs in turn (by id, so a project keeps its pair), all with the site text. */
export const trialProject = (p: Project, t: TrialName | null): Project => {
  if (!t) return p
  const { site, words } = TRIALS[t]
  const w = words[Number(p.id) % words.length]
  return { ...p, bg: w.bg, ink: site.ink, accent: w.accent }
}

/** Browser chrome colour (theme-color) for the palette. */
export const trialChrome = (t: TrialName | null) => (t ? TRIALS[t].site.bg : '#1b1030')

/**
 * Home hero trial (same meeting): "work" shows a real project next to each Passion word, "statement" puts a Hebrew
 * headline above the words, "both" does both, "single" (the default since 2026-10-28) replaces the words with one
 * sentence over the photos, which change on their own (HeroCycle). Set by the "hero" cookie.
 */
export const HERO_LAYOUTS = ['single', 'classic', 'work', 'statement', 'both'] as const
export type HeroLayout = (typeof HERO_LAYOUTS)[number]

export const trialHero = async (): Promise<HeroLayout> => {
  const c = (await cookies()).get('hero')?.value
  return (HERO_LAYOUTS as readonly string[]).includes(c ?? '') ? (c as HeroLayout) : 'single'
}

/** The project shown with each Passion word in the "work" hero, by word. */
export const HERO_WORK: Record<string, string> = {
  Expertise: 'mybase',
  Culture: 'meteor-center',
  Flavor: 'agur',
  Lifestyle: '3-bears',
}
