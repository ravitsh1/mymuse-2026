import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Laptop + phone mockup of gderotktanot.co.il (made with media-import/mockup) as the first gallery image of the
// Little Fences project, so it is the large parallax screen. Only while the gallery is still exactly what
// gderot_new_screens set; same Blob-token guard.
const FILE = path.resolve(process.cwd(), 'media-import/gderot/gderot-08-mockup.jpg')
const ALT = 'האתר "גדרות קטנות" על מסך לפטופ ועל טלפון'
const EXPECTED = ['02-book', '03-home-mobile', '04-spreads', '05-story', '06-story-dark', '07-story-mobile']

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const found = await payload.find({ collection: 'projects', where: { slug: { equals: 'little-fences' } }, depth: 1, limit: 1, req })
  const project = found.docs[0]
  if (!project) return payload.logger.info('gderot mockup: no little-fences project, nothing to do')

  const gallery = (project.gallery ?? []).filter((g) => typeof g === 'object')
  const untouched =
    gallery.length === EXPECTED.length && gallery.every((g, i) => new RegExp(`^gderot-${EXPECTED[i]}(-\\d+)?\\.jpg$`).test(g.filename ?? ''))
  if (!untouched) return payload.logger.info('gderot mockup: gallery was edited in the admin, left as is')

  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('gderot mockup: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  const mockup = await payload.create({ collection: 'media', data: { alt: ALT }, filePath: FILE, req })
  await payload.update({ collection: 'projects', id: project.id, data: { gallery: [mockup.id, ...gallery.map((g) => g.id)] }, req })
  payload.logger.info('gderot mockup: added as the first gallery image')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('gderot mockup: down is a no-op')
}
