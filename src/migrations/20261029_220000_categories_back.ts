import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Ravit (2026-10-29): the sites keep the categories they had before projects_2026; only the apps category keeps its
// new name ("אפליקציות"). Each project moves only while it is still in "אתרים".
const BACK: [string, string[]][] = [
  ['יין ואוכל', ['recanati', 'margalit', 'jullius', 'vinspiration', 'our-kitchen']],
  ['עסקים וטכנולוגיה', ['gurgroup', 'firon']],
  ['תרבות וקהילה', ['teo']],
  ['עיצוב, ספרים ואופנה', ['3-bears', 'benny-goren']],
]
const SITES = BACK.flatMap(([, s]) => s)

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`UPDATE "categories" SET "title" = 'יין ואוכל' WHERE "title" = 'אתרים'`)
  for (const [cat, slugs] of BACK)
    for (const slug of slugs)
      await db.execute(sql`UPDATE "projects" SET "category_id" = (SELECT "id" FROM "categories" WHERE "title" = ${cat} LIMIT 1) WHERE "slug" = ${slug}`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`UPDATE "categories" SET "title" = 'אתרים' WHERE "title" = 'יין ואוכל'`)
  for (const slug of SITES)
    await db.execute(sql`UPDATE "projects" SET "category_id" = (SELECT "id" FROM "categories" WHERE "title" = 'אתרים' LIMIT 1) WHERE "slug" = ${slug}`)
}
