import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { he } from '@payloadcms/translations/languages/he'
import { createHash } from 'crypto'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { Pages } from './collections/Pages'
import { Home } from './globals/Home'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const LOCAL_PGLITE = process.env.LOCAL_PGLITE === '1'
const DB_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || ''
// Payload secret: the env var if set; otherwise derived from the (already secret) database URL, so a fresh
// Vercel project works with only the Neon + Blob integrations and no hand-typed keys. (Same as threebears-2026.)
const SECRET = process.env.PAYLOAD_SECRET || (DB_URL ? createHash('sha256').update(`payload:${DB_URL}`).digest('hex') : '')
// Site URL: the env var if set, else Vercel's production domain, else the deployment URL
const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : '')

export default buildConfig({
  serverURL: SERVER_URL,
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · ניהול MyMuse' },
    components: {
      beforeDashboard: ['@/components/admin/Dashboard#Welcome'],
      graphics: {
        Logo: '@/components/admin/Brand#Logo',
        Icon: '@/components/admin/Brand#Icon',
      },
    },
    livePreview: {
      // each collection/global sets its own preview url (admin.livePreview.url); this enables it and sets the sizes
      url: '/',
      globals: ['home'],
      collections: ['projects', 'pages'],
      breakpoints: [
        { label: 'מובייל', name: 'mobile', width: 375, height: 812 },
        { label: 'טאבלט', name: 'tablet', width: 768, height: 1024 },
        { label: 'דסקטופ', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  i18n: {
    supportedLanguages: { he },
    fallbackLanguage: 'he',
  },
  collections: [Projects, Pages, Media, Users],
  globals: [Home, Settings],
  editor: lexicalEditor(),
  secret: SECRET,
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts'), autoGenerate: false },
  db: postgresAdapter({
    pool: {
      connectionString: DB_URL,
      // local dev runs on PGlite (single process): few connections and no transactions, or parallel tx deadlock
      ...(LOCAL_PGLITE ? { max: 3 } : {}),
    },
    ...(LOCAL_PGLITE ? { transactionOptions: false as const } : {}),
    push: false, // schema changes go through migrations everywhere (migrate:create → migrate)
  }),
  // very long images (full-page site captures) exceed sharp's default pixel limit
  sharp: ((input: Parameters<typeof sharp>[0], options?: Parameters<typeof sharp>[1]) =>
    sharp(input, { ...(options || {}), limitInputPixels: false })) as unknown as typeof sharp,
  plugins: [
    // Production media goes to Vercel Blob; locally (no token) files stay on disk in /media.
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      alwaysInsertFields: true, // keep the storage columns in the schema locally too, so migrations match production
      // media is public anyway: link straight to the Blob CDN instead of streaming every file through a function
      collections: { media: { disablePayloadAccessControl: true } },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true, // upload straight from the browser — bypasses Vercel's 4.5MB request limit (videos)
    }),
  ],
})
