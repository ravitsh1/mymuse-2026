import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// Ravit asked for a smaller phone in the portrait mobile heroes (more room above the title). Swaps in the v2 images,
// only where the project still shows the first version (`<slug>-00-mobile.jpg`); a mobile hero picked in the admin
// stays. The first versions remain in the media library.
const DIR = path.resolve(process.cwd(), 'media-import/remake')

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('mobile heroes v2: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')
  const { docs } = await payload.find({ collection: 'projects', depth: 1, limit: 200, pagination: false, req })
  for (const p of docs) {
    const m = typeof p.heroMobile === 'object' ? p.heroMobile : null
    if (!m || !new RegExp(`^${p.slug}-00-mobile(-\\d+)?\\.jpg$`).test(m.filename ?? '')) continue
    const media = await payload.create({
      collection: 'media',
      data: { alt: m.alt },
      filePath: path.join(DIR, p.slug, `${p.slug}-00-mobile-v2.jpg`),
      req,
    })
    await payload.update({ collection: 'projects', id: p.id, data: { heroMobile: media.id }, req })
    payload.logger.info(`mobile heroes v2: ${p.slug} set`)
  }
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('mobile heroes v2: down is a no-op (the first versions are still in the media library)')
}
