import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Settings → the home hero texts (2026-11-10), until now fixed in BrandHero. The column defaults carry today's texts,
// so the existing settings row starts with them and nothing changes on the site.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "settings" ADD COLUMN "hero_tag" varchar DEFAULT 'סטודיו לעיצוב ופיתוח אתרים';
  ALTER TABLE "settings" ADD COLUMN "hero_title" varchar DEFAULT E'מה שדמיינתם,\nעם כל מה שעוד\n*לא חשבתם עליו.*';
  ALTER TABLE "settings" ADD COLUMN "hero_text" varchar DEFAULT 'ב־MyMuse הופכים רעיונות לאתרים, חוויות דיגיטליות ופתרונות חכמים. משלבים יצירתיות, עיצוב וטכנולוגיה כדי לבנות בדיוק את מה שהעסק שלכם צריך, ולפעמים גם את מה שעוד לא ידעתם שהוא יכול לעשות.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" DROP COLUMN "hero_tag";
  ALTER TABLE "settings" DROP COLUMN "hero_title";
  ALTER TABLE "settings" DROP COLUMN "hero_text";`)
}
