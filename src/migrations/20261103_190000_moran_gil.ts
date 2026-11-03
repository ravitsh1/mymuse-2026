import path from 'path'
import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// Ravit (2026-11-03): add Moran Gil's cakery site (the new version on her check-it server, which is also the link
// until it moves to its own address). Same recipe as new_projects_2026: brand-book mockups from mockup26.js
// (media-import/new26), a photo mockup first in the gallery (media-import/photo), three screenshots, the food
// category, service tags, and a place in the order right after Udi Fish. Texts are drafts from the site's own words.
// Added only if the slug is not taken. Same Blob-token guard as the other media imports.
const NEW = path.resolve(process.cwd(), 'media-import/new26')
const PHOTO = path.resolve(process.cwd(), 'media-import/photo')
const SLUG = 'moran-gil'
const TITLE = 'מורן גיל'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('moran gil: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')
  const taken = await payload.find({ collection: 'projects', where: { slug: { equals: SLUG } }, limit: 1, req })
  if (taken.docs.length) return

  const cat = (await payload.find({ collection: 'categories', where: { title: { equals: 'יין ואוכל' } }, limit: 1, req })).docs[0]
  const media = async (dir: string, file: string, alt: string) =>
    (await payload.create({ collection: 'media', data: { alt }, filePath: path.join(dir, file), req })).id
  const hero = await media(NEW, `${SLUG}-2026.webp`, `האתר של ${TITLE} במחשב ובטלפון, על רקע משטחים צבועים`)
  const heroMobile = await media(NEW, `${SLUG}-2026-m.webp`, `האתר של ${TITLE} בטלפון, על רקע משטחים צבועים`)
  const gallery = [
    await media(PHOTO, `${SLUG}-photo.jpg`, `האתר של ${TITLE} על טאבלט בידיים, ליד שולחן קפה`),
    await media(NEW, `${SLUG}-01.webp`, `עמוד הבית של ${TITLE}`),
    await media(NEW, `${SLUG}-02.webp`, `מתוך האתר של ${TITLE}: מה בא לכם היום?`),
    await media(NEW, `${SLUG}-03.webp`, `מתוך האתר של ${TITLE}`),
  ]
  const p = await payload.create({
    collection: 'projects',
    data: {
      title: TITLE,
      slug: SLUG,
      nameEn: 'MORAN GIL',
      field: 'קייקרי וקונדיטוריה',
      scope: 'אתר וחנות מקוונת עם משלוחים',
      lead: 'אתר וחנות לקייקרי של מורן גיל, שף קונדיטור, ברחוב אלנבי 31 בתל אביב. עוגות מחולקות ושלמות, מאפים מתוקים ומלוחים, מארזים והרכבת עוגה אישית, עם משלוחים מגדרה ועד חדרה או איסוף עצמי, ומקום לאירועים בחלל של הקייקרי.',
      statement: 'עוגה אחת, *שישה טעמים*.',
      siteUrl: 'https://morangil.check-it.co.il/',
      services: ['ux', 'ui', 'delivery'],
      category: cat?.id,
      featured: true,
      hero,
      heroMobile,
      gallery,
      bg: '#f8f7f9',
      ink: '#1c0f30',
      accent: '#ff2d83',
    },
    req,
  })
  // between Udi Fish (aG) and Benny Goren (aH) in Ravit's order
  await db.execute(sql`UPDATE "projects" SET "_order" = 'aGV' WHERE "id" = ${p.id}`)
  payload.logger.info('moran gil: added')
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.delete({ collection: 'projects', where: { slug: { equals: SLUG } }, req })
}
