import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects", "media" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "hero_fit_portrait" boolean DEFAULT false;`)
  // Turn it on where Ravit asked to try it: Little Fences, whose hero is the laptop + phone mockup.
  await db.execute(sql`
   UPDATE "projects" SET "hero_fit_portrait" = true
     WHERE "slug" = 'little-fences' AND "hero_id" IN (SELECT "id" FROM "media" WHERE "filename" ~ '^gderot-08-mockup(-[0-9]+)?\\.jpg$');`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP COLUMN "hero_fit_portrait";`)
}
