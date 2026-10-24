import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1')
    await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings", "home_words", "media" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "settings" ALTER COLUMN "bg" SET DEFAULT '#111517';
  ALTER TABLE "settings" ALTER COLUMN "ink" SET DEFAULT '#ffffff';
  ALTER TABLE "settings" ALTER COLUMN "accent" SET DEFAULT '#ff7777';
  ALTER TABLE "home_words" ADD COLUMN "image_id" integer;
  ALTER TABLE "home_words" ADD CONSTRAINT "home_words_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "home_words_image_idx" ON "home_words" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "home_words" DROP CONSTRAINT "home_words_image_id_media_id_fk";
  
  DROP INDEX "home_words_image_idx";
  ALTER TABLE "settings" ALTER COLUMN "bg" SET DEFAULT '#16141a';
  ALTER TABLE "settings" ALTER COLUMN "ink" SET DEFAULT '#efe8de';
  ALTER TABLE "settings" ALTER COLUMN "accent" SET DEFAULT '#d6a05b';
  ALTER TABLE "home_words" DROP COLUMN "image_id";`)
}
