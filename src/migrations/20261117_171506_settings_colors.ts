import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Settings → צבעים (2026-11-17): the accent-word colour and the four hero brush colours, editable in the admin;
// plus the Search Console verification code. Column defaults fill the existing row with today's look.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "settings" ADD COLUMN "accent_word" varchar DEFAULT '#9e3a64';
  ALTER TABLE "settings" ADD COLUMN "brush_ideas" varchar DEFAULT '#000000';
  ALTER TABLE "settings" ADD COLUMN "brush_design" varchar DEFAULT '#9e3a64';
  ALTER TABLE "settings" ADD COLUMN "brush_experience" varchar DEFAULT '#dc3180';
  ALTER TABLE "settings" ADD COLUMN "brush_dev" varchar DEFAULT '#f0e765';
  ALTER TABLE "settings" ADD COLUMN "google_verification" varchar DEFAULT 'snVOgo4nNVKU4Uq4czkL_48YyydinPUzN4SIvv6e0GU';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" DROP COLUMN "accent_word";
  ALTER TABLE "settings" DROP COLUMN "brush_ideas";
  ALTER TABLE "settings" DROP COLUMN "brush_design";
  ALTER TABLE "settings" DROP COLUMN "brush_experience";
  ALTER TABLE "settings" DROP COLUMN "brush_dev";
  ALTER TABLE "settings" DROP COLUMN "google_verification";`)
}
