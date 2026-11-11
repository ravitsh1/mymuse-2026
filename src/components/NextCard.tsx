import Link from 'next/link'
import type { Project } from '@/payload-types'
import { projectPalette } from '@/lib/data'
import { Visual } from './Visual'

/**
 * End of a project page, the clear version (Settings → nextMode = "card"): a card for the next project with a
 * button, and a link back to the list. Nothing happens by scrolling. A click grows the card's picture to full screen
 * (Motion, [data-fly]) and the next page opens on the same picture, so the hand-over stays seamless.
 * The only way on since 2026-11-11 (NextFrame, scroll to enter, is no longer rendered).
 */
export function NextCard({ project, index }: { project: Project; index: number }) {
  const p = projectPalette(project)
  const href = `/portfolio/${project.slug}`
  return (
    <section className="next-card wrap" aria-labelledby="nc-title" data-next-card={href}>
      <p className="nc-label" aria-hidden="true">
        Next project
      </p>
      <Link className="nc-link" href={href} data-fly>
        <span className="nc-media" style={{ '--n-bg': p.bg } as React.CSSProperties}>
          <Visual project={project} index={index} />
        </span>
        <span className="nc-text">
          <span className="nc-kicker">הפרויקט הבא</span>
          <span className="nc-name" id="nc-title">
            {project.title}
          </span>
          {project.field && <span className="nc-field">{project.field}</span>}
          <span className="pill nc-go">
            לפרויקט הבא <span aria-hidden="true">←</span>
          </span>
        </span>
      </Link>
      <Link className="nc-all" href="/work">
        לכל הפרויקטים
      </Link>
    </section>
  )
}
