import { promises as fs } from 'fs'
import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'

/**
 * Workaround for a Payload bug with direct-to-Blob ("client") uploads of GIF / WebP (found on threebears-2026):
 * the browser uploads the file to storage, the server downloads it to a temp file and runs it through sharp,
 * and then the storage plugin re-uploads `req.file.data` — which is still empty, because sharp's output went
 * to the temp file. Result: a 0-byte file in storage. Hand it the real bytes.
 */
const fillProcessedUpload: CollectionBeforeChangeHook = async ({ req, data }) => {
  const file = req.file
  if (file && !file.clientUploadContext && file.tempFilePath && (!file.data || file.data.length === 0)) {
    try {
      const bytes = await fs.readFile(file.tempFilePath)
      if (bytes.length) req.file = { ...file, data: bytes, size: bytes.length }
    } catch (e) {
      req.payload.logger.error({ err: e }, 'media: could not read the processed upload')
    }
  }
  return data
}

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'קובץ מדיה', plural: 'מדיה' },
  admin: { group: 'תוכן' },
  access: { read: () => true },
  hooks: { beforeChange: [fillProcessedUpload] },
  fields: [
    {
      name: 'alt',
      label: 'טקסט חלופי',
      type: 'text',
      admin: { description: 'מה רואים בתמונה, לקוראי מסך ולגוגל. ריק = תמונה דקורטיבית בלבד.' },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'video/*'],
    focalPoint: true,
  },
}
