import React from 'react'
import type { Payload, TypedUser } from 'payload'

type Props = { payload: Payload; user?: TypedUser | null }

const hello = () => {
  const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Jerusalem' }).format(new Date()))
  if (h >= 5 && h < 12) return 'בוקר טוב'
  if (h >= 12 && h < 17) return 'צהריים טובים'
  if (h >= 17 && h < 22) return 'ערב טוב'
  return 'לילה טוב'
}

type Card = { href: string; title: string; desc: string; tone?: 'gold' | 'wine' | 'night' }

/** Dashboard top: a greeting with a link to the live site, then shortcut cards for the everyday tasks. */
export async function Welcome({ payload, user }: Props) {
  const count = await payload
    .count({ collection: 'projects', overrideAccess: true })
    .then((r) => r.totalDocs)
    .catch(() => 0)
  const name = (user as { name?: string } | null | undefined)?.name || ''

  const cards: Card[] = [
    { href: '/admin/collections/projects/create', title: 'פרויקט חדש', desc: 'עמוד פרויקט עם צבעים ותמונות משלו', tone: 'gold' },
    { href: '/admin/collections/projects', title: 'כל הפרויקטים', desc: `${count} פרויקטים · הסדר בגרירה קובע את "הפרויקט הבא"` },
    { href: '/admin/globals/home', title: 'עמוד הבית', desc: 'מילות ה־Passion, שירותים, עלינו ולקוחות', tone: 'wine' },
    { href: '/admin/collections/pages', title: 'עמודים', desc: 'הצהרת נגישות ומדיניות פרטיות' },
    { href: '/admin/collections/media', title: 'מדיה', desc: 'תמונות וסרטונים. לא לשכוח טקסט חלופי' },
    { href: '/admin/globals/settings', title: 'הגדרות האתר', desc: 'פרטי קשר, רשתות, צבעים ותיאור לגוגל', tone: 'night' },
  ]

  return (
    <>
      <div className="mm-welcome">
        <h2>
          {hello()}
          {name ? `, ${name}` : ''}
        </h2>
        <p>מה מעדכנים היום באתר של MyMuse?</p>
        <div className="mm-welcome__links">
          <a href="/" target="_blank" rel="noreferrer">
            לאתר ↗
          </a>
        </div>
      </div>
      <div className="mm-cards">
        {cards.map((c) => (
          <a key={c.href} href={c.href} className={`mm-card${c.tone ? ` mm-card--${c.tone}` : ''}`}>
            <span className="mm-card__title">{c.title}</span>
            <span className="mm-card__desc">{c.desc}</span>
            <span className="mm-card__arrow" aria-hidden="true">
              ←
            </span>
          </a>
        ))}
      </div>
      <h3 className="mm-section-title">כל התוכן</h3>
    </>
  )
}
