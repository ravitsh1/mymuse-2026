import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Motion } from '@/components/Motion'
import { NextFrame } from '@/components/NextFrame'
import { LivePreviewRefresh } from '@/components/LivePreviewRefresh'
import { JsonLd } from '@/components/JsonLd'
import { MediaEl, Visual } from '@/components/Visual'
import { getFooterPages, getProjects, getSettings, nextProject, paletteVars, projectPalette } from '@/lib/data'
import { asMedia } from '@/lib/media'
import { abs, pageMetadata, shareImageOf } from '@/lib/seo'
import type { Media } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

// No generateStaticParams: the layout reads headers() (noindex check), so every page renders per request.
// With it, a build with no projects (a fresh database) marks the route static and every project page then
// fails at runtime with DYNAMIC_SERVER_USAGE (500) until the next deploy.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = (await getProjects()).find((x) => x.slug === slug)
  if (!p) return {}
  const settings = await getSettings()
  return pageMetadata({
    path: `/portfolio/${p.slug}`,
    title: p.metaTitle || p.title,
    description: p.metaDescription || p.lead,
    image: shareImageOf(p.hero) || shareImageOf(settings.shareImage),
    type: 'article',
  })
}

/** "עיצוב: סטודיו גור" → label "עיצוב", value "סטודיו גור"; without a colon the whole text is the value. */
function splitCredit(text: string | null | undefined) {
  const t = text?.trim()
  if (!t) return null
  const i = t.indexOf(':')
  return i > 0 ? { label: t.slice(0, i).trim(), value: t.slice(i + 1).trim() } : { label: 'קרדיט', value: t }
}

/** "*word*" in the CMS becomes the accent-coloured word. */
function Emph({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*[^*]+\*)/g).map((part, k) =>
        part.startsWith('*') && part.endsWith('*') ? <em key={k}>{part.slice(1, -1)}</em> : part,
      )}
    </>
  )
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const [projects, settings, pages] = await Promise.all([getProjects(), getSettings(), getFooterPages()])
  const index = projects.findIndex((p) => p.slug === slug)
  if (index < 0) notFound()
  const p = projects[index]
  const c = projectPalette(p)
  const nxt = nextProject(projects, p)!
  const gallery = (p.gallery ?? []).map(asMedia).filter((m): m is Media => !!m && !!m.url)
  const [g1, g2, ...rest] = gallery
  const credit = splitCredit(p.credit)

  return (
    <div className="site" data-site data-bg={c.bg} data-ink={c.ink} data-acc={c.acc} style={paletteVars(c)}>
      <Header projects={projects} current={index} />

      <main id="content">
        <section className="hero" aria-labelledby="pt">
          <Visual project={p} index={index} priority />
          <div className="hero-copy">
            {p.field && <p className="kicker">{p.field}</p>}
            <h1 id="pt" tabIndex={-1}>
              {p.title}
            </h1>
          </div>
          <div className="hint" aria-hidden="true">
            גללו
          </div>
        </section>

        <section className="intro wrap" aria-label="על הפרויקט">
          <div>
            {p.lead && <p className="lead">{p.lead}</p>}
            {p.siteUrl && (
              <a className="visit" href={p.siteUrl} target="_blank" rel="noopener noreferrer">
                לאתר של {p.title}
                <span className="sr-only"> (נפתח בחלון חדש)</span>
              </a>
            )}
          </div>
          <dl className="facts">
            {p.field && (
              <div>
                <dt>תחום</dt>
                <dd>{p.field}</dd>
              </div>
            )}
            {p.scope && (
              <div>
                <dt>היקף</dt>
                <dd>{p.scope}</dd>
              </div>
            )}
            {p.platform && (
              <div>
                <dt>פלטפורמה</dt>
                <dd>{p.platform}</dd>
              </div>
            )}
            {credit && (
              <div>
                <dt>{credit.label}</dt>
                <dd>{credit.value}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="band" aria-label={g1 ? 'מסכים מהאתר' : undefined} aria-hidden={g1 ? undefined : true}>
          <div className="par p1" data-speed="0.10">
            {g1 ? <MediaEl m={g1} sizes="(max-width: 720px) 84vw, 720px" /> : <MockWindow />}
          </div>
          <div className="par p2" data-speed="-0.14">
            {g2 ? <MediaEl m={g2} sizes="(max-width: 720px) 44vw, 360px" /> : <MockWindow />}
          </div>
        </section>

        {p.statement && (
          <section className="statement wrap">
            <p>
              <Emph text={p.statement} />
            </p>
          </section>
        )}

        {rest.length > 0 && (
          <section className="gallery wrap" aria-label="גלריה">
            {rest.map((m) => (
              <MediaEl key={m.id} m={m} sizes="(max-width: 720px) 100vw, 540px" />
            ))}
          </section>
        )}

        <section className="wrap" aria-label="פלטת הצבעים של הפרויקט">
          <ul className="swatches">
            {[c.bg, c.ink, c.acc].map((col) => (
              <li className="sw" key={col}>
                <span style={{ background: col }} />
                <small>{col.toUpperCase()}</small>
              </li>
            ))}
          </ul>
        </section>

        <Footer settings={settings} pages={pages} />

        <NextFrame project={nxt} index={projects.indexOf(nxt)} label="הפרויקט הבא" />
      </main>
      <Motion />
      <LivePreviewRefresh />
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: p.title,
            description: p.lead || undefined,
            url: abs(`/portfolio/${p.slug}`),
            creator: { '@type': 'Organization', name: 'MyMuse', url: abs('/') },
            ...(p.siteUrl ? { sameAs: p.siteUrl } : {}),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'MyMuse', item: abs('/') },
              { '@type': 'ListItem', position: 2, name: p.title, item: abs(`/portfolio/${p.slug}`) },
            ],
          },
        ]}
      />
    </div>
  )
}

function MockWindow() {
  return (
    <div className="win">
      <div className="chrome">
        <i />
        <i />
        <i />
      </div>
      <div className="screen">
        <b />
        <u />
      </div>
    </div>
  )
}
