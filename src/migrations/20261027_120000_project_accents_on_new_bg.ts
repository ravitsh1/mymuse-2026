import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// After the backgrounds moved to the hero-image colours (project_bg_from_images), these accents nearly vanished on
// them (progress bar, ring, focus outline). New accents from the Neon Sunset palette, each at least 3:1 on its
// background. Each row changes only while the project still holds that background and the old accent.
// [slug, bg, old accent, new accent]
const ROWS: [string, string, string, string][] = [
  ['delivery-app', '#5a5058', '#c0703a', '#ff9f1c'],
  ['mybase', '#2c5a3e', '#f26a2e', '#ff9f1c'],
  ['teo', '#ecba61', '#ff9f1c', '#7b2351'],
  ['enosh', '#ffc732', '#69d5ca', '#235c68'],
  ['little-fences', '#ae2012', '#d1346f', '#ff9f1c'],
  ['studio-gur', '#ed1b24', '#ff9f1c', '#ffe8c2'],
  ['firon', '#1d74c4', '#ff73a3', '#1b1030'],
  ['gordon-pool', '#f6c214', '#69d5ca', '#235c68'],
  ['barantech', '#2fb3b8', '#ff3d7f', '#7b2351'],
  ['gurgroup', '#099396', '#2ec4b6', '#ffe8c2'],
  ['meteor-center', '#ca6702', '#ff9f1c', '#ffe8c2'],
]

const run = async (db: MigrateUpArgs['db'], from: 2 | 3, to: 2 | 3) => {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects" IN ACCESS EXCLUSIVE MODE;`)
  for (const r of ROWS)
    await db.execute(sql`UPDATE "projects" SET "accent" = ${r[to]}
      WHERE "slug" = ${r[0]} AND lower("bg") = ${r[1]} AND lower("accent") = ${r[from]}`)
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await run(db, 2, 3)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await run(db, 3, 2)
}
