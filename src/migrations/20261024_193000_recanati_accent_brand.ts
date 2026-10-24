import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Recanati follows the other projects: brand pink-red accent (5.8:1 on its background). Only while it still holds
// the sample teal.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'recanati' AND lower("accent") = '#7fc4c9';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "projects" SET "accent" = '#7fc4c9' WHERE "slug" = 'recanati' AND lower("accent") = '#ff7777';`)
}
