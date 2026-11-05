import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Home → עלינו → aboutWords (2026-11-05): the big about-section words, until now fixed in code, become editable (word +
// colour). Schema, then the four words as they were, only for a Home that has none yet.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "home" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   CREATE TABLE "home_about_words" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"word" varchar NOT NULL,
  	"color" varchar DEFAULT '#1c0f30'
  );
  
  ALTER TABLE "home_about_words" ADD CONSTRAINT "home_about_words_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_about_words_order_idx" ON "home_about_words" USING btree ("_order");
  CREATE INDEX "home_about_words_parent_id_idx" ON "home_about_words" USING btree ("_parent_id");`)
  await db.execute(sql`
  INSERT INTO "home_about_words" ("_order", "_parent_id", "id", "word", "color")
  SELECT w.ord, h.id, substr(md5(random()::text || h.id::text || w.ord::text), 1, 24), w.word, w.color
  FROM "home" h
  CROSS JOIN (VALUES (1, 'Ideas', '#1c0f30'), (2, 'Design', '#801f48'), (3, 'Development', '#ff2d83'), (4, 'Experience', '#1c0f30')) AS w(ord, word, color)
  WHERE NOT EXISTS (SELECT 1 FROM "home_about_words" x WHERE x."_parent_id" = h.id);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_about_words" CASCADE;`)
}
