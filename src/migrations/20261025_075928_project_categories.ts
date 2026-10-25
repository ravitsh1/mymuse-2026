import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1')
    await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects", "payload_locked_documents_rels" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "projects" ADD COLUMN "category_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" integer;
  CREATE INDEX "categories__order_idx" ON "categories" USING btree ("_order");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_category_idx" ON "projects" USING btree ("category_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");`)
  await db.execute(sql`
  -- the four categories Ravit chose, in this order, and each project in its category (new column: all empty)
  INSERT INTO "categories" ("_order", "title") VALUES ('a0', 'יין ואוכל');
  UPDATE "projects" SET "category_id" = (SELECT "id" FROM "categories" WHERE "title" = 'יין ואוכל') WHERE "slug" IN ('recanati', 'margalit', 'agur', 'moa-winery', 'netofa', 'winecase', 'jullius', 'vinspiration') AND "category_id" IS NULL;
  INSERT INTO "categories" ("_order", "title") VALUES ('a1', 'עסקים וטכנולוגיה');
  UPDATE "projects" SET "category_id" = (SELECT "id" FROM "categories" WHERE "title" = 'עסקים וטכנולוגיה') WHERE "slug" IN ('gurgroup', 'helios', 'samurai', 'barantech', 'firon', 'mosessco') AND "category_id" IS NULL;
  INSERT INTO "categories" ("_order", "title") VALUES ('a2', 'תרבות וקהילה');
  UPDATE "projects" SET "category_id" = (SELECT "id" FROM "categories" WHERE "title" = 'תרבות וקהילה') WHERE "slug" IN ('meteor-center', 'teo', 'gordon-pool', 'enosh') AND "category_id" IS NULL;
  INSERT INTO "categories" ("_order", "title") VALUES ('a3', 'עיצוב, ספרים ואופנה');
  UPDATE "projects" SET "category_id" = (SELECT "id" FROM "categories" WHERE "title" = 'עיצוב, ספרים ואופנה') WHERE "slug" IN ('studio-gur', '3-bears', 'little-fences', 'benny-goren', 'boutique77') AND "category_id" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // constraints and columns first: dropping the table with CASCADE would remove the constraints and make these fail
  await db.execute(sql`
   ALTER TABLE "projects" DROP CONSTRAINT "projects_category_id_categories_id_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  DROP INDEX "projects_category_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  ALTER TABLE "projects" DROP COLUMN "category_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  DROP TABLE "categories";`)
}
