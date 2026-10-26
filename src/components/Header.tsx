import Link from 'next/link'
import type { Project } from '@/payload-types'
import { LogoWide } from './Logo'
import { Menu } from './Menu'

const pad = (n: number) => String(n).padStart(2, '0')

export function Header({ projects, current }: { projects: Project[]; current?: number }) {
  return (
    <>
      <div className="bar" data-bar aria-hidden="true" />
      <header className="top">
        <Link className="logo" href="/" aria-label="MyMuse, עמוד הבית">
          <LogoWide />
        </Link>
        {current !== undefined && (
          <span className="count">
            <span aria-hidden="true">
              {pad(current + 1)} / {pad(projects.length)}
            </span>
            <span className="sr-only">
              פרויקט {current + 1} מתוך {projects.length}
            </span>
          </span>
        )}
        <Menu />
      </header>
    </>
  )
}
