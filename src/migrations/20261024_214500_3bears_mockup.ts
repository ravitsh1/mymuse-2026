import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// The light, playful laptop + phone mockup of the 3 Bears site as the first gallery image (the large parallax
// screen). Ravit has already rearranged the other images in the admin, so this only adds it in front of whatever is
// there, once (skipped if the mockup is already in the gallery). Same Blob-token guard as the other media imports.
const FILE = path.resolve(process.cwd(), 'media-import/3bears/3bears-09-mockup-playful.jpg')
const ALT = 'האתר של שלושת הדובים על מסך לפטופ ועל טלפון'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const found = await payload.find({ collection: 'projects', where: { slug: { equals: '3-bears' } }, depth: 1, limit: 1, req })
  const project = found.docs[0]
  if (!project) return payload.logger.info('3bears mockup: no 3-bears project, nothing to do')

  const gallery = (project.gallery ?? []).filter((g) => typeof g === 'object')
  if (gallery.some((g) => /^3bears-09-mockup-playful/.test(g.filename ?? ''))) return payload.logger.info('3bears mockup: already there')

  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('3bears mockup: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  const mockup = await payload.create({ collection: 'media', data: { alt: ALT }, filePath: FILE, req })
  await payload.update({ collection: 'projects', id: project.id, data: { gallery: [mockup.id, ...gallery.map((g) => g.id)] }, req })
  payload.logger.info('3bears mockup: added as the first gallery image')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('3bears mockup: down is a no-op')
}
