import type { Home, Project, Setting } from '@/payload-types'

/**
 * The 2026 brand book (palette A "Electric Contrast"), settled on 2026-10-29 and the only look since the design
 * trials were removed (2026-11-11): porcelain, deep violet ink, laser pink for one word or an indicator, lemon only
 * for the one primary button. The colours come from here, not from the colour fields in the CMS (hidden in the admin).
 */
export const BRAND = {
  site: { bg: '#f8f7f9', ink: '#1c0f30', accent: '#ff2d83' },
  /** service cards, in order: background + text, 5:1 or more */
  cards: [
    { bg: '#1c0f30', ink: '#f8f7f9' },
    { bg: '#801f48', ink: '#f8f7f9' },
    { bg: '#ffffff', ink: '#1c0f30' },
    { bg: '#2e1f45', ink: '#f8f7f9' },
    { bg: '#f4e85a', ink: '#1c0f30' },
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
