import { resolveSignedURLKey } from '@payloadcms/plugin-cloud-storage/utilities'
import type { CollectionSlug, Config, Plugin } from 'payload'
import { APIError, Forbidden } from 'payload'
import { assertClientUploadAccess, assertClientUploadAllowed } from 'payload/internal'

/**
 * Workaround for a bug in @payloadcms/storage-vercel-blob 3.92 (client uploads): uploading a NEW file whose name
 * matches an existing media file (e.g. a second "neneroyal.jpg") is treated as "overwrite that file". The browser
 * then uploads to the bare name at the Blob root, while the server dedupes the new record to "neneroyal-1.jpg",
 * so the record points at a file that does not exist (404), and each such upload overwrites the previous one.
 *
 * Fix: the first step of the client upload (issuing the storage key) never grants an overwrite. Every upload gets
 * its own folder and a deduped name, the same path a first-time upload takes. The second step (the token for the
 * browser) stays the plugin's own and still checks the signed receipt. Replacing a file on an existing record
 * works the same way: the record gets the new key.
 */
const PATH = '/vercel-blob-client-upload-route'

export const blobUploadFix =
  (collections: CollectionSlug[]): Plugin =>
  (config: Config): Config => {
    const endpoint = config.endpoints?.find((e) => e.path === PATH)
    if (!endpoint) return config // storage off (local dev without a Blob token)
    const original = endpoint.handler
    endpoint.handler = async (req) => {
      if (req.searchParams.get('issue-client-upload') !== '1') return original(req)
      const body = (await req.json?.()) as { collectionSlug?: unknown; docPrefix?: unknown; filename?: unknown; mimeType?: unknown }
      const { collectionSlug, docPrefix, filename, mimeType } = body ?? {}
      if (
        typeof collectionSlug !== 'string' ||
        typeof filename !== 'string' ||
        typeof mimeType !== 'string' ||
        (docPrefix !== undefined && typeof docPrefix !== 'string') ||
        !collections.includes(collectionSlug as CollectionSlug)
      ) {
        throw new APIError('Invalid upload payload', 400)
      }
      await assertClientUploadAccess({ collectionSlug, req })
      if (!req.user) throw new Forbidden()
      assertClientUploadAllowed({ collection: req.payload.collections[collectionSlug as CollectionSlug]?.config, filename, mimeType })
      const resolved = await resolveSignedURLKey({ collectionSlug, docPrefix, filename, req })
      return Response.json({
        clientUploadContext: resolved.clientUploadContext,
        filename: resolved.sanitizedFilename,
        pathname: resolved.storageFilePath,
      })
    }
    return config
  }
