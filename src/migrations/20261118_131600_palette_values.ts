import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Palette 2026-11-18, the stored side (#122 changed the code): Settings → צבעים (accent word, the four hero strokes)
// and the colours of the about words on the home page. Each value moves only while it is still the previous
// palette's, so a colour Ravit picked in the admin stays. Runs after palette_defaults (Payload selects every column).
const same = (a: string | null | undefined, ...b: string[]) => b.includes((a ?? '').trim().toLowerCase())

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const s = await payload.findGlobal({ slug: 'settings', depth: 0, req })
  const data: Record<string, string> = {}
  if (same(s.accentWord, '#9e3a64', '#801f48')) data.accentWord = '#c94f86'
  if (same(s.brushIdeas, '#000000', '#1c0f30')) data.brushIdeas = '#1b0d2d'
  if (same(s.brushDesign, '#9e3a64', '#6e2448')) data.brushDesign = '#c94f86'
  if (same(s.brushExperience, '#dc3180')) data.brushExperience = '#17283f'
  if (same(s.brushDev, '#f0e765', '#f4e85a')) data.brushDev = '#d8f450'
  if (Object.keys(data).length) await payload.updateGlobal({ slug: 'settings', data, depth: 0, req })
  payload.logger.info(`palette values: settings ${JSON.stringify(data)}`)

  const h = await payload.findGlobal({ slug: 'home', depth: 0, req })
  let changed = false
  const aboutWords = (h.aboutWords ?? []).map((w) => {
    const word = (w.word ?? '').trim().toLowerCase()
    let color = w.color
    if ((word === 'ideas' || word === 'experience') && same(w.color, '#1c0f30')) color = '#1b0d2d'
    if (word === 'design' && same(w.color, '#9e3a64', '#801f48')) color = '#c94f86'
    if (word === 'development' && same(w.color, '#c94f86', '#ff2d83')) color = '#9e3a64'
    if (color !== w.color) changed = true
    return { ...w, color }
  })
  if (changed) await payload.updateGlobal({ slug: 'home', data: { aboutWords }, depth: 0, req })
  payload.logger.info(`palette values: about words ${changed ? 'updated' : 'left as they are'}`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('palette values: down is a no-op (content only)')
}
