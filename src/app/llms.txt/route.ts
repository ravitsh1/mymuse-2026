import { getFooterPages, getHome, getProjects, getSettings } from '@/lib/data'
import { abs, DEFAULT_DESCRIPTION, STUDIO_ADDRESS } from '@/lib/seo'

/**
 * /llms.txt (llmstxt.org): a short plain-text map of the site for AI assistants and answer engines (GEO).
 * Built from the same content as the pages, so it never goes stale. Lives at src/app root, like robots/sitemap
 * (inside the route group [slug] would shadow it).
 */
export const dynamic = 'force-dynamic'

const line = (s?: string | null) => (s || '').replace(/\s+/g, ' ').trim()

export async function GET() {
  const [settings, home, projects, pages] = await Promise.all([getSettings(), getHome(), getProjects(), getFooterPages()])
  const out: string[] = []
  out.push('# MyMuse', '')
  out.push(`> ${line(settings.metaDescription) || DEFAULT_DESCRIPTION}`, '')
  out.push(
    'MyMuse הוא סטודיו לתכנון, עיצוב ופיתוח אתרים, אפליקציות ומערכות בהתאמה אישית, שהוקם ב־2010 על ידי רוית שליוינסקי. ' +
      `הסטודיו נמצא ברחוב ${STUDIO_ADDRESS.streetAddress}, ${STUDIO_ADDRESS.addressLocality}, ועובד עם עסקים וארגונים בכל הארץ.`,
    '',
  )
  if (home.services?.length) {
    out.push('## שירותים', '')
    for (const s of home.services) out.push(`- ${line(s.title)}${s.text ? `: ${line(s.text)}` : ''}`)
    out.push('')
  }
  out.push('## פרויקטים', '', `- [כל הפרויקטים](${abs('/work')})`)
  for (const p of projects) {
    const about = [line(p.field), line(p.lead)].filter(Boolean).join('. ')
    out.push(`- [${line(p.title)}](${abs(`/portfolio/${p.slug}`)})${about ? `: ${about}` : ''}`)
  }
  out.push('', '## יצירת קשר', '')
  if (settings.email) out.push(`- דוא"ל: ${settings.email}`)
  if (settings.phone) out.push(`- טלפון: ${settings.phone}`)
  out.push(`- כתובת: ${STUDIO_ADDRESS.streetAddress}, ${STUDIO_ADDRESS.addressLocality}`)
  for (const s of settings.social ?? []) if (s.url) out.push(`- ${line(s.label) || s.url}: ${s.url}`)
  if (pages.length) {
    out.push('', '## עמודים נוספים', '')
    for (const p of pages) out.push(`- [${line(p.title)}](${abs(`/${p.slug}`)})`)
  }
  return new Response(out.join('\n') + '\n', { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=3600' } })
}
