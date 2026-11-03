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

type Card = { href: string; title: string; desc: string; tone?: 'pop' | 'deep' | 'ink' | 'pink'; badge?: string }

/**
 * Dashboard top, in the site's 2026 look: a greeting in Karantina with the name in pink, links to the live site,
 * then shortcut cards for the everyday tasks (briefs from the site assistant first when there are any).
 */
export async function Welcome({ payload, user }: Props) {
  const count = (args: Parameters<Payload['count']>[0]) =>
    payload
      .count({ ...args, overrideAccess: true })
      .then((r) => r.totalDocs)
      .catch(() => 0)
  const [projects, hidden, briefs] = await Promise.all([
    count({ collection: 'projects' }),
    count({ collection: 'projects', where: { hidden: { equals: true } } }),
    count({ collection: 'briefs' }),
  ])
  const name = (user as { name?: string } | null | undefined)?.name || ''

  const cards: Card[] = [
    { href: '/admin/collections/projects/create', title: 'פרויקט חדש', desc: 'עמוד פרויקט עם תמונות, צבעים ותגיות שירותים', tone: 'pop' },
    {
      href: '/admin/collections/briefs',
      title: 'פניות',
      desc: 'בריפים שהגיעו מהעוזר באתר',
      tone: 'pink',
      badge: briefs ? `${briefs} בריפים` : undefined,
    },
    {
      href: '/admin/collections/projects',
      title: 'הפרויקטים',
      desc: `${projects - hidden} באתר${hidden ? `, ${hidden} מוסתרים` : ''} · הסדר בגרירה קובע את "הפרויקט הבא"`,
    },
    { href: '/admin/globals/home', title: 'עמוד הבית', desc: 'עלינו, עבודות נבחרות, שירותים, המלצות ויצירת קשר', tone: 'deep' },
    { href: '/admin/collections/categories', title: 'קטגוריות', desc: 'כפתורי הסינון מעל רשימת העבודות' },
    { href: '/admin/collections/pages', title: 'עמודים', desc: 'הצהרת נגישות ומדיניות פרטיות' },
    { href: '/admin/collections/media', title: 'מדיה', desc: 'תמונות וסרטונים. לא לשכוח טקסט חלופי' },
    { href: '/admin/globals/settings', title: 'הגדרות', desc: 'פרטי קשר, רשתות, העוזר באתר ותיאור לגוגל', tone: 'ink' },
  ]

  return (
    <>
      <div className="mm-welcome">
        <p className="mm-label" aria-hidden="true">
          MyMuse / Admin
        </p>
        <h2>
          {hello()}
          {name ? (
            <>
              , <em>{name}</em>
            </>
          ) : null}
        </h2>
        <p>מה מעדכנים היום? כל שמירה כאן מופיעה באתר תוך רגע.</p>
        <div className="mm-welcome__links">
          <a href="/" target="_blank" rel="noreferrer">
            לאתר <span aria-hidden="true">↗</span>
            <span className="sr-only"> (נפתח בחלון חדש)</span>
          </a>
          <a href="/admin/collections/briefs">פניות מהעוזר{briefs ? ` (${briefs})` : ''}</a>
        </div>
      </div>
      <div className="mm-cards">
        {cards.map((c) => (
          <a key={c.href} href={c.href} className={`mm-card${c.tone ? ` mm-card--${c.tone}` : ''}`}>
            <span className="mm-card__title">{c.title}</span>
            {c.badge && <span className="mm-card__badge">{c.badge}</span>}
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
