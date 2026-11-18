import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The dark blue moved to #3f546e (2026-11-18, #17283f was too close to the eggplant): the EXPERIENCE stroke's column
// default follows, and a stored value still at the old blue moves with it (a colour picked in the admin stays).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "settings" ALTER COLUMN "brush_experience" SET DEFAULT '#3f546e';
   UPDATE "settings" SET "brush_experience" = '#3f546e' WHERE lower("brush_experience") = '#17283f';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" ALTER COLUMN "brush_experience" SET DEFAULT '#17283f';`)
}
