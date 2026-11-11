import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewRefresh } from '@/components/LivePreviewRefresh'
import { BriefAssistant } from '@/components/BriefAssistant'
import { BrandHero, BrandLabel, LastWordPink } from '@/components/BrandHero'
import { Header } from '@/components/Header'
import { WorkIndex } from '@/components/WorkIndex'
import { Marquee } from '@/components/Interactive'
import { Motion } from '@/components/Motion'
import { accentTones, getFooterPages, getHome, getProjects, getSettings, paletteVars, sitePalette } from '@/lib/data'
import { abs, pageMetadata, shareImageOf } from '@/lib/seo'

/** how many selected projects the home page lists before the link to /work */
const HOME_WORK = 8

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return pageMetadata({ path: '/', description: s.metaDescription, image: shareImageOf(s.shareImage) })
}

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [projects, home, settings, pages, sp] = await Promise.all([
    getProjects(),
    getHome(),
    getSettings(),
    getFooterPages(),
    searchParams,
  ])
  // the service filter lives on /work now; old links (/?service=ux#work) go there
  if (typeof sp.service === 'string') redirect(`/work?service=${encodeURIComponent(sp.service)}`)
  // the tags themselves are edited in Settings → שירותים; projects and cards store each tag's row id
  const tags = (settings.serviceTags ?? []).filter((t) => t.id && t.label).map((t) => ({ value: t.id!, label: t.label }))
  const tagLabel = (v: string) => tags.find((t) => t.value === v)?.label ?? v
  const brand = true // the 2026 look (lib/brand.ts); the design trials are gone
  const site = sitePalette(settings)
  // the home page shows a few selected projects (marked "featured", in the admin order); /work has them all
  const featured = projects.map((p, i) => ({ p, i })).filter(({ p }) => p.featured)
  const selected = (featured.length ? featured : projects.map((p, i) => ({ p, i }))).slice(0, HOME_WORK)
  // a card shows only the tags some project carries, so no tag leads to an empty list
  const usedTags = new Set(projects.flatMap((p) => (p.services ?? []).filter((t) => tags.some((x) => x.value === t))))

  // the brief assistant (contact section): only with the 2026 look, the setting on and a Claude key on the server
  const showBrief = brand && !!settings.briefAssistant && !!process.env.ANTHROPIC_API_KEY

  // testimonials: a quote may point at a project; it links only while that project is visible
  const quotes = (home.testimonials ?? []).map((q) => {
    const id = q.project && typeof q.project === 'object' ? q.project.id : q.project
    return { ...q, href: projects.find((p) => p.id === id)?.slug }
  })

  const aboutParas = (home.aboutBody ?? '')
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean)
  // brand book 2026: the about text opens the page, right after the hero, with the four words beside it
  const brandAbout = home.aboutHeadline ? (
    <section className="b-about wrap" id="about" aria-labelledby="abh">
      <div>
        <BrandLabel n={1}>Who we are</BrandLabel>
        <h2 id="abh">
          <LastWordPink text={home.aboutHeadline} words={2} />
        </h2>
        {aboutParas.map((t, k) => (
          <p key={k} className="b-text">
            {t}
          </p>
        ))}
      </div>
      {!!home.aboutWords?.length && (
        <p className="b-words" aria-hidden="true">
          {/* words and colours from Home → עלינו; --w staggers the write-on, one word after another */}
          {home.aboutWords.map((w, k) => (
            <span key={w.id ?? k} style={{ color: w.color || undefined, '--w': k } as React.CSSProperties}>
              {w.word}
            </span>
          ))}
        </p>
      )}
    </section>
  ) : null

  return (
    <div className="site" data-site data-bg={site.bg} data-ink={site.ink} data-acc={site.acc} data-acc-sm={accentTones(site).sm} data-acc-lg={accentTones(site).lg} style={paletteVars(site)}>
      <Header projects={projects} home />

      <main id="content">
        <BrandHero tag={settings.heroTag} title={settings.heroTitle} text={settings.heroText} />

        <div className="after-ph">
          {brandAbout}
          {selected.length > 0 && (
            <WorkIndex
              items={selected}
              brand={brand}
              label={{ n: 2, text: 'Selected work' }}
              title={home.workTitle || 'עבודות נבחרות'}
              subtitle={brand ? home.subtitle : null}
              allHref="/work"
            />
          )}
        </div>

        {!!home.services?.length && (
          <section className="svc wrap" id="services" aria-labelledby="svch">
            {brand && <BrandLabel n={3}>Services</BrandLabel>}
            <h2 id="svch">{home.servicesTitle}</h2>
            <ol className="cards">
              {home.services.map((s, k) => (
                <li
                  key={s.id ?? k}
                  className="card"
                  style={{ top: `calc(84px + ${k * 22}px)`, '--c-bg': s.bg || site.ink, '--c-ink': s.ink || site.bg } as React.CSSProperties}
                >
                  {k < 5 && <img className="card-mark" src={`/brush/mark-${k + 1}.svg`} alt="" />}
                  <div>
                    {/* the number sits with the title ("01 איפיון", Figma); the list already numbers the cards for screen readers */}
                    <h3>
                      <span className="card-n" aria-hidden="true">
                        {String(k + 1).padStart(2, '0')}
                      </span>{' '}
                      {s.title}
                    </h3>
                    {s.text && <p>{s.text}</p>}
                    {!!s.tags?.some((t) => usedTags.has(t)) && (
                      <ul className="card-tags" aria-label={`פרויקטים לפי ${s.title}`}>
                        {s.tags.filter((t) => usedTags.has(t)).map((t) => (
                          <li key={t}>
                            <a href={`/work?service=${t}`}>{tagLabel(t)}</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {quotes.length > 0 && (
          <section className="quotes wrap" id="testimonials" aria-labelledby="qth">
            {brand && <BrandLabel n={4}>Testimonials</BrandLabel>}
            <h2 id="qth">{home.testimonialsTitle || 'מה אומרים עלינו'}</h2>
            <ul className="quote-list">
              {quotes.map((q, k) => (
                <li key={q.id ?? k}>
                  <figure className="quote">
                    <blockquote>
                      {q.quote
                        .split(/\n\s*\n/)
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((t, j) => (
                          <p key={j}>{t}</p>
                        ))}
                    </blockquote>
                    <figcaption>
                      <strong>{q.name}</strong>
                      {(q.role || q.company) && <span>{[q.role, q.company].filter(Boolean).join(', ')}</span>}
                      {q.href && <a href={`/portfolio/${q.href}`}>לפרויקט</a>}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!!home.clients?.length && <Marquee names={home.clients.map((c) => c.name)} />}

        <section className="contact wrap" id="contact" aria-labelledby="cth">
          {brand && <BrandLabel n={quotes.length ? 5 : 4}>Contact</BrandLabel>}
          <h2 id="cth">
            <LastWordPink text={home.contactTitle || 'נדבר?'} />
          </h2>
          <div className={showBrief ? 'ct-grid' : 'ct-plain'}>
            <div className="ct-side">
              {home.contactBody && <p className="ct-body">{home.contactBody}</p>}
              {brand && settings.email && (
                <a className="pill" href={`mailto:${settings.email}`}>
                  צרו קשר <span aria-hidden="true">←</span>
                </a>
              )}
              <div className="ct">
                {settings.email && (
                  <a className="ci" href={`mailto:${settings.email}`}>
                    {settings.email}
                  </a>
                )}
                {settings.phone && (
                  <a className="ci" href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`}>
                    {settings.phone}
                  </a>
                )}
              </div>
            </div>
            {showBrief && <BriefAssistant privacyHref={pages.some((x) => x.slug === 'privacy-policy') ? '/privacy-policy' : undefined} />}
          </div>
        </section>

        <Footer settings={settings} pages={pages} />

      </main>

      {brand && <div className="peek" data-peek aria-hidden="true" />}
      <Motion />
      <LivePreviewRefresh />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'MyMuse',
          url: abs('/'),
          email: settings.email || undefined,
          telephone: settings.phone || undefined,
          founder: { '@type': 'Person', name: 'רוית שליוינסקי' },
          foundingDate: '2010',
          sameAs: (settings.social ?? []).map((x) => x.url),
        }}
      />
    </div>
  )
}
