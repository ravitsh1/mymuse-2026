import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { getFooterPages, getProjects, getSettings, paletteVars, projectPalette, sitePalette } from '@/lib/data'

export const metadata: Metadata = { title: 'העמוד לא נמצא', robots: { index: false } }

/** 404: site header and menu, a big "404", the ways back, and three projects as coloured shortcuts. */
export default async function NotFound() {
  const [projects, settings, pages] = await Promise.all([getProjects(), getSettings(), getFooterPages()])
  const picks = (projects.some((p) => p.featured) ? projects.filter((p) => p.featured) : projects).slice(0, 3)
  return (
    <div className="site" data-site style={paletteVars(sitePalette(settings))}>
      <Header projects={projects} />
      <main id="content" className="nf wrap">
        <p className="nf-code" aria-hidden="true">
          4<span>0</span>4
        </p>
        <h1>העמוד הזה הלך לאיבוד</h1>
        <p className="nf-text">אולי הכתובת השתנתה, או שהעמוד עבר למקום אחר. אפשר לחזור מכאן:</p>
        <ul className="nf-links">
          <li>
            <Link className="nf-btn" href="/">
              לעמוד הבית
            </Link>
          </li>
          <li>
            <Link href="/#work">לכל העבודות</Link>
          </li>
          <li>
            <Link href="/#contact">ליצירת קשר</Link>
          </li>
        </ul>
        {picks.length > 0 && (
          <section className="nf-picks" aria-labelledby="nfp">
            <h2 id="nfp">אולי תאהבו</h2>
            <ul>
              {picks.map((p) => {
                const c = projectPalette(p)
                return (
                  <li key={p.id}>
                    <Link href={`/portfolio/${p.slug}`} style={{ '--c-bg': c.bg, '--c-ink': c.ink } as React.CSSProperties}>
                      <span className="nf-name">{p.title}</span>
                      {p.field && <span className="nf-field">{p.field}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </main>
      <Footer settings={settings} pages={pages} />
    </div>
  )
}
