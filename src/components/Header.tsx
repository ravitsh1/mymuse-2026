import Link from 'next/link'
import type { Project } from '@/payload-types'
import { LogoWide } from './Logo'
import { Menu } from './Menu'

const pad = (n: number) => String(n).padStart(2, '0')

/** Brand book 2026: the sections (kept for the hidden desktop nav) and the intro call as a pill. */
const NAV = [
  { href: '/', label: 'דף הבית' },
  { href: '/work', label: 'פרויקטים' },
  { href: '/#services', label: 'השירותים שלנו' },
  { href: '/#about', label: 'קצת עלינו' },
  { href: '/#contact', label: 'צור קשר' },
]

export async function Header({ projects, current, home }: { projects: Project[]; current?: number; home?: boolean }) {
  const brand = true // the 2026 look (lib/brand.ts)
  return (
    <>
      <div className="bar" data-bar aria-hidden="true" />
      <header className="top">
        <Link className="logo" href="/" aria-label="MyMuse, עמוד הבית">
          <LogoWide />
        </Link>
        {brand && (
          <nav className="top-nav" aria-label="ניווט ראשי">
            <ul>
              {NAV.map((l, k) => (
                <li key={l.href}>
                  <Link href={l.href} aria-current={(k === 0 && home) || (k === 1 && current !== undefined) ? 'page' : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
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
        {brand && (
          <Link className="top-cta" href="/#contact">
            פגישת היכרות <span aria-hidden="true">←</span>
          </Link>
        )}
        <Menu />
      </header>
    </>
  )
}
