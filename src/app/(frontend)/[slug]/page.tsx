import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewRefresh } from '@/components/LivePreviewRefresh'
import { getFooterPages, getPage, getProjects, getSettings, paletteVars, sitePalette } from '@/lib/data'
import { pageMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug)
  if (!page) return {}
  const s = await getSettings()
  return pageMetadata({ path: `/${page.slug}`, title: page.title, description: page.metaDescription || s.metaDescription })
}

export default async function TextPage({ params }: Props) {
  const { slug } = await params
  const [page, projects, settings, pages] = await Promise.all([getPage(slug), getProjects(), getSettings(), getFooterPages()])
  if (!page) notFound()
  const site = sitePalette(settings)
  return (
    <div className="site" data-site style={paletteVars(site)}>
      <Header projects={projects} />
      <main id="content" className="prose wrap">
        <h1>{page.title}</h1>
        {page.content && <RichText data={page.content} />}
      </main>
      <Footer settings={settings} pages={pages} />
      <LivePreviewRefresh />
    </div>
  )
}
