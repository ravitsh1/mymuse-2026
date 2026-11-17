import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Share image v2 (2026-11-17): the same 1200×630 hero, re-shot after the accent colour moved to #9e3a64 (the DESIGN
// stroke and the accent line). New file name, so WhatsApp / Facebook caches pick it up. Only while the setting is
// still the first version (mymuse-share-2026.jpg); a choice made in the admin is never overwritten. The old media
// item stays in the library.
const FILE = path.resolve(process.cwd(), 'media-import/share/mymuse-share-2026-v2.jpg')
const ALT = 'MyMuse: מה שדמיינתם, עם כל מה שעוד לא חשבתם עליו. סטודיו לעיצוב ופיתוח אתרים מאז 2010'
const V1 = 'mymuse-share-2026.jpg'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const settings = await payload.findGlobal({ slug: 'settings', depth: 1, req })
  const current = settings.shareImage
  if (!current || typeof current !== 'object' || current.filename !== V1)
    return payload.logger.info('share image v2: not the first version, left as is')

  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('share image v2: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  const media = await payload.create({ collection: 'media', data: { alt: ALT }, filePath: FILE, req })
  await payload.updateGlobal({ slug: 'settings', data: { shareImage: media.id }, req })
  payload.logger.info(`share image v2: set to media ${media.id}`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('share image v2: down is a no-op')
}
