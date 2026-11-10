import type { Metadata } from 'next'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewRefresh } from '@/components/LivePreviewRefresh'
import { BriefAssistant } from '@/components/BriefAssistant'
import { BrandHero, BrandLabel, LastWordPink } from '@/components/BrandHero'
import { Header } from '@/components/Header'
import { HeroCycle } from '@/components/HeroCycle'
import { CategoryFilter } from '@/components/CategoryFilter'
import { Marquee } from '@/components/Interactive'
import { Motion } from '@/components/Motion'
import { LogoStacked } from '@/components/Logo'
import { MediaEl, Visual } from '@/components/Visual'
import { accentTones, getCategories, getFooterPages, getHome, getProjects, getSettings, paletteVars, projectPalette, sitePalette } from '@/lib/data'
import { abs, pageMetadata, shareImageOf } from '@/lib/seo'
import { HERO_WORK, trialHero, trialPalette } from '@/lib/trial'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return pageMetadata({ path: '/', description: s.metaDescription, image: shareImageOf(s.shareImage) })
}

export default async function HomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [projects, home, settings, pages, allCategories, hero, palette, sp] = await Promise.all([
    getProjects(),
    getHome(),
    getSettings(),
    getFooterPages(),
    getCategories(),
    trialHero(),
    trialPalette(),
    searchParams,
  ])
  // a service tag on a card links to ?service=<tag>#work: the index then lists only the projects marked with it
  // the tags themselves are edited in Settings → שירותים; projects and cards store each tag's row id
  const tags = (settings.serviceTags ?? []).filter((t) => t.id && t.label).map((t) => ({ value: t.id!, label: t.label }))
  const service = tags.find((t) => t.value === sp.service)
  const tagLabel = (v: string) => tags.find((t) => t.value === v)?.label ?? v
  // the 2026 brand book brings its own hero (BrandHero) in place of the Passion section and its trials
  const brand = palette === 'b26'
  const showWork = hero === 'work' || hero === 'both'
  const showStatement = hero === 'statement' || hero === 'both'
  // "work" hero: the project shown with each word (falls back to the projects in order)
  const workOf = (w: { word: string }, k: number) => projects.find((p) => p.slug === HERO_WORK[w.word]) ?? projects[k % projects.length]
  const site = sitePalette(settings)
  const words = home.words?.length ? home.words : [{ word: 'Expertise', bg: site.bg, accent: site.acc }]
  const featured = projects.map((p, i) => ({ p, i })).filter(({ p }) => p.featured)
  const listed = featured.length ? featured : projects.map((p, i) => ({ p, i }))
  const shown = service ? listed.filter(({ p }) => p.services?.includes(service.value)) : listed
  // a card shows only the tags some listed project carries, so no tag leads to an empty list
  const usedTags = new Set(listed.flatMap(({ p }) => (p.services ?? []).filter((t) => tags.some((x) => x.value === t))))
  const catOf = (p: (typeof projects)[number]) => (p.category && typeof p.category === 'object' ? String(p.category.id) : p.category ? String(p.category) : '')
  // only categories that have a project in the list
  const categories = allCategories.filter((c) => shown.some(({ p }) => catOf(p) === String(c.id)))

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
    <div className={!brand && hero === 'single' ? 'site top-light' : 'site'} data-site data-bg={site.bg} data-ink={site.ink} data-acc={site.acc} data-acc-sm={accentTones(site).sm} data-acc-lg={accentTones(site).lg} style={paletteVars(site)}>
      <Header projects={projects} home />

      <main id="content">
        {brand ? (
          <BrandHero tag={settings.heroTag} title={settings.heroTitle} text={settings.heroText} />
        ) : (
          <section
            className="ph"
            data-hero={hero}
            data-ph
            data-words={JSON.stringify(words.map((w) => ({ bg: w.bg || site.bg, accent: w.accent || site.acc })))}
            aria-labelledby="pt"
          >
            <div className="ph-sticky" data-phs>
              {showWork ? (
                /* One project per word, in the same layers Motion cross-fades (data-phbg); the index below lists them all. */
                <div className="ph-work" aria-hidden="true">
                  {words.map((w, k) => {
                    const p = workOf(w, k)
                    return (
                      <figure key={w.id ?? k} className={k ? 'ph-bg ph-card' : 'ph-bg ph-card on'} data-phbg>
                        <div className="ph-shot">{p?.hero && <MediaEl m={p.hero} fill decorative sizes="(max-width: 720px) 92vw, 46vw" eager={k === 0} />}</div>
                        {p && (
                          <figcaption>
                            {p.title}
                            {p.field && <span> · {p.field}</span>}
                          </figcaption>
                        )}
                      </figure>
                    )
                  })}
                </div>
              ) : words.some((w) => 'image' in w && w.image) ? (
                /* One layer per word (empty when it has no image) so layer n always belongs to word n. */
                <div className="ph-bgs" aria-hidden="true">
                  {words.map((w, k) => (
                    <div key={w.id ?? k} className={k ? 'ph-bg' : 'ph-bg on'} data-phbg>
                      {'image' in w && w.image && <MediaEl m={w.image} className="ph-media" fill decorative eager={k === 0} />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ph-orb" aria-hidden="true" />
              )}
              {hero === 'single' ? (
                <h1 className="ph-title ph-one" id="pt" tabIndex={-1}>
                  <span lang="en">
                    <LogoStacked className="ph-logo" tight />
                    <span className="sr-only">MyMuse </span>
                    <span>inspired by</span>{' '}
                    <span>
                      your <em>passion</em>
                    </span>
                  </span>
                  <span className="sr-only"> · בניית אתרים בהתאמה אישית</span>
                </h1>
              ) : showStatement ? (
                <h1 className="ph-title" id="pt" tabIndex={-1}>
                  <span lang="en">
                    Inspired by <em>success</em>
                  </span>
                  <span className="sr-only"> · MyMuse, בניית אתרים בהתאמה אישית</span>
                </h1>
              ) : (
                <h1 className="sr-only" id="pt" tabIndex={-1}>
                  MyMuse · בניית אתרים בהתאמה אישית
                </h1>
              )}
              {hero === 'single' ? (
                <HeroCycle />
              ) : (
                <>
                  <p className="passion" aria-label={`Passion & ${words.map((w) => w.word).join(', ')}`}>
                    <span aria-hidden="true">
                      Passion
                      <br />
                      <span className="amp">&amp;</span>{' '}
                      <span className="words">
                        <span data-wcol>
                          {words.map((w) => (
                            <span key={w.id ?? w.word}>{w.word}</span>
                          ))}
                        </span>
                      </span>
                    </span>
                  </p>
                  <div className="ticks" aria-hidden="true">
                    {words.map((w, k) => (
                      <i key={w.id ?? k} data-tick className={k ? '' : 'on'} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* Slides over the pinned Passion section on desktop (see .after-ph): needs a full-width background. */}
        <div className="after-ph">
          {brand ? brandAbout : null}
          {!brand && home.subtitle && <p className="lede wrap">{home.subtitle}</p>}
          {(shown.length > 0 || service) && (
            <section className="ix wrap" id="work" data-ix aria-labelledby="ixh">
              {brand && <BrandLabel n={2}>Selected work</BrandLabel>}
              <div className="ix-head">
                <h2 id="ixh">{home.workTitle || 'עבודות נבחרות'}</h2>
                {brand && home.subtitle && <p className="b-text">{home.subtitle}</p>}
                {categories.length > 1 && <CategoryFilter categories={categories.map((c) => ({ id: c.id, title: c.title }))} all={brand} shuffle={settings.projectOrder !== 'admin'} />}
              </div>
              {service && (
                <p className="ix-service">
                  {shown.length ? 'פרויקטים עם השירות' : 'עדיין אין פרויקטים עם השירות'} <strong>{service.label}</strong>
                  <a href="/#work">לכל הפרויקטים</a>
                </p>
              )}
              <ul className="rows" data-rows>
                {shown.map(({ p, i }) => {
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
              <div className="ix-more" data-more />
            </section>
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
                            <a href={`/?service=${t}#work`}>{tagLabel(t)}</a>
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

        {!brand && home.aboutHeadline && (
          <section className="about wrap" id="about" aria-labelledby="abh">
            <h2 className="kicker" id="abh">
              MyMuse
            </h2>
            <p className="reveal" data-reveal>
              {home.aboutHeadline.split(' ').map((w, k) => (
                <span key={k}>{w} </span>
              ))}
            </p>
            {aboutParas.length > 0 && (
              <div className="about-body">
                {aboutParas.map((t, k) => (
                  <p key={k}>{t}</p>
                ))}
              </div>
            )}
          </section>
        )}

        {!!home.clients?.length && <Marquee names={home.clients.map((c) => c.name)} />}

        <section className="contact wrap" id="contact" aria-labelledby="cth">
          {brand && <BrandLabel n={quotes.length ? 5 : 4}>Contact</BrandLabel>}
          <h2 id="cth">{brand ? <LastWordPink text={home.contactTitle || 'נדבר?'} /> : home.contactTitle || 'נדבר?'}</h2>
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
