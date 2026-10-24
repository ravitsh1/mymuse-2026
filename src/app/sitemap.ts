import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { abs } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const [projects, pages] = await Promise.all([
    payload.find({ collection: 'projects', where: { hidden: { not_equals: true } }, limit: 500, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'pages', limit: 100, depth: 0, select: { slug: true, updatedAt: true } }),
  ])
  return [
    { url: abs('/'), priority: 1 },
    ...projects.docs.map((p) => ({ url: abs(`/portfolio/${p.slug}`), lastModified: p.updatedAt, priority: 0.8 })),
    ...pages.docs.map((p) => ({ url: abs(`/${p.slug}`), lastModified: p.updatedAt, priority: 0.3 })),
  ]
}
