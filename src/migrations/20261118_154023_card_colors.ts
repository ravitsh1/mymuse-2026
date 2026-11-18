import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Home → שירותים (2026-11-18): each card's background becomes editable in the admin. The column held old, unused
// values (the field was hidden and the colours came from lib/brand.ts), so every card gets the colour it shows today,
// in the palette order, and the site looks the same until Ravit picks another one.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "home_services" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "home_services" ALTER COLUMN "bg" SET DEFAULT '#1b0d2d';
   WITH o AS (SELECT "id", row_number() OVER (ORDER BY "_order") - 1 AS i FROM "home_services")
   UPDATE "home_services" s
     SET "bg" = (ARRAY['#1b0d2d', '#9e3a64', '#ffffff', '#3f546e', '#e1f450'])[(o.i % 5) + 1]
     FROM o WHERE s."id" = o."id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_services" ALTER COLUMN "bg" SET DEFAULT '#ffe8c2';`)
}
