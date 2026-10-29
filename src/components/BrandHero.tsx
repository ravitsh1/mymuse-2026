/**
 * Home hero of the 2026 brand book (palette trial b26): the main slogan with its last line in pink, one yellow
 * button, a secondary underlined link, and the 3D letters (cut from the designer's hero mockup; a full-size render is
 * still to come). The side label is decoration.
 */
export function BrandHero() {
  return (
    <section className="bh" aria-labelledby="pt">
      <div className="bh-art" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- a static file in public/, not CMS media */}
        <img src="/brand/hero-letters.webp" alt="" width={787} height={733} fetchPriority="high" />
      </div>
      <div className="bh-copy">
        <p className="bh-tag">סטודיו לעיצוב ופיתוח אתרים</p>
        <h1 id="pt" tabIndex={-1}>
          <span>מה שדמיינתם,</span> <span>עם כל מה שעוד</span> <em>לא חשבתם עליו.</em>
        </h1>
        <p className="bh-text">
          ב-MyMuse מתכננים, מעצבים ומפתחים אתרים בהתאמה אישית, עם ניסיון של מעל 15 שנה, הבנה טכנולוגית עמוקה ותשומת לב
          לפרטים הקטנים.
        </p>
        <div className="bh-actions">
          <a className="pill" href="#work">
            לצפייה בפרויקטים <span aria-hidden="true">←</span>
          </a>
          <a className="bh-link" href="#about">
            קצת עלינו
          </a>
        </div>
      </div>
      <p className="bh-side bh-side-b" aria-hidden="true">
        <span>02</span> Ideas Design Development Experience
      </p>
    </section>
  )
}
