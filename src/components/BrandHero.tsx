/**
 * Home hero of the 2026 brand book (palette trial b26): the main slogan with its last line in pink, one yellow
 * button, and the 3D letters (cut from the designer's hero mockup; a full-size render is
 * still to come). The side label is decoration.
 */
import type React from 'react'

export function BrandHero() {
  return (
    <section className="bh" aria-labelledby="pt">
      {/* the 3D letters in three layers of one picture (the room with the M, the yellow sheet, the Y card), each
          transparent outside its piece: they rise in one after another, then lag behind the scroll together */}
      <div className="bh-art" aria-hidden="true">
        <div className="bh-layers" data-speed="-0.25">
          {['base', 'yellow', 'ycard'].map((l, k) => (
            // eslint-disable-next-line @next/next/no-img-element -- static files in public/, not CMS media
            <img key={l} src={`/brand/hero-${l}.webp`} alt="" width={787} height={733} fetchPriority={k ? 'auto' : 'high'} style={{ '--k': k } as React.CSSProperties} />
          ))}
        </div>
      </div>
      <div className="bh-copy">
        <p className="bh-tag">סטודיו לעיצוב ופיתוח אתרים</p>
        <h1 id="pt" tabIndex={-1}>
          <span>מה שדמיינתם,</span> <span>עם כל מה שעוד</span> <em>לא חשבתם עליו.</em>
        </h1>
        <p className="bh-text">
          ב־MyMuse מתכננים, מעצבים ומפתחים אתרים בהתאמה אישית מאז 2010, עם חשיבה על העיצוב, החוויה והטכנולוגיה, ועם
          מקום לכל האפשרויות שמגלים בדרך.
        </p>
        <div className="bh-actions">
          <a className="pill" href="#work">
            לצפייה בפרויקטים <span aria-hidden="true">←</span>
          </a>
        </div>
      </div>
      <p className="bh-side bh-side-b" aria-hidden="true">
        <span>02</span> Ideas Design Development Experience
      </p>
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
