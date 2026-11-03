import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { z } from 'zod'
import { payload } from '@/lib/data'
import { BRIEF_FIELDS, LIMITS, REPLY_SCHEMA, Reply, SYSTEM, SendBody, Turn } from '@/lib/brief'

/**
 * The brief assistant's server side (components/BriefAssistant.tsx).
 * POST { action: 'chat', turns }         → the next question (or the finished brief) from Claude
 * POST { action: 'send', turns, brief, name, contact } → saved in Briefs, then mailed to Settings → email
 * Lives at /brief, outside the (frontend) group: a route handler, not a page. Off unless Settings → briefAssistant
 * is on and ANTHROPIC_API_KEY is set.
 */

export const runtime = 'nodejs'
export const maxDuration = 60

const MODEL = 'claude-opus-5-5'

// Per-instance counters: a first line against a script hammering the endpoint (serverless instances don't share
// them, so the per-conversation limits in lib/brief.ts are the real cap on cost).
const hits = new Map<string, { n: number; sends: number; reset: number }>()
const HOUR = 60 * 60 * 1000
function allow(ip: string, send: boolean) {
  const now = Date.now()
  const h = hits.get(ip)
  const e = !h || h.reset < now ? { n: 0, sends: 0, reset: now + HOUR } : h
  e.n++
  if (send) e.sends++
  hits.set(ip, e)
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k)
  return e.n <= 60 && e.sends <= 5
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

/** The conversation as Claude sees it: from the first visitor message on, strictly alternating, ending on the visitor. */
function toMessages(turns: Turn[]): Anthropic.Beta.BetaMessageParam[] | null {
  const t = turns[0]?.role === 'assistant' ? turns.slice(1) : turns
  if (!t.length || t[t.length - 1].role !== 'user') return null
  if (t.some((x, i) => x.role !== (i % 2 ? 'assistant' : 'user'))) return null
  const user = t.filter((x) => x.role === 'user')
  if (user.length > LIMITS.userTurns || user.some((x) => x.text.length > LIMITS.chars)) return null
  if (t.reduce((n, x) => n + x.text.length, 0) > LIMITS.total) return null
  return t.map((x) => ({ role: x.role, content: x.text }))
}

async function enabled() {
  if (!process.env.ANTHROPIC_API_KEY) return false
  const s = await (await payload()).findGlobal({ slug: 'settings', depth: 0 })
  return Boolean(s.briefAssistant)
}

async function chat(turns: Turn[]) {
  const messages = toMessages(turns)
  if (!messages) return json({ error: 'limit' }, 400)
  const client = new Anthropic()
  try {
    const res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      // a short interview: low effort keeps answers quick; thinking stays on (it can't be turned off on this model)
      output_config: { effort: 'low', format: { type: 'json_schema', schema: REPLY_SCHEMA } },
      // if a safety classifier declines, the API retries on the model Anthropic recommends for that case
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      messages,
    })
    if (res.stop_reason === 'refusal' || res.stop_reason === 'max_tokens') return json({ error: 'model' }, 502)
    const text = res.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')
    const out = Reply.safeParse(JSON.parse(text))
    if (!out.success) return json({ error: 'model' }, 502)
    const r = out.data
    return json({ reply: r.reply, chips: r.chips.slice(0, 4), done: r.done && !!r.brief, brief: r.done ? r.brief : null })
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json({ error: 'busy' }, 503)
    if (err instanceof Anthropic.APIError) console.error('brief: Anthropic', err.status, err.message)
    else console.error('brief:', err)
    return json({ error: 'model' }, 502)
  }
}

async function send(body: z.infer<typeof SendBody>) {
  const p = await payload()
  const { brief, name, contact, turns } = body
  const doc = await p.create({
    collection: 'briefs',
    data: { name, contact, ...brief, transcript: turns },
    overrideAccess: true,
  })
  const settings = await p.findGlobal({ slug: 'settings', depth: 0 })
  const to = settings.email
  let mailed = false
  if (process.env.RESEND_API_KEY && to) {
    const lines = [
      `שם: ${name}`,
      `טלפון או מייל: ${contact}`,
      '',
      ...BRIEF_FIELDS.map(([k, label]) => `${label}: ${brief[k]}`),
      '',
      '— השיחה —',
      ...turns.map((t) => `${t.role === 'user' ? 'גולש' : 'עוזר'}: ${t.text}`),
    ]
    const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? contact : undefined
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: process.env.BRIEF_FROM || 'MyMuse <onboarding@resend.dev>',
      to,
      replyTo,
      subject: `בריף חדש מהאתר: ${name}`,
      text: lines.join('\n'),
    })
    if (error) console.error('brief: Resend', error)
    else mailed = true
  }
  if (mailed) await p.update({ collection: 'briefs', id: doc.id, data: { mailed: true }, overrideAccess: true })
  return json({ ok: true })
}

export async function POST(req: Request) {
  // same-site only: the form is the only client
  const origin = req.headers.get('origin')
  if (origin && new URL(origin).host !== req.headers.get('host')) return json({ error: 'origin' }, 403)
  if (!(await enabled())) return json({ error: 'off' }, 404)

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return json({ error: 'bad' }, 400)
  }
  const action = (raw as { action?: string })?.action
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local'
  if (!allow(ip, action === 'send')) return json({ error: 'busy' }, 429)

  if (action === 'chat') {
    const b = z.object({ turns: z.array(Turn).max(LIMITS.userTurns * 2 + 2) }).safeParse(raw)
    return b.success ? chat(b.data.turns) : json({ error: 'bad' }, 400)
  }
  if (action === 'send') {
    const b = SendBody.safeParse(raw)
    if (!b.success) return json({ error: 'bad' }, 400)
    if (b.data.website) return json({ ok: true }) // a bot filled the hidden field
    return send(b.data)
  }
  return json({ error: 'bad' }, 400)
}
