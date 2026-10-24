import Link from 'next/link'
import type { Setting } from '@/payload-types'

export function Footer({ settings, pages }: { settings: Setting; pages: { id: number; title: string; slug: string }[] }) {
  return (
    <footer className="foot wrap">
      <span>© MyMuse {new Date().getFullYear()}</span>
      <ul>
        {pages.map((p) => (
          <li key={p.id}>
            <Link href={`/${p.slug}`}>{p.title}</Link>
          </li>
        ))}
        {(settings.social ?? []).map((s) => (
          <li key={s.id ?? s.url}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
              <span className="sr-only"> (נפתח בחלון חדש)</span>
            </a>
          </li>
        ))}
      </ul>
    </footer>
  )
}
