'use client'

import { useEffect, useRef, useState } from 'react'
import { BRIEF_FIELDS, LIMITS, type Brief, type Turn } from '@/lib/brief-shared'

const GREETING = 'היי! ספרו לי בכמה מילים על הפרויקט: מה העסק עושה, ומה הייתם רוצים שהאתר יעשה בשבילו?'
const ERRORS: Record<string, string> = {
  busy: 'יש עומס כרגע. אפשר לנסות שוב בעוד דקה, או לכתוב לרוית ישירות.',
  limit: 'השיחה ארוכה מדי לעוזר. אפשר לשלוח את מה שיש, או לכתוב לרוית ישירות.',
  default: 'משהו השתבש. אפשר לנסות שוב, או לכתוב לרוית ישירות.',
}

/**
 * The brief assistant in the contact section: a short interview with Claude (app/brief/route.ts) that ends in an
 * editable brief and a send button. Rendered only after hydration (it needs JS); without it, the email and phone
 * next to it are the way in. The log is a polite live region, so screen readers hear each answer once.
 */
export function BriefAssistant({ privacyHref }: { privacyHref?: string }) {
  const [ready, setReady] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([{ role: 'assistant', text: GREETING }])
  const [chips, setChips] = useState<string[]>([])
  const [brief, setBrief] = useState<Brief | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [draft, setDraft] = useState('')
  const log = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLTextAreaElement>(null)

  useEffect(() => setReady(true), [])
  useEffect(() => {
    const el = log.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns, chips, brief, busy, sent])

  // the box grows with the text (one line at first), and scrolls only past its max height
  function grow(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
    el.style.overflowY = el.scrollHeight > 140 ? 'auto' : 'hidden'
  }

  const userTurns = turns.filter((t) => t.role === 'user').length

  async function ask(text: string) {
    const t = text.trim().slice(0, LIMITS.chars)
    if (!t || busy) return
    const next: Turn[] = [...turns, { role: 'user', text: t }]
    setTurns(next)
    setChips([])
    setDraft('')
    requestAnimationFrame(() => input.current && grow(input.current))
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/brief', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'chat', turns: next }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTurns([...next, { role: 'assistant', text: data.reply }])
      setChips(data.chips ?? [])
      if (data.done && data.brief) setBrief(data.brief)
    } catch (e) {
      setError(ERRORS[(e as Error).message] ?? ERRORS.default)
    } finally {
      setBusy(false)
      input.current?.focus()
    }
  }

  async function send(form: HTMLFormElement) {
    if (!brief || busy) return
    const f = new FormData(form)
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', turns, brief, name: f.get('name'), contact: f.get('contact'), website: f.get('website') || undefined }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setSent(true)
    } catch (e) {
      setError(ERRORS[(e as Error).message] ?? ERRORS.default)
    } finally {
      setBusy(false)
    }
  }

  if (!ready) return null
  const over = userTurns >= LIMITS.userTurns && !brief

  return (
    <div className="bot">
      <div className="bot-head">
        <span className="bot-dot" aria-hidden="true">
          M
        </span>
        <div>
          <h3 id="bot-title">העוזר של MyMuse</h3>
          <small>מבוסס AI · לא נותן הצעות מחיר</small>
        </div>
      </div>
      <div className="bot-log" ref={log} role="log" aria-live="polite" aria-labelledby="bot-title">
        {turns.map((t, k) => (
          <div key={k} className={`msg ${t.role === 'user' ? 'me' : 'ai'}`}>
            <span className="sr-only">{t.role === 'user' ? 'אתם: ' : 'העוזר: '}</span>
            {t.text}
          </div>
        ))}
        {busy && !brief && (
          <div className="typing">
            <span className="sr-only">העוזר כותב…</span>
            <i aria-hidden="true" />
            <i aria-hidden="true" />
            <i aria-hidden="true" />
          </div>
        )}
        {chips.length > 0 && !busy && !brief && (
          <div className="chips">
            {chips.map((c) => (
              <button key={c} type="button" onClick={() => ask(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
        {brief && !sent && (
          <div className="brief">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(e.currentTarget)
              }}
            >
              <h4>הבריף שלכם</h4>
              <p className="brief-hint">אפשר לתקן כל שורה לפני השליחה.</p>
              {BRIEF_FIELDS.map(([k, label]) => (
                <label key={k} className="brief-row">
                  <span>{label}</span>
                  <textarea rows={2} value={brief[k]} maxLength={600} onChange={(e) => setBrief({ ...brief, [k]: e.target.value })} />
                </label>
              ))}
              <label className="brief-row">
                <span>שם</span>
                <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
              </label>
              <label className="brief-row">
                <span>טלפון או מייל</span>
                <input name="contact" required minLength={5} maxLength={120} autoComplete="email" dir="auto" />
              </label>
              <label className="hp" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <button className="pill" type="submit" disabled={busy}>
                {busy ? 'שולח…' : 'שליחה לרוית'} <span aria-hidden="true">←</span>
              </button>
            </form>
          </div>
        )}
        {sent && <div className="msg ai">תודה! הבריף אצל רוית, והיא תחזור אליכם בהקדם.</div>}
      </div>
      {error && (
        <p className="bot-error" role="alert">
          {error}
        </p>
      )}
      {!brief && !sent && (
        <form
          className="bot-form"
          onSubmit={(e) => {
            e.preventDefault()
            ask(draft)
          }}
        >
          <label htmlFor="bot-q" className="sr-only">
            ההודעה שלכם לעוזר
          </label>
          <textarea
            id="bot-q"
            ref={input}
            rows={1}
            value={draft}
            maxLength={LIMITS.chars}
            disabled={over}
            placeholder={over ? 'הגענו לסוף השיחה' : userTurns ? 'כתבו תשובה…' : 'ספרו על הפרויקט…'}
            onChange={(e) => {
              setDraft(e.target.value)
              grow(e.target)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                ask(draft)
              }
            }}
          />
          <button className="pill" type="submit" disabled={busy || over || !draft.trim()}>
            שליחה <span aria-hidden="true">←</span>
          </button>
        </form>
      )}
      <p className="bot-note">
        השיחה עוברת לעיבוד אצל Anthropic (Claude) ונשמרת אצלנו רק כשלוחצים &quot;שליחה לרוית&quot;.
        {privacyHref && (
          <>
            {' '}
            <a href={privacyHref}>מדיניות הפרטיות</a>
          </>
        )}
      </p>
    </div>
  )
}
