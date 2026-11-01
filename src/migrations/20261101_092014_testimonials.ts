import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Ravit (2026-11-01): testimonials, empty for her to fill in the admin: a home section (hidden while empty) and one
// quote per project. Schema only, no data.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1')
    await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects", "home" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   CREATE TABLE "home_testimonials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"company" varchar,
  	"project_id" integer
  );
  
  ALTER TABLE "projects" ADD COLUMN "testimonial_quote" varchar;
  ALTER TABLE "projects" ADD COLUMN "testimonial_name" varchar;
  ALTER TABLE "projects" ADD COLUMN "testimonial_role" varchar;
  ALTER TABLE "projects" ADD COLUMN "testimonial_company" varchar;
  ALTER TABLE "home" ADD COLUMN "testimonials_title" varchar DEFAULT 'מה אומרים עלינו';
  ALTER TABLE "home_testimonials" ADD CONSTRAINT "home_testimonials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "home_testimonials" ADD CONSTRAINT "home_testimonials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."home"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "home_testimonials_order_idx" ON "home_testimonials" USING btree ("_order");
  CREATE INDEX "home_testimonials_parent_id_idx" ON "home_testimonials" USING btree ("_parent_id");
  CREATE INDEX "home_testimonials_project_idx" ON "home_testimonials" USING btree ("project_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "home_testimonials" CASCADE;
  ALTER TABLE "projects" DROP COLUMN "testimonial_quote";
  ALTER TABLE "projects" DROP COLUMN "testimonial_name";
  ALTER TABLE "projects" DROP COLUMN "testimonial_role";
  ALTER TABLE "projects" DROP COLUMN "testimonial_company";
  ALTER TABLE "home" DROP COLUMN "testimonials_title";`)
}
