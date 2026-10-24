import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// New screens of the 3 Bears site (threebears-2026), shot for Ravit: they replace the old WordPress screenshots on
// the 3 Bears project. Runs once, in the build that holds the Blob token, and only while the project still shows
// exactly what the WordPress import gave it (lead.jpg + the three "מסך N" screens): anything changed in the admin
// stays. The old media items are left in the library.
const DIR = path.resolve(process.cwd(), 'media-import/3bears')
const HERO = { file: '3bears-01-hero.jpg', alt: 'עמוד הבית של אתר שלושת הדובים: Everything’s Playable' }
const GALLERY = [
  { file: '3bears-02-about.jpg', alt: 'עמוד "החוויה" באתר שלושת הדובים' },
  { file: '3bears-03-work-mobile.jpg', alt: 'עמוד העבודות של שלושת הדובים בתצוגת נייד' },
  { file: '3bears-04-services.jpg', alt: 'כרטיסי השירותים באתר שלושת הדובים' },
  { file: '3bears-05-project.jpg', alt: 'עמוד הפרויקט של כרמלה באתר שלושת הדובים' },
  { file: '3bears-06-work.jpg', alt: 'רשת העבודות באתר שלושת הדובים' },
  { file: '3bears-07-home-mobile.jpg', alt: 'עמוד הבית של שלושת הדובים בתצוגת נייד' },
]
const IMPORTED_ALTS = [1, 2, 3].map((n) => `מסך ${n} מתוך האתר של שלושת הדובים`)

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const found = await payload.find({ collection: 'projects', where: { slug: { equals: '3-bears' } }, depth: 1, limit: 1, req })
  const project = found.docs[0]
  if (!project) return payload.logger.info('3bears screens: no 3-bears project, nothing to do')

  const hero = typeof project.hero === 'object' ? project.hero : null
  const alts = (project.gallery ?? []).map((g) => (typeof g === 'object' ? g.alt : null))
  const untouched =
    !!hero && /^lead(-\d+)?\.jpg$/.test(hero.filename ?? '') && alts.length === 3 && alts.every((a, i) => a === IMPORTED_ALTS[i])
  if (!untouched) return payload.logger.info('3bears screens: project media was edited in the admin, left as is')

  // Without the token the files would land on the build machine's disk and vanish with it.
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('3bears screens: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  const add = async ({ file, alt }: { file: string; alt: string }) =>
    (await payload.create({ collection: 'media', data: { alt }, filePath: path.join(DIR, file), req })).id

  const heroId = await add(HERO)
  const galleryIds: number[] = []
  for (const g of GALLERY) galleryIds.push(await add(g))

  await payload.update({ collection: 'projects', id: project.id, data: { hero: heroId, gallery: galleryIds }, req })
  payload.logger.info(`3bears screens: hero + ${galleryIds.length} gallery images set`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Nothing to undo automatically: the previous images are still in the media library and can be picked again.
  payload.logger.info('3bears screens: down is a no-op')
}
