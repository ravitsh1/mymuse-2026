import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// The share image for WhatsApp / Facebook (Settings → shareImage): 1200×630 JPG of the home hero (brush words, logo,
// slogan), replacing the 512×512 transparent logo PNG, which those apps show on black and crop. Only while the
// setting is still that logo (or empty), so a later choice in the admin is never overwritten.
const FILE = path.resolve(process.cwd(), 'media-import/share/mymuse-share-2026.jpg')
const ALT = 'MyMuse: מה שדמיינתם, עם כל מה שעוד לא חשבתם עליו. סטודיו לעיצוב ופיתוח אתרים מאז 2010'
const OLD_LOGO = 'הלוגו של MyMuse'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const settings = await payload.findGlobal({ slug: 'settings', depth: 1, req })
  const current = settings.shareImage
  const isOldLogo = current && typeof current === 'object' && current.alt === OLD_LOGO && current.mimeType === 'image/png'
  if (current && !isOldLogo) return payload.logger.info('share image: set in the admin, left as is')

  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('share image: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  const media = await payload.create({ collection: 'media', data: { alt: ALT }, filePath: FILE, req })
  await payload.updateGlobal({ slug: 'settings', data: { shareImage: media.id }, req })
  payload.logger.info(`share image: set to media ${media.id}`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('share image: down is a no-op')
}
