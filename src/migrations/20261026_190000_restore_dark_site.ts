import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Undo of the light-site test: its PR (#31) was not merged, but its preview build had already run the light_site
// migration on the shared production database. This puts the Neon (dark) site colours, the first service card and the
// column defaults back, only where they still hold the light values.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1')
    await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings", "home_services" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
  ALTER TABLE "settings" ALTER COLUMN "bg" SET DEFAULT '#1b1030';
  ALTER TABLE "settings" ALTER COLUMN "ink" SET DEFAULT '#ffe8c2';
  ALTER TABLE "settings" ALTER COLUMN "accent" SET DEFAULT '#ff3d7f';
  UPDATE "settings" SET "bg" = '#1b1030' WHERE lower("bg") = '#ffe8c2';
  UPDATE "settings" SET "ink" = '#ffe8c2' WHERE lower("ink") = '#1b1030';
  UPDATE "settings" SET "accent" = '#ff3d7f' WHERE lower("accent") = '#a42b5f';
  UPDATE "home_services" SET "bg" = '#ffe8c2', "ink" = '#1b1030' WHERE "title" = 'אפיון' AND lower("bg") = '#1b1030' AND lower("ink") = '#ffe8c2';`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('restore dark site: down is a no-op')
}
