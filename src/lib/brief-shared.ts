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

/** What the visitor sees and may correct before sending: only what they told us about. The rest (systems, timeline,
 *  notes) is still saved and mailed to Ravit. A field the model marked "לא צוין" is hidden too. */
export const VISITOR_FIELDS: readonly BriefKey[] = ['business', 'situation', 'goal']
export const isUnstated = (v: string) => v.trim().startsWith('לא צוין')
export type Brief = Record<BriefKey, string>

/** Limits: what one conversation may send, so a visitor (or a script) cannot run up the bill. */
export const LIMITS = { userTurns: 8, chars: 1200, total: 9000 }

export type Turn = { role: 'user' | 'assistant'; text: string }
