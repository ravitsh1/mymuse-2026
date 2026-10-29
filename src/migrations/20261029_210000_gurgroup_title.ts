import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Ravit (2026-10-29): the project is "קבוצת גור", as on her list. Only while it still has the old name.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`UPDATE "projects" SET "title" = 'קבוצת גור' WHERE "slug" = 'gurgroup' AND "title" = 'קבוצת גור ביטוח'`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`UPDATE "projects" SET "title" = 'קבוצת גור ביטוח' WHERE "slug" = 'gurgroup' AND "title" = 'קבוצת גור'`)
}
