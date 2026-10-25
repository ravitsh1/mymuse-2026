import type { Metadata } from 'next'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { LivePreviewRefresh } from '@/components/LivePreviewRefresh'
import { Header } from '@/components/Header'
import { CopyValue, Marquee } from '@/components/Interactive'
import { Motion } from '@/components/Motion'
import { NextFrame } from '@/components/NextFrame'
import { MediaEl, Visual } from '@/components/Visual'
import { accentTones, getFooterPages, getHome, getProjects, getSettings, paletteVars, projectPalette, sitePalette } from '@/lib/data'
import { abs, pageMetadata, shareImageOf } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return pageMetadata({ path: '/', description: s.metaDescription, image: shareImageOf(s.shareImage) })
}

export default async function HomePage() {
  const [projects, home, settings, pages] = await Promise.all([getProjects(), getHome(), getSettings(), getFooterPages()])
  const site = sitePalette(settings)
  const words = home.words?.length ? home.words : [{ word: 'Expertise', bg: site.bg, accent: site.acc }]
  const featured = projects.map((p, i) => ({ p, i })).filter(({ p }) => p.featured)
  const shown = featured.length ? featured : projects.map((p, i) => ({ p, i }))

  return (
    <div className="site" data-site data-bg={site.bg} data-ink={site.ink} data-acc={site.acc} data-acc-sm={accentTones(site).sm} data-acc-lg={accentTones(site).lg} style={paletteVars(site)}>
      <Header projects={projects} />

      <main id="content">
        <section
          className="ph"
          data-ph
          data-words={JSON.stringify(words.map((w) => ({ bg: w.bg || site.bg, accent: w.accent || site.acc })))}
          aria-labelledby="pt"
        >
          <div className="ph-sticky" data-phs>
            {/* One layer per word (empty when it has no image) so layer n always belongs to word n. */}
            {words.some((w) => 'image' in w && w.image) ? (
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
            <h1 className="sr-only" id="pt" tabIndex={-1}>
              MyMuse · בניית אתרים בהתאמה אישית
            </h1>
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
          </div>
        </section>

        {/* Slides over the pinned Passion section on desktop (see .after-ph): needs a full-width background. */}
        <div className="after-ph">
          {home.subtitle && <p className="lede wrap">{home.subtitle}</p>}
          {shown.length > 0 && (
            <section className="ix wrap" id="work" data-ix aria-labelledby="ixh">
              <div className="ix-head">
                <h2 id="ixh">{home.workTitle || 'עבודות נבחרות'}</h2>
              </div>
              <ul className="rows" data-rows>
                {shown.map(({ p, i }) => {
                  const c = projectPalette(p)
                  return (
                    <li key={p.id}>
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
            </section>
          )}
        </div>

        {!!home.services?.length && (
          <section className="svc wrap" aria-labelledby="svch">
            <h2 id="svch">{home.servicesTitle}</h2>
            <ol className="cards">
              {home.services.map((s, k) => (
                <li
                  key={s.id ?? k}
                  className="card"
                  style={{ top: `calc(84px + ${k * 22}px)`, '--c-bg': s.bg || site.ink, '--c-ink': s.ink || site.bg } as React.CSSProperties}
                >
                  <span className="n" aria-hidden="true">
                    {k + 1}
                  </span>
                  <div>
                    <h3>{s.title}</h3>
                    {s.text && <p>{s.text}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {home.aboutHeadline && (
          <section className="about wrap" aria-labelledby="abh">
            <h2 className="kicker" id="abh">
              MyMuse
            </h2>
            <p className="reveal" data-reveal>
              {home.aboutHeadline.split(' ').map((w, k) => (
                <span key={k}>{w} </span>
              ))}
            </p>
            {home.aboutBody && (
              <div className="about-body">
                {home.aboutBody
                  .split(/\n\s*\n/)
                  .filter((t) => t.trim())
                  .map((t, k) => (
                    <p key={k}>{t.trim()}</p>
                  ))}
              </div>
            )}
          </section>
        )}

        {!!home.clients?.length && <Marquee names={home.clients.map((c) => c.name)} />}

        <section className="contact wrap" aria-labelledby="cth">
          <h2 id="cth">{home.contactTitle || 'נדבר?'}</h2>
          {home.contactBody && <p className="ct-body">{home.contactBody}</p>}
          <div className="ct">
            {settings.email && <CopyValue value={settings.email} />}
            {settings.phone && <CopyValue value={settings.phone} />}
          </div>
        </section>

        <Footer settings={settings} pages={pages} />

        {projects[0] && <NextFrame project={projects[0]} index={0} label="הפרויקט הראשון" />}
      </main>

      <div className="peek" data-peek aria-hidden="true" />
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
