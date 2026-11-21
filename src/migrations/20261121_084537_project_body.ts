import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { textToLexical } from '../lib/richtext'

// Projects → body (2026-11-21): the opening text becomes rich text (bold, lists, line breaks), as Ravit asked. The
// plain column `lead` stays (the code on main reads it, and it keeps feeding the meta description, JSON-LD and
// llms.txt, filled from body on save). Each project's current text is converted: a blank line is a new paragraph, a
// single line break stays one, lines starting with "- " become a list. Only rows without a body yet.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`ALTER TABLE "projects" ADD COLUMN "body" jsonb;`)
  const res = await db.execute(sql`SELECT "id", "lead" FROM "projects" WHERE "body" IS NULL AND coalesce(trim("lead"), '') <> ''`)
  const rows = ((res as { rows?: unknown[] }).rows ?? (res as unknown as unknown[])) as { id: number; lead: string }[]
  for (const r of rows) {
    await db.execute(sql`UPDATE "projects" SET "body" = ${JSON.stringify(textToLexical(r.lead))}::jsonb WHERE "id" = ${r.id}`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "projects" DROP COLUMN "body";`)
}
