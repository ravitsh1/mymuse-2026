import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Ravit (2026-11-01): tags on the home page service cards; a tag leads to the projects marked with it. First set by
// card title (the table is new, so every card starts without tags).
const PREFILL: Record<string, string[]> = {
  'אפיון': ['ux', 'multilingual', 'accessibility'],
  'הקמת האתר': ['ui', 'wordpress', 'woocommerce', 'content'],
  'פיתוח, API ואינטגרציות': ['api', 'tickets', 'delivery'],
  'אפליקציות ומערכות': ['app', 'system', 'ai'],
  'ליווי מתמשך': ['support'],
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "home_services" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   CREATE TYPE "public"."enum_home_services_tags" AS ENUM('ux', 'ui', 'wordpress', 'woocommerce', 'multilingual', 'content', 'tickets', 'delivery', 'app', 'system', 'api', 'ai', 'accessibility', 'support');
  CREATE TABLE "home_services_tags" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_home_services_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "home_services_tags" ADD CONSTRAINT "home_services_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home_services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_services_tags_order_idx" ON "home_services_tags" USING btree ("order");
  CREATE INDEX "home_services_tags_parent_idx" ON "home_services_tags" USING btree ("parent_id");`)
  for (const [title, tags] of Object.entries(PREFILL))
    for (const [k, tag] of tags.entries())
      await db.execute(sql`INSERT INTO "home_services_tags" ("order", "parent_id", "value")
        SELECT ${k + 1}, "id", ${tag}::"enum_home_services_tags" FROM "home_services" WHERE "title" = ${title}`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_services_tags" CASCADE;
  DROP TYPE "public"."enum_home_services_tags";`)
}
