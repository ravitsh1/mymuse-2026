import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// New screens of gderotktanot.co.il, shot for Ravit, replacing the WordPress-import images on the Little Fences
// project. Same rules as 3bears_new_screens: runs only while the project still holds exactly the import's media
// (bearAndGirl.jpg + the three "מסך N" screens), refuses to store files without the Blob token, and leaves the old
// media items in the library.
const DIR = path.resolve(process.cwd(), 'media-import/gderot')
const HERO = { file: 'gderot-01-hero.jpg', alt: 'עמוד הבית של האתר "גדרות קטנות": ילדה ודוב בערפל' }
const GALLERY = [
  { file: 'gderot-02-book.jpg', alt: '"לדלג מעל גדר": תיאור הספר לצד דפים מאוירים מתוכו' },
  { file: 'gderot-03-home-mobile.jpg', alt: 'עמוד הבית של "גדרות קטנות" בתצוגת נייד' },
  { file: 'gderot-04-spreads.jpg', alt: 'שלוש כפולות מתוך הספר "גדרות קטנות"' },
  { file: 'gderot-05-story.jpg', alt: 'עמוד הסיפור "פטמות" באתר' },
  { file: 'gderot-06-story-dark.jpg', alt: 'עמוד הסיפור "גדרות קטנות" באתר' },
  { file: 'gderot-07-story-mobile.jpg', alt: 'עמוד הסיפור "פטמות" בתצוגת נייד' },
]
const IMPORTED_ALTS = [1, 2, 3].map((n) => `מסך ${n} מתוך האתר של גדרות קטנות`)

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const found = await payload.find({ collection: 'projects', where: { slug: { equals: 'little-fences' } }, depth: 1, limit: 1, req })
  const project = found.docs[0]
  if (!project) return payload.logger.info('gderot screens: no little-fences project, nothing to do')

  const hero = typeof project.hero === 'object' ? project.hero : null
  const alts = (project.gallery ?? []).map((g) => (typeof g === 'object' ? g.alt : null))
  const untouched =
    !!hero && /^bearAndGirl(-\d+)?\.jpg$/.test(hero.filename ?? '') && alts.length === 3 && alts.every((a, i) => a === IMPORTED_ALTS[i])
  if (!untouched) return payload.logger.info('gderot screens: project media was edited in the admin, left as is')

  // Without the token the files would land on the build machine's disk and vanish with it.
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('gderot screens: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  const add = async ({ file, alt }: { file: string; alt: string }) =>
    (await payload.create({ collection: 'media', data: { alt }, filePath: path.join(DIR, file), req })).id

  const heroId = await add(HERO)
  const galleryIds: number[] = []
  for (const g of GALLERY) galleryIds.push(await add(g))

  await payload.update({ collection: 'projects', id: project.id, data: { hero: heroId, gallery: galleryIds }, req })
  payload.logger.info(`gderot screens: hero + ${galleryIds.length} gallery images set`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Nothing to undo automatically: the previous images are still in the media library and can be picked again.
  payload.logger.info('gderot screens: down is a no-op')
}
