import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Settings → heroShade (2026-11-03, Ravit's trial): no gradient over the hero pictures and the next-project frame.
// The column default puts the existing settings on "none"; "gradient" brings back the shade. Schema only.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   CREATE TYPE "public"."enum_settings_hero_shade" AS ENUM('none', 'gradient');
  ALTER TABLE "settings" ADD COLUMN "hero_shade" "enum_settings_hero_shade" DEFAULT 'none';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" DROP COLUMN "hero_shade";
  DROP TYPE "public"."enum_settings_hero_shade";`)
}
