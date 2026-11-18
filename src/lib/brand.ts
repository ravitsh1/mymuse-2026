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

const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
const lum = (h: string) => {
  const [r, g, b] = rgb(h).map((s) => (s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}
const HEX = /^#[0-9a-f]{6}$/i

/** Best contrast a card text colour (off-white or ink) gets on this background; under 4.5:1 the card text is too faint. */
export const cardTextContrast = (bg: string) => Math.max(contrast(bg, BRAND.site.bg), contrast(bg, BRAND.site.ink))

/**
 * Service cards: the background Ravit picks per card in the admin (Home → שירותים), or the palette order when empty;
 * the text (and tags, mark) in off-white or ink, whichever reads better on it.
 */
export const brandHome = (h: Home): Home => ({
  ...h,
  services: h.services?.map((c, i) => {
    const bg = c.bg && HEX.test(c.bg.trim()) ? c.bg.trim() : BRAND.cards[i % BRAND.cards.length].bg
    const ink = contrast(bg, BRAND.site.bg) >= contrast(bg, BRAND.site.ink) ? BRAND.site.bg : BRAND.site.ink
    return { ...c, bg, ink }
  }),
})

/** Every project page on the site's porcelain, with the site's ink and pink. */
export const brandProject = (p: Project): Project => ({ ...p, bg: BRAND.site.bg, ink: BRAND.site.ink, accent: BRAND.site.accent })
