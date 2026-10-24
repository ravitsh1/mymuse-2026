import Link from 'next/link'
import type { Project } from '@/payload-types'
import { LogoWide } from './Logo'

const pad = (n: number) => String(n).padStart(2, '0')

export function Header({ projects, current }: { projects: Project[]; current?: number }) {
  return (
    <>
      <div className="bar" data-bar aria-hidden="true" />
      <header className="top">
        <Link className="logo" href="/" aria-label="MyMuse, עמוד הבית">
          <LogoWide />
        </Link>
        <nav className="nav" aria-label="פרויקטים">
          {current !== undefined && (
            <span className="count">
              {pad(current + 1)} / {pad(projects.length)}
            </span>
          )}
          <ul className="dots">
            {projects.map((p, i) => (
              <li key={p.id}>
                <Link href={`/portfolio/${p.slug}`} aria-label={p.title} aria-current={i === current ? 'page' : undefined} />
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  )
}
