import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Settings → nextMode (2026-11-03): how a project page ends, "scroll" (today's growing frame, the default) or "card"
// (a next-project card with a button). Schema only; existing settings stay on "scroll".
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   CREATE TYPE "public"."enum_settings_next_mode" AS ENUM('scroll', 'card');
  ALTER TABLE "settings" ADD COLUMN "next_mode" "enum_settings_next_mode" DEFAULT 'scroll';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" DROP COLUMN "next_mode";
  DROP TYPE "public"."enum_settings_next_mode";`)
}
