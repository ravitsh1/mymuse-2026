/** The brief assistant's constants and types, without zod: safe to import from the client component. */

export const BRIEF_FIELDS = [
  ['business', 'העסק'],
  ['situation', 'מצב היום'],
  ['goal', 'המטרה'],
  ['systems', 'מערכות'],
  ['timeline', 'לוח זמנים'],
  ['notes', 'עוד'],
] as const

export type BriefKey = (typeof BRIEF_FIELDS)[number][0]
export type Brief = Record<BriefKey, string>

/** Limits: what one conversation may send, so a visitor (or a script) cannot run up the bill. */
export const LIMITS = { userTurns: 8, chars: 1200, total: 9000 }

export type Turn = { role: 'user' | 'assistant'; text: string }
