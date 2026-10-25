import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1')
    await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects", "media" IN ACCESS EXCLUSIVE MODE;`)
  // Optional portrait hero for mobile (art direction in Visual); empty = the wide hero, as before.
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "hero_mobile_id" integer;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_hero_mobile_id_media_id_fk" FOREIGN KEY ("hero_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "projects_hero_mobile_idx" ON "projects" USING btree ("hero_mobile_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP CONSTRAINT "projects_hero_mobile_id_media_id_fk";
  DROP INDEX "projects_hero_mobile_idx";
  ALTER TABLE "projects" DROP COLUMN "hero_mobile_id";`)
}
