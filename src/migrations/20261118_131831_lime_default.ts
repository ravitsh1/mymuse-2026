import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The lime moved to #e1f450 (2026-11-18): the DEV stroke's column default follows, and a stored
// value still at the previous lime moves with it (a colour picked in the admin stays).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "settings" ALTER COLUMN "brush_dev" SET DEFAULT '#e1f450';
   UPDATE "settings" SET "brush_dev" = '#e1f450' WHERE lower("brush_dev") = '#d8f450';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" ALTER COLUMN "brush_dev" SET DEFAULT '#d8f450';`)
}
