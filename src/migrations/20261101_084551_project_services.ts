import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Ravit (2026-11-01): service tags on project pages instead of a services page. A new field, and a first set of tags
// for every visible project, from its scope and platform (she edits them in the admin). The table is new, so every
// project starts without tags.
const WP = ['ux', 'ui', 'wordpress']
const SHOP = [...WP, 'woocommerce']
const PREFILL: Record<string, string[]> = {
  '3-bears': WP,
  amphora: SHOP,
  lotem: SHOP,
  shikui: SHOP,
  firon: ['ux', 'ui', 'multilingual'],
  pauker: SHOP,
  'nene-royal': SHOP,
  gurgroup: WP,
  'our-kitchen': [...WP, 'content'],
  vinspiration: WP,
  'rachashei-lev': WP,
  hamesila: WP,
  tushia: SHOP,
  teo: [...SHOP, 'tickets'],
  jullius: SHOP,
  'udi-fish': [...SHOP, 'delivery'],
  'benny-goren': ['ux', 'ui', 'content'],
  margalit: [...WP, 'multilingual'],
  recanati: [...WP, 'multilingual'],
  'delivery-app': ['ux', 'ui', 'app', 'system', 'ai'],
  mybase: ['ux', 'ui', 'app', 'system'],
  'client-portal': ['ux', 'ui', 'app', 'system'],
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_services" AS ENUM('ux', 'ui', 'wordpress', 'woocommerce', 'multilingual', 'content', 'tickets', 'delivery', 'app', 'system', 'api', 'ai', 'accessibility', 'support');
  CREATE TABLE "projects_services" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_projects_services",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "projects_services" ADD CONSTRAINT "projects_services_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_services_order_idx" ON "projects_services" USING btree ("order");
  CREATE INDEX "projects_services_parent_idx" ON "projects_services" USING btree ("parent_id");`)
  for (const [slug, tags] of Object.entries(PREFILL))
    for (const [k, tag] of tags.entries())
      await db.execute(sql`INSERT INTO "projects_services" ("order", "parent_id", "value")
        SELECT ${k + 1}, "id", ${tag}::"enum_projects_services" FROM "projects" WHERE "slug" = ${slug}`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_services" CASCADE;
  DROP TYPE "public"."enum_projects_services";`)
}
