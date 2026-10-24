import type { MetadataRoute } from 'next'
import { indexable } from '@/lib/site'
import { SITE_URL } from '@/lib/seo'

/** Off mymuse.co.il (vercel.app, previews) everything is disallowed; on the live domain only admin/api are. */
export default async function robots(): Promise<MetadataRoute.Robots> {
  if (!(await indexable())) return { rules: [{ userAgent: '*', disallow: '/' }] }
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
