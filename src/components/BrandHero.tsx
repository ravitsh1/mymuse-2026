/**
 * Home hero of the 2026 brand book (palette trial b26): the main slogan with its last line in pink, one yellow
 * button, and the Passion words as painted slabs. The side label is decoration.
 */

export function BrandHero() {
  return (
    <section className="bh" aria-labelledby="pt">
      {/* the four Passion words as painted slabs leaning on each other (brand book, photo brief A): built in CSS, so
          sharp at any size; they drop in one after another, then lag behind the scroll together */}
      <div className="bh-art" aria-hidden="true">
        <div className="bh-slabs" data-speed="-0.2">
          <span className="slab">Ideas</span>
          <span className="slab">Design</span>
          <span className="slab">Develop</span>
          <span className="slab">XP</span>
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
