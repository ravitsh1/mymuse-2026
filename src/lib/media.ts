import type { Media } from '@/payload-types'

// Payload returns absolute URLs; files served by this same site become relative paths, so next/image treats
// them as local (it won't optimize "remote" images from localhost / private addresses).
const OWN_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?=\/)/

/** Upload fields come back populated (depth ≥ 1) or as a bare id; only the populated form has a URL. */
export const asMedia = (m: unknown): Media | null =>
  m && typeof m === 'object' && 'url' in m && (m as Media).url ? (m as Media) : null

export const mediaUrl = (m: unknown): string | undefined => asMedia(m)?.url?.replace(OWN_ORIGIN, '')
