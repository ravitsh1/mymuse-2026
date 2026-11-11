import type { Metadata } from 'next'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewRefresh } from '@/components/LivePreviewRefresh'
import { Motion } from '@/components/Motion'
import { WorkIndex } from '@/components/WorkIndex'
import { accentTones, getCategories, getFooterPages, getHome, getProjects, getSettings, paletteVars, sitePalette } from '@/lib/data'
import { pageMetadata, shareImageOf } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  return pageMetadata({
    path: '/work',
    title: 'כל הפרויקטים',
    description: 'אתרים, חנויות, מערכות ואפליקציות ש־MyMuse תכננה, עיצבה ופיתחה מאז 2010.',
    image: shareImageOf(s.shareImage),
  })
}

/**
 * Every visible project, with the category filters and the service filter (?service=<tag>, from the service cards).
 * The home page shows only a few selected projects and links here.
 */
export default async function WorkPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [projects, home, settings, pages, categories, sp] = await Promise.all([
    getProjects(),
    getHome(),
    getSettings(),
    getFooterPages(),
    getCategories(),
    searchParams,
  ])
  const brand = true
  const site = sitePalette(settings)
  const tags = (settings.serviceTags ?? []).filter((t) => t.id && t.label).map((t) => ({ value: t.id!, label: t.label }))
  const service = tags.find((t) => t.value === sp.service)
  const all = projects.map((p, i) => ({ p, i }))
  const items = service ? all.filter(({ p }) => p.services?.includes(service.value)) : all

  return (
    <div className="site work-page" data-site data-bg={site.bg} data-ink={site.ink} data-acc={site.acc} data-acc-sm={accentTones(site).sm} data-acc-lg={accentTones(site).lg} style={paletteVars(site)}>
      <Header projects={projects} />
      <main id="content">
        <WorkIndex
          items={items}
          categories={service ? [] : categories}
          brand={brand}
          label={{ n: 1, text: 'All work' }}
          title="כל הפרויקטים"
          titleId="pt"
          as="h1"
          subtitle={home.subtitle}
          service={service ? { label: service.label, count: items.length } : null}
          shuffle={settings.projectOrder !== 'admin'}
          showAll
        />
        <Footer settings={settings} pages={pages} />
      </main>
      {brand && <div className="peek" data-peek aria-hidden="true" />}
      <Motion />
      <LivePreviewRefresh />
    </div>
  )
}
