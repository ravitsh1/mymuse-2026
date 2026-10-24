import Link from 'next/link'
import type { Project } from '@/payload-types'
import { projectPalette } from '@/lib/data'
import { Visual } from './Visual'

/**
 * End-of-page frame. Scrolling grows it to full screen; at 100% (held 250ms)
 * the site moves to that project. The link is the keyboard and reduced-motion path.
 */
export function NextFrame({ project, index, label }: { project: Project; index: number; label: string }) {
  const p = projectPalette(project)
  const href = `/portfolio/${project.slug}`
  return (
    <section className="next" data-next={href} aria-label={label}>
      <div className="next-sticky">
        <div className="next-frame" data-nframe style={{ '--n-bg': p.bg } as React.CSSProperties}>
          <Visual project={project} index={index} />
          {/* A band of the project colour behind the centred title, outside <Visual> so the hand-over stays identical. */}
          <div className="next-tint" aria-hidden="true" />
        </div>
        <div className="next-ui" style={{ color: p.ink, '--n-acc': p.acc } as React.CSSProperties}>
          <div>
            <span className="lbl">{label}</span>
            <span className="nm">{project.title}</span>
            <div className="ring" aria-hidden="true">
              <svg viewBox="0 0 76 76">
                <circle className="trk" cx="38" cy="38" r="34" />
                <circle className="val" data-ring cx="38" cy="38" r="34" strokeDasharray="213.6" strokeDashoffset="213.6" />
              </svg>
              <output data-pct>0%</output>
            </div>
            <Link className="go" href={href}>
              מעבר ל{project.title}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
