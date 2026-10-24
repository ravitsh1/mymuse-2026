import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { getFooterPages, getPage, getProjects, getSettings, paletteVars, sitePalette } from '@/lib/data'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getPage((await params).slug)
  return page ? { title: page.title, description: page.metaDescription ?? undefined } : {}
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
    </div>
  )
}
