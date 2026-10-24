import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const payload = await getPayload({ config })
  const published = { _status: { equals: 'published' } } as const
  const [projects, pages] = await Promise.all([
    payload.find({ collection: 'projects', where: published, limit: 500, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'pages', where: published, limit: 100, depth: 0, select: { slug: true, updatedAt: true } }),
  ])
  return [
    { url: `${base}/`, priority: 1 },
    ...projects.docs.map((p) => ({ url: `${base}/portfolio/${p.slug}`, lastModified: p.updatedAt, priority: 0.8 })),
    ...pages.docs.map((p) => ({ url: `${base}/${p.slug}`, lastModified: p.updatedAt, priority: 0.3 })),
  ]
}
