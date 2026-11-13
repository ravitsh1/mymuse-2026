import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// Accessibility statement (2026-11-13, Ravit): meetings can take place at an accessible location when needed. One
// paragraph after the studio's list ("נגישות הסטודיו"); only if the page does not say it yet.

type LexNode = { type: string; children?: LexNode[]; text?: string; [k: string]: unknown }

const SENTENCE = 'במידת הצורך, הפגישה תתקיים במקום נגיש אחר. אפשר לבקש זאת מראש בטלפון או בדוא"ל.'
const para: LexNode = {
  type: 'paragraph', format: '', indent: 0, version: 1, direction: 'rtl', textStyle: '', textFormat: 0,
  children: [{ mode: 'normal', text: SENTENCE, type: 'text', style: '', detail: 0, format: 0, version: 1 }],
}
const textOf = (n: LexNode): string => n.text ?? (n.children ?? []).map(textOf).join('')

const load = async (payload: MigrateUpArgs['payload'], req: MigrateUpArgs['req']) =>
  (await payload.find({ collection: 'pages', where: { slug: { equals: 'accessibility' } }, limit: 1, depth: 0, req })).docs[0]

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const page = await load(payload, req)
  const root = (page?.content as { root?: { children?: LexNode[] } } | undefined)?.root
  const nodes = root?.children
  if (!page || !nodes || JSON.stringify(nodes).includes('במקום נגיש')) return
  const at = nodes.findIndex((n) => textOf(n).includes('הסדנאות 8'))
  if (at < 0) return
  const after = nodes[at + 1]?.type === 'list' ? at + 2 : at + 1
  nodes.splice(after, 0, para)
  await payload.update({ collection: 'pages', id: page.id, data: { content: page.content }, depth: 0, req })
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const page = await load(payload, req)
  const root = (page?.content as { root?: { children?: LexNode[] } } | undefined)?.root
  if (!page || !root?.children) return
  root.children = root.children.filter((n) => textOf(n) !== SENTENCE)
  await payload.update({ collection: 'pages', id: page.id, data: { content: page.content }, depth: 0, req })
}
