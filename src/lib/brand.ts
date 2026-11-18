import type { Home, Project, Setting } from '@/payload-types'

/**
 * The 2026 brand book, settled on 2026-10-29; palette changed 2026-11-18: off-white, eggplant ink, ink blue for dark
 * areas, calm pink for the accent word, burgundy for small accent text, lime only for the primary button and DEV.
 * The base colours come from here; the accent word and the hero strokes from Settings → צבעים (lib/data.ts).
 */
export const BRAND = {
  site: { bg: '#f8f6f3', ink: '#1b0d2d', accent: '#c94f86' },
  /** service cards, in order: background + text, 5:1 or more */
  cards: [
    { bg: '#1b0d2d', ink: '#f8f6f3' },
    { bg: '#9e3a64', ink: '#f8f6f3' },
    { bg: '#ffffff', ink: '#1b0d2d' },
    { bg: '#3f546e', ink: '#f8f6f3' },
    { bg: '#e1f450', ink: '#1b0d2d' },
  ],
}

/** Browser chrome colour (theme-color). */
export const THEME_COLOR = BRAND.site.bg

export const brandSettings = (s: Setting): Setting => ({ ...s, ...BRAND.site })

export const brandHome = (h: Home): Home => ({
  ...h,
  services: h.services?.map((c, i) => ({ ...c, ...BRAND.cards[i % BRAND.cards.length] })),
})

/** Every project page on the site's porcelain, with the site's ink and pink. */
export const brandProject = (p: Project): Project => ({ ...p, bg: BRAND.site.bg, ink: BRAND.site.ink, accent: BRAND.site.accent })
