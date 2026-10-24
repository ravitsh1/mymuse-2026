import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { he } from '@payloadcms/translations/languages/he'
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

// SQLite file for local work ("file:./mymuse.db"), Postgres in production ("postgres://…").
const dbUrl = process.env.DATABASE_URL || 'file:./mymuse.db'
const db = dbUrl.startsWith('postgres')
  ? postgresAdapter({ pool: { connectionString: dbUrl } })
  : sqliteAdapter({ client: { url: dbUrl } })

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' · ניהול MyMuse' },
  },
  i18n: {
    supportedLanguages: { he },
    fallbackLanguage: 'he',
  },
  collections: [Projects, Pages, Media, Users],
  globals: [Home, Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db,
  sharp,
  plugins: [],
})
