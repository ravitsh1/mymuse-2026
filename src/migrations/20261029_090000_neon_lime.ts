import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Neon palette: lime in place of turquoise (Ravit, 2026-10-29) — the second service card and the project accents.
// Project backgrounds stay: each matches the band of its hero image (gurgroup's turquoise is the client's own).
// Each row changes only while it still holds the old colour.
const LIME = '#c6f432'
// [slug, old accent]
const ACCENTS: [string, string][] = [
  ['samurai', '#69d5ca'],
  ['agur', '#2ec4b6'],
  ['3-bears', '#69d5ca'],
  ['boutique77', '#2ec4b6'],
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1')
    await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects", "home_services" IN ACCESS EXCLUSIVE MODE;`)
  for (const [slug, old] of ACCENTS)
    await db.execute(sql`UPDATE "projects" SET "accent" = ${LIME} WHERE "slug" = ${slug} AND lower("accent") = ${old}`)
  await db.execute(sql`UPDATE "home_services" SET "bg" = ${LIME} WHERE lower("bg") = '#2ec4b6'`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [slug, old] of ACCENTS)
    await db.execute(sql`UPDATE "projects" SET "accent" = ${old} WHERE "slug" = ${slug} AND lower("accent") = ${LIME}`)
  await db.execute(sql`UPDATE "home_services" SET "bg" = '#2ec4b6' WHERE lower("bg") = ${LIME}`)
}
