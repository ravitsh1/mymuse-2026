import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Share image v3 (2026-11-18): the same 1200×630 hero, re-shot in the new palette (off-white, eggplant, pink,
// slate blue, lime). New file name, so WhatsApp / Facebook caches pick it up. Only while the setting is
// still v2 (mymuse-share-2026-v2.jpg); a choice made in the admin is never overwritten. The old media
// item stays in the library.
const FILE = path.resolve(process.cwd(), 'media-import/share/mymuse-share-2026-v3.jpg')
const ALT = 'MyMuse: מה שדמיינתם, עם כל מה שעוד לא חשבתם עליו. סטודיו לעיצוב ופיתוח אתרים מאז 2010'
const PREV = 'mymuse-share-2026-v2.jpg'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const settings = await payload.findGlobal({ slug: 'settings', depth: 1, req })
  const current = settings.shareImage
  if (!current || typeof current !== 'object' || current.filename !== PREV)
    return payload.logger.info('share image v3: not the previous version, left as is')

  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('share image v3: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  const media = await payload.create({ collection: 'media', data: { alt: ALT }, filePath: FILE, req })
  await payload.updateGlobal({ slug: 'settings', data: { shareImage: media.id }, req })
  payload.logger.info(`share image v3: set to media ${media.id}`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('share image v3: down is a no-op')
}
