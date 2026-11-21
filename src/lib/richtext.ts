/**
 * Plain text ⇄ Lexical rich text for the project opening text (Projects → body). Shared by the migration that turned
 * the old plain field into rich text and by the hook that keeps the plain copy (Projects → lead) in step with it.
 * The plain copy feeds the meta description, the JSON-LD and llms.txt.
 */

type Node = { type: string; text?: string; children?: Node[]; [k: string]: unknown }
export type LexicalDoc = { root: Node }

const text = (t: string): Node => ({ type: 'text', text: t, format: 0, style: '', mode: 'normal', detail: 0, version: 1 })
const block = (type: string, children: Node[], extra: Record<string, unknown> = {}): Node => ({
  type,
  children,
  direction: 'rtl',
  format: '',
  indent: 0,
  version: 1,
  ...extra,
})
const BULLET = /^\s*[-–•*]\s+/

/**
 * The old plain text as rich text: a blank line starts a new paragraph, a single line break stays a line break, and
 * lines that start with "- " (or •) become a bulleted list.
 */
export function textToLexical(plain: string): LexicalDoc {
  const out: Node[] = []
  for (const chunk of plain.replace(/\r\n?/g, '\n').split(/\n\s*\n/)) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean)
    let para: string[] = []
    let items: string[] = []
    const flushPara = () => {
      if (!para.length) return
      const kids: Node[] = []
      para.forEach((l, i) => {
        if (i) kids.push({ type: 'linebreak', version: 1 })
        kids.push(text(l))
      })
      out.push(block('paragraph', kids, { textFormat: 0, textStyle: '' }))
      para = []
    }
    const flushList = () => {
      if (!items.length) return
      out.push(
        block(
          'list',
          items.map((t, i) => block('listitem', [text(t)], { value: i + 1 })),
          { listType: 'bullet', start: 1, tag: 'ul' },
        ),
      )
      items = []
    }
    for (const l of lines) {
      if (BULLET.test(l)) {
        flushPara()
        items.push(l.replace(BULLET, ''))
      } else {
        flushList()
        para.push(l)
      }
    }
    flushPara()
    flushList()
  }
  return { root: block('root', out) }
}

/** Rich text back to plain text in the same shape: paragraphs apart by a blank line, list items as "- …". */
export function lexicalToText(doc: unknown): string {
  const root = (doc as LexicalDoc | null)?.root
  if (!root?.children) return ''
  const inline = (n: Node): string =>
    n.type === 'linebreak' ? '\n' : typeof n.text === 'string' ? n.text : (n.children ?? []).map(inline).join('')
  const blocks = root.children.map((n) => {
    if (n.type === 'list') return (n.children ?? []).map((li) => `- ${inline(li).trim()}`).join('\n')
    return inline(n).trim()
  })
  return blocks.filter(Boolean).join('\n\n')
}
