import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// The playful 3 Bears mockup with the composition scaled to 72% and centred (media-import/mockup/mockup-3bears-playful.html):
// as the hero, a wide screen crops it top and bottom and the parallax moves it, so the edge-to-edge version lost its
// corners. Replaces the old file wherever the project still uses it (hero / gallery); the old media item stays in the library.
const FILE = path.resolve(process.cwd(), 'media-import/3bears/3bears-10-mockup-playful-inset.jpg')
const ALT = 'האתר של שלושת הדובים על מסך לפטופ ועל טלפון'
const OLD = /^3bears-09-mockup-playful(-\d+)?\.jpg$/

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const found = await payload.find({ collection: 'projects', where: { slug: { equals: '3-bears' } }, depth: 1, limit: 1, req })
  const project = found.docs[0]
  if (!project) return payload.logger.info('3bears inset mockup: no 3-bears project')

  const hero = typeof project.hero === 'object' ? project.hero : null
  const gallery = (project.gallery ?? []).filter((g) => typeof g === 'object')
  const heroIsOld = !!hero && OLD.test(hero.filename ?? '')
  const galleryHasOld = gallery.some((g) => OLD.test(g.filename ?? ''))
  if (!heroIsOld && !galleryHasOld) return payload.logger.info('3bears inset mockup: old mockup not in use, nothing to replace')

  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('3bears inset mockup: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  const media = await payload.create({ collection: 'media', data: { alt: ALT }, filePath: FILE, req })
  await payload.update({
    collection: 'projects',
    id: project.id,
    data: {
      ...(heroIsOld ? { hero: media.id } : {}),
      ...(galleryHasOld ? { gallery: gallery.map((g) => (OLD.test(g.filename ?? '') ? media.id : g.id)) } : {}),
    },
    req,
  })
  payload.logger.info(`3bears inset mockup: replaced in ${[heroIsOld && 'hero', galleryHasOld && 'gallery'].filter(Boolean).join(' + ')}`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('3bears inset mockup: down is a no-op (the old file is still in the media library)')
}
