import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Service tags move from a fixed list in code to Settings → שירותים (2026-11-10). Projects and the home service cards
// keep their tags: the old enum values become the ids of the Settings rows (ux, ui, ...), so the stored values and
// links like /?service=ux stay the same. Schema, then the copy. The old tables (projects_services, home_services_tags
// and their enum types) are LEFT IN PLACE on purpose: a PR's preview build runs this against the shared production
// database while the code on main still reads them. Drop them in a later migration, once this is live.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1')
    await db.execute(
      sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects", "projects_services", "home", "home_services", "home_services_tags", "settings" IN ACCESS EXCLUSIVE MODE;`,
    )
  await db.execute(sql`
   CREATE TABLE "projects_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "home_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "settings_service_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  INSERT INTO "settings_service_tags" ("_order", "_parent_id", "id", "label")
  SELECT t.ord, st.id, t.id, t.label
  FROM "settings" st
  CROSS JOIN (VALUES
    (1, 'ux', 'אפיון UX'), (2, 'ui', 'עיצוב UI'), (3, 'wordpress', 'וורדפרס'), (4, 'woocommerce', 'חנות ווקומרס'),
    (5, 'multilingual', 'אתר רב־לשוני'), (6, 'content', 'אתר תוכן'), (7, 'tickets', 'מכירת כרטיסים'),
    (8, 'delivery', 'הזמנות ומשלוחים'), (9, 'app', 'אפליקציית ווב'), (10, 'system', 'מערכת ניהול'),
    (11, 'api', 'אינטגרציות API'), (12, 'ai', 'AI'), (13, 'accessibility', 'נגישות'), (14, 'support', 'ליווי ותחזוקה')
  ) AS t(ord, id, label)
  WHERE NOT EXISTS (SELECT 1 FROM "settings_service_tags" x WHERE x."_parent_id" = st.id);

  INSERT INTO "projects_texts" ("order", "parent_id", "path", "text")
  SELECT ps."order", ps."parent_id", 'services', ps."value"::text FROM "projects_services" ps;

  INSERT INTO "home_texts" ("order", "parent_id", "path", "text")
  SELECT ht."order", hs."_parent_id", 'services.' || (hs.idx - 1) || '.tags', ht."value"::text
  FROM "home_services_tags" ht
  JOIN (SELECT "id", "_parent_id", ROW_NUMBER() OVER (PARTITION BY "_parent_id" ORDER BY "_order") AS idx FROM "home_services") hs
    ON hs."id" = ht."parent_id";

  ALTER TABLE "projects_texts" ADD CONSTRAINT "projects_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "home_texts" ADD CONSTRAINT "home_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings_service_tags" ADD CONSTRAINT "settings_service_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_texts_order_parent" ON "projects_texts" USING btree ("order","parent_id");
  CREATE INDEX "home_texts_order_parent" ON "home_texts" USING btree ("order","parent_id");
  CREATE INDEX "settings_service_tags_order_idx" ON "settings_service_tags" USING btree ("_order");
  CREATE INDEX "settings_service_tags_parent_id_idx" ON "settings_service_tags" USING btree ("_parent_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE "projects_texts" CASCADE;
  DROP TABLE "home_texts" CASCADE;
  DROP TABLE "settings_service_tags" CASCADE;`)
}
