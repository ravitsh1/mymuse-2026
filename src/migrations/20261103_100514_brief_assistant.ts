import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The brief assistant (2026-11-03): a Briefs collection for what visitors send, and Settings → briefAssistant
// (off by default, so nothing shows until Ravit turns it on). Schema only.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1')
    await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings", "payload_locked_documents_rels" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   CREATE TABLE "briefs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"contact" varchar NOT NULL,
  	"business" varchar,
  	"situation" varchar,
  	"goal" varchar,
  	"systems" varchar,
  	"timeline" varchar,
  	"notes" varchar,
  	"transcript" jsonb,
  	"mailed" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "briefs_id" integer;
  ALTER TABLE "settings" ADD COLUMN "brief_assistant" boolean DEFAULT false;
  CREATE INDEX "briefs_updated_at_idx" ON "briefs" USING btree ("updated_at");
  CREATE INDEX "briefs_created_at_idx" ON "briefs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_briefs_fk" FOREIGN KEY ("briefs_id") REFERENCES "public"."briefs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_briefs_id_idx" ON "payload_locked_documents_rels" USING btree ("briefs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "briefs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "briefs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_briefs_fk";
  
  DROP INDEX "payload_locked_documents_rels_briefs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "briefs_id";
  ALTER TABLE "settings" DROP COLUMN "brief_assistant";`)
}
