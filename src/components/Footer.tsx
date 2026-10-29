import Link from 'next/link'
import type { Setting } from '@/payload-types'
import { trialPalette } from '@/lib/trial'

export async function Footer({ settings, pages }: { settings: Setting; pages: { id: number; title: string; slug: string }[] }) {
  // brand book 2026: the tagline signs off every page
  const brand = (await trialPalette()) === 'b26'
  return (
    <footer className="foot wrap">
      {brand && (
        <p className="b-sign" lang="en">
          We are all <em>about passion</em>
        </p>
      )}
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
