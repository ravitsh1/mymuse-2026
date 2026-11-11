import { HERO_TAG, HERO_TEXT, HERO_TITLE } from '@/globals/Settings'

/**
 * Home hero of the 2026 brand book: the main slogan with its last line in pink, one yellow
 * button, and the Passion words on brush strokes.
 */

/** "*pink*" inside a line becomes the accent; each line of the title is its own block. */
function Pink({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/).map((part, k) =>
        part.startsWith('*') && part.endsWith('*') && part.length > 2 ? <em key={k}>{part.slice(1, -1)}</em> : part,
      )}
    </>
  )
}

export function BrandHero({ tag, title, text }: { tag?: string | null; title?: string | null; text?: string | null }) {
  const lines = (title || HERO_TITLE).split('\n').map((l) => l.trim()).filter(Boolean)
  return (
    <section className="bh" aria-labelledby="pt">
      {/* the four Passion words on the designer's brush strokes (styles.css .bh-comp): they drop in one after another,
          then lag behind the scroll together. Each stroke and its word share a depth (--d): nearer pairs drift further
          with the scroll and the pointer (Motion sets --sy / --mx / --my) and cast a longer shadow, so the depth stays
          in the still composition too */}
      <div className="bh-art" aria-hidden="true">
        <div className="bh-slabs" data-speed="-0.2">
          <div className="bh-comp">
            {[1, 2, 3, 4].map((n) => (
              <i key={n} className={`brush brush-${n}`} />
            ))}
            {['Ideas', 'Design', 'Experience', 'Dev'].map((w, k) => (
              <span key={w} className={`slab slab-${k + 1}`}>
                {w}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="bh-copy">
        <p className="bh-tag">{tag || HERO_TAG}</p>
        <h1 id="pt" tabIndex={-1}>
          {lines.map((l, k) => (
            <span key={k}>
              <Pink text={l} />
            </span>
          ))}
        </h1>
        <p className="bh-text">{text || HERO_TEXT}</p>
        <div className="bh-actions">
          <a className="pill" href="#work">
            לצפייה בפרויקטים <span aria-hidden="true">←</span>
          </a>
        </div>
      </div>
    </section>
  )
}

/** Section label of the brand book: "01 / Who we are" — small, spaced capitals in burgundy. */
export function BrandLabel({ n, children }: { n: number; children: string }) {
  return (
    <p className="b-label" aria-hidden="true">
      {String(n).padStart(2, '0')} / {children}
    </p>
  )
}

/** A heading with its last words in pink: the brand book allows one highlighted line, always the last. */
export function LastWordPink({ text, words = 1 }: { text: string; words?: number }) {
  const parts = text.trim().split(/\s+/)
  const cut = Math.max(0, parts.length - words)
  return (
    <>
      {parts.slice(0, cut).join(' ')} <em>{parts.slice(cut).join(' ')}</em>
    </>
  )
}
