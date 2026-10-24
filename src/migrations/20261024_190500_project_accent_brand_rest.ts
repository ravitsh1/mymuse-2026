import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The three sample palettes with their own yellow/gold accent follow project_accent_brand: brand pink-red #ff7777,
// lightened only where 4.5:1 on the background needs it. Only projects still holding that exact colour change.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'margalit' AND lower("accent") = '#e0a96d';
  UPDATE "projects" SET "accent" = '#ffbbbb' WHERE "slug" = 'vinspiration' AND lower("accent") = '#e7c75a';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'jullius' AND lower("accent") = '#c8953f';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "projects" SET "accent" = '#e0a96d' WHERE "slug" = 'margalit' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "accent" = '#e7c75a' WHERE "slug" = 'vinspiration' AND lower("accent") = '#ffbbbb';
  UPDATE "projects" SET "accent" = '#c8953f' WHERE "slug" = 'jullius' AND lower("accent") = '#ff7777';`)
}
