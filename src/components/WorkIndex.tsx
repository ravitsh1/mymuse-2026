import Link from 'next/link'
import type { Project } from '@/payload-types'
import { accentTones, projectPalette } from '@/lib/data'
import { BrandLabel } from './BrandHero'
import { CategoryFilter } from './CategoryFilter'
import { Visual } from './Visual'

type Item = { p: Project; i: number }
const catOf = (p: Project) => (p.category && typeof p.category === 'object' ? String(p.category.id) : p.category ? String(p.category) : '')

/**
 * The typographic project list (Motion: rows light up, the picture shows beside the name, a click grows it to full
 * screen). The home page shows a few selected projects and links to /work; /work shows them all with the filters.
 */
export function WorkIndex({
  items,
  categories = [],
  brand,
  label,
  title,
  titleId = 'ixh',
  as: H = 'h2',
  subtitle,
  service,
  shuffle,
  showAll,
  allHref,
}: {
  items: Item[]
  /** category filter buttons (only the categories that have a project in the list are shown) */
  categories?: { id: number | string; title: string }[]
  brand?: boolean
  label?: { n: number; text: string }
  title: string
  titleId?: string
  as?: 'h1' | 'h2'
  subtitle?: string | null
  service?: { label: string; count: number } | null
  shuffle?: boolean
  /** /work: every project at once (no "more" step) */
  showAll?: boolean
  /** home: the link to the full list under the selection */
  allHref?: string
}) {
  const cats = categories.filter((c) => items.some(({ p }) => catOf(p) === String(c.id)))
  return (
    <section className="ix wrap" id="work" data-ix aria-labelledby={titleId}>
      {brand && label && <BrandLabel n={label.n}>{label.text}</BrandLabel>}
      <div className="ix-head">
        <H id={titleId} tabIndex={H === 'h1' ? -1 : undefined}>
          {title}
        </H>
        {subtitle && <p className="b-text">{subtitle}</p>}
        {cats.length > 1 && (
          <CategoryFilter categories={cats.map((c) => ({ id: c.id, title: c.title }))} all={brand} shuffle={shuffle} step={showAll ? Infinity : undefined} />
        )}
      </div>
      {service && (
        <p className="ix-service">
          {service.count ? 'פרויקטים עם השירות' : 'עדיין אין פרויקטים עם השירות'} <strong>{service.label}</strong>
          <Link href="/work">לכל הפרויקטים</Link>
        </p>
      )}
      <ul className="rows" data-rows>
        {items.map(({ p, i }) => {
          const c = projectPalette(p)
          return (
            <li key={p.id} data-cat={catOf(p)}>
              <a className="row" href={`/portfolio/${p.slug}`} data-i={i} data-name={p.nameEn || p.title} data-bg={c.bg} data-ink={c.ink} data-acc={c.acc} data-acc-sm={accentTones(c).sm} data-acc-lg={accentTones(c).lg}>
                <span className="rn">{p.title}</span>
                {p.field && <span className="rf">{p.field}</span>}
              </a>
              <div hidden data-visual-for={i}>
                <Visual project={p} index={i} />
              </div>
            </li>
          )
        })}
      </ul>
      <div className="ix-more" data-more>
        {allHref && (
          <Link className="go" href={allHref}>
            לכל הפרויקטים
          </Link>
        )}
      </div>
    </section>
  )
}
