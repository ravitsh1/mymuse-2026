import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Settings → projectOrder (2026-11-10): the home index under "all" in random order (today's behaviour, the default)
// or in the admin order. Schema only.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   CREATE TYPE "public"."enum_settings_project_order" AS ENUM('random', 'admin');
  ALTER TABLE "settings" ADD COLUMN "project_order" "enum_settings_project_order" DEFAULT 'random';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" DROP COLUMN "project_order";
  DROP TYPE "public"."enum_settings_project_order";`)
}
