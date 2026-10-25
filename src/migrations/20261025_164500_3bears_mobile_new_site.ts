import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// 3 Bears mobile hero from the new site (threebears-2026, not launched yet) instead of the live WordPress one, as Ravit
// asked. Only while the project still shows the generated v2 image; same Blob-token guard as the other imports.
const FILE = path.resolve(process.cwd(), 'media-import/remake/3-bears/3-bears-00-mobile-v3.jpg')

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const found = await payload.find({ collection: 'projects', where: { slug: { equals: '3-bears' } }, depth: 1, limit: 1, req })
  const p = found.docs[0]
  const m = p && typeof p.heroMobile === 'object' ? p.heroMobile : null
  if (!p || !/^3-bears-00-mobile-v2(-\d+)?\.jpg$/.test(m?.filename ?? '')) return payload.logger.info('3bears mobile: not the generated v2, left as is')
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('3bears mobile: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')
  const media = await payload.create({ collection: 'media', data: { alt: m?.alt || 'שלושת הדובים בתצוגת נייד' }, filePath: FILE, req })
  await payload.update({ collection: 'projects', id: p.id, data: { heroMobile: media.id }, req })
  payload.logger.info('3bears mobile: set from the new site')
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('3bears mobile: down is a no-op (v2 stays in the media library)')
}
