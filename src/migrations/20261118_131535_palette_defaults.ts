import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Palette 2026-11-18: new column defaults for Settings → צבעים (the stored values move in palette_values).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "settings" ALTER COLUMN "accent_word" SET DEFAULT '#c94f86';
  ALTER TABLE "settings" ALTER COLUMN "brush_ideas" SET DEFAULT '#1b0d2d';
  ALTER TABLE "settings" ALTER COLUMN "brush_design" SET DEFAULT '#c94f86';
  ALTER TABLE "settings" ALTER COLUMN "brush_experience" SET DEFAULT '#17283f';
  ALTER TABLE "settings" ALTER COLUMN "brush_dev" SET DEFAULT '#d8f450';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" ALTER COLUMN "accent_word" SET DEFAULT '#9e3a64';
  ALTER TABLE "settings" ALTER COLUMN "brush_ideas" SET DEFAULT '#000000';
  ALTER TABLE "settings" ALTER COLUMN "brush_design" SET DEFAULT '#9e3a64';
  ALTER TABLE "settings" ALTER COLUMN "brush_experience" SET DEFAULT '#dc3180';
  ALTER TABLE "settings" ALTER COLUMN "brush_dev" SET DEFAULT '#f0e765';`)
}
