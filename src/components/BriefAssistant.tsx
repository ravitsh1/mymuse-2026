'use client'

import { useEffect, useRef, useState } from 'react'
import { BRIEF_FIELDS, LIMITS, VISITOR_FIELDS, isUnstated, type Brief, type BriefKey, type Turn } from '@/lib/brief-shared'

const GREETING = 'היי, אני מימו! ספרו לי בכמה מילים על הפרויקט: מה העסק עושה, ומה הייתם רוצים שהאתר יעשה בשבילו?'
const M_PATH = 'M 140.9 3.2 C 140.5 3.3,139.5 3.6,138.7 3.8 C 136.4 4.5,134.7 5.5,132.9 7.3 C 129.6 10.6,128.5 13.9,126.5 25.5 C 126.2 27.2,125.8 29.8,125.5 31.2 C 125.2 32.7,124.9 34.6,124.7 35.5 C 124.6 36.4,124.4 37.7,124.2 38.5 C 124.1 39.3,123.8 41.2,123.5 42.8 C 123.2 44.3,122.9 46.4,122.8 47.4 C 122.3 50.2,122 52.2,121.5 55.2 C 121 58.4,120.6 60.8,120.2 63.8 C 120.1 64.8,119.8 66.6,119.6 67.8 C 119.4 68.9,119.1 70.8,119 71.9 C 118.9 73,118.6 74.8,118.4 76 C 118.2 77.2,117.9 79,117.8 80.1 C 117.2 83.9,117 85.9,116.7 87.6 C 116.6 88.5,116.4 90.1,116.3 91.1 C 116.1 92.1,115.8 94.5,115.5 96.4 C 114.9 100.4,114.6 102.9,114.2 106.1 C 114.1 107.4,113.8 110,113.5 111.9 C 113 115.8,112.6 118.7,112.2 122.4 C 112.1 123.8,111.8 126.2,111.6 127.7 C 111.4 129.3,111.1 132.2,111 134.1 C 110.8 136,110.6 138.3,110.5 139.1 C 110.3 139.9,110.1 143.8,110.1 147.7 L 109.9 154.8 110.9 155.7 C 112.2 156.9,114.4 157.6,117.9 158 C 119.2 158.2,120.7 158.5,121.2 158.7 C 122.4 159.1,152 159,154.2 158.5 C 155.3 158.3,164.1 158.2,187.9 158 C 205.6 157.9,220.3 157.8,220.6 157.7 C 220.9 157.6,222.7 157.4,224.6 157.2 C 228.2 156.9,231.7 156.1,232.5 155.4 C 232.7 155.2,233 155,233.2 155 C 233.6 155,234.7 153.7,235.4 152.2 C 236.1 150.9,236.1 150.8,236.1 147 C 236.1 144.7,235.9 141.5,235.5 139 C 234.9 134.1,234.6 131.4,234.2 128.4 C 234.1 127.1,233.8 125,233.6 123.6 C 233.4 122.2,233.1 119.9,233 118.4 C 232.8 116.9,232.6 115.2,232.5 114.8 C 232.4 114.3,232.2 113.1,232.1 112.1 C 232 111.2,231.8 109,231.5 107.2 C 231.2 105.5,230.9 103.3,230.8 102.2 C 230.2 98.1,229.9 96.2,229.5 93.5 C 229.2 91.9,228.9 89.8,228.8 88.9 C 228.1 83.9,226.4 73.7,225.6 69.5 C 225.4 68.3,225.1 66.8,225 66.1 C 224.8 64.7,224.1 61.3,223.5 58.2 C 223.2 57,223 55.8,223 55.6 C 223 55.3,222.8 54.2,222.5 53 C 222.2 51.8,221.8 49.8,221.5 48.4 C 220.8 45,220.1 41.6,219.7 40.2 C 219.6 39.6,219.2 38.2,219 37.1 C 218.7 36,218.3 34.5,218.1 33.8 C 218 33,217.6 31.7,217.4 30.9 C 217.2 30.1,216.8 28.6,216.5 27.8 C 215.5 24.4,214.9 22.3,214.5 21.2 C 214.2 20.6,214 19.9,214 19.6 C 214 19.4,213.8 18.8,213.5 18.3 C 213.2 17.8,213 17.2,213 17.1 C 213 16.9,212.8 16.2,212.5 15.6 C 212.2 14.9,211.7 13.9,211.5 13.3 C 210.6 11.4,209.9 9.9,209.5 9.3 C 209.2 8.9,208.7 8,208.2 7.2 C 206.7 4.9,204.7 3.5,202.9 3.5 C 201.7 3.5,198.3 4.2,197.5 4.6 C 197.1 4.8,196.6 5,196.4 5 C 195.2 5,190.1 9.3,189 11.5 C 188.7 12,188.4 12.5,188.3 12.8 C 187.6 14,186 17.9,186 18.4 C 186 18.6,185.8 19.6,185.5 20.6 C 185.2 21.6,184.8 23.7,184.5 25.4 C 184.3 27,183.8 29.7,183.5 31.4 C 183.2 33,183 35.3,182.9 36.4 C 182.8 37.5,182.6 39.3,182.4 40.3 C 182.2 41.4,182 42.6,182 43 C 182 44,181.1 47.2,180.3 49.1 C 178.2 54.3,174.3 55.1,170.6 51.2 C 168.5 48.9,167.2 45.5,166.2 39.8 C 166.1 38.9,165.7 36.8,165.5 35.2 C 165.2 33.7,165 31.9,165 31.4 C 165 30.9,164.8 29.4,164.5 28.2 C 163.4 23,162.9 21,162.5 19.5 C 162.2 18.5,162 17.6,162 17.5 C 162 17.3,161.8 16.7,161.5 16.1 C 161.2 15.6,161 15,161 14.8 C 161 14.6,160.8 14,160.5 13.5 C 160.3 13,159.9 12.3,159.8 12 C 159.6 11.7,159.3 11.1,159.1 10.7 C 158.8 10.4,158.3 9.6,158 9.1 C 156.4 6.8,153.6 4.8,150.4 3.7 C 148.7 3.1,142.3 2.8,140.9 3.2'

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
  const [shown, setShown] = useState<BriefKey[]>([]) // fixed when the brief arrives, so a row never vanishes mid-edit
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
      if (data.done && data.brief) {
        setBrief(data.brief)
        setShown(VISITOR_FIELDS.filter((k) => !isUnstated(data.brief[k] ?? '')))
      }
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
          {/* the M of the MyMuse logo */}
          <svg viewBox="108 1 130 160" focusable="false">
            <path fill="currentColor" fillRule="evenodd" d={M_PATH} />
          </svg>
        </span>
        <div>
          <h3 id="bot-title">מימו, העוזר שלי</h3>
          <small>כמה שאלות קצרות, ואני מעביר לרוית את הפרטים · מבוסס AI · לא נותן הצעות מחיר</small>
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
              {shown.length > 0 && <p className="brief-hint">אפשר לתקן כל שורה לפני השליחה.</p>}
              {BRIEF_FIELDS.filter(([k]) => shown.includes(k)).map(([k, label]) => (
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
