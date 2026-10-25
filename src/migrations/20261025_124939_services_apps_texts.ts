import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1')
    await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "home", "home_services", "settings" IN ACCESS EXCLUSIVE MODE;`)
  // Apps and integrations join the offer (Ravit, 2026-10-25). Only rows still holding the exact previous wording change;
  // anything edited in the admin stays.
  await db.execute(sql`
  ALTER TABLE "home" ALTER COLUMN "subtitle" SET DEFAULT 'אתרים, אפליקציות ומערכות בהתאמה אישית, מהאפיון ועד הליווי שאחרי ההשקה.';
  ALTER TABLE "home" ALTER COLUMN "about_body" SET DEFAULT 'MyMuse הוקמה ב־2010 על ידי רוית שליוינסקי, מפתחת אתרים, בעשר אצבעות ועם שפע של מקורות השראה. מאז בנינו, בשיתוף פעולה מלא עם הלקוחות, מאות אתרים: ליקבים ולמותגי יין, לחברות טכנולוגיה וביטוח, למרכזי קהילה ותרבות ולמותגי לייף־סטייל. לצד האתרים אנחנו בונות גם אפליקציות ומערכות ניהול, כשהעבודה של העסק צריכה כלי משלה.

אנחנו מאמינות שלכל עסק יש אופי משלו, ולכן אין אצלנו אתרים מתבנית: כל לקוח מקבל יחס אישי, תשובות ישירות ואתר שנבנה סביב המטרות שלו.

ההשראה שלנו היא ההצלחה שלכם.';
  ALTER TABLE "settings" ALTER COLUMN "meta_description" SET DEFAULT 'MyMuse – סטודיו לאתרים, אפליקציות ומערכות בהתאמה אישית מאז 2010: אפיון, עיצוב, פיתוח וליווי מתמשך, תחת קורת גג אחת.';
  UPDATE "home" SET "subtitle" = 'אתרים, אפליקציות ומערכות בהתאמה אישית, מהאפיון ועד הליווי שאחרי ההשקה.' WHERE "subtitle" = 'אתרים בהתאמה אישית, מהאפיון ועד הליווי שאחרי ההשקה.';
  UPDATE "home" SET "about_body" = 'MyMuse הוקמה ב־2010 על ידי רוית שליוינסקי, מפתחת אתרים, בעשר אצבעות ועם שפע של מקורות השראה. מאז בנינו, בשיתוף פעולה מלא עם הלקוחות, מאות אתרים: ליקבים ולמותגי יין, לחברות טכנולוגיה וביטוח, למרכזי קהילה ותרבות ולמותגי לייף־סטייל. לצד האתרים אנחנו בונות גם אפליקציות ומערכות ניהול, כשהעבודה של העסק צריכה כלי משלה.

אנחנו מאמינות שלכל עסק יש אופי משלו, ולכן אין אצלנו אתרים מתבנית: כל לקוח מקבל יחס אישי, תשובות ישירות ואתר שנבנה סביב המטרות שלו.

ההשראה שלנו היא ההצלחה שלכם.' WHERE "about_body" = 'MyMuse הוקמה ב־2010 על ידי רוית שליוינסקי, מפתחת אתרים, בעשר אצבעות ועם שפע של מקורות השראה. מאז בנינו, בשיתוף פעולה מלא עם הלקוחות, מאות אתרים: ליקבים ולמותגי יין, לחברות טכנולוגיה וביטוח, למרכזי קהילה ותרבות ולמותגי לייף־סטייל.

אנחנו מאמינות שלכל עסק יש אופי משלו, ולכן אין אצלנו אתרים מתבנית: כל לקוח מקבל יחס אישי, תשובות ישירות ואתר שנבנה סביב המטרות שלו.

ההשראה שלנו היא ההצלחה שלכם.';
  UPDATE "settings" SET "meta_description" = 'MyMuse – סטודיו לאתרים, אפליקציות ומערכות בהתאמה אישית מאז 2010: אפיון, עיצוב, פיתוח וליווי מתמשך, תחת קורת גג אחת.' WHERE "meta_description" = 'MyMuse – סטודיו לבניית אתרים בהתאמה אישית מאז 2010: אפיון, עיצוב, פיתוח וליווי מתמשך, תחת קורת גג אחת.';
  -- the development card becomes "development, API and integrations", and an apps card goes in right after it
  -- (before "ongoing support"); only where the card still has its old wording and there is no apps card yet
  UPDATE "home_services" SET "_order" = "_order" + 1 WHERE "_order" > 3 AND "_parent_id" IN (
    SELECT "_parent_id" FROM "home_services" WHERE "title" = 'פיתוח ממשק' AND "text" = 'חנויות WooCommerce, חיבור למערכות שכבר עובדות אצלכם, תוספים ורכיבים שנכתבים במיוחד, כשמה שיש על המדף לא מספיק.' AND "_order" = 3)
    AND NOT EXISTS (SELECT 1 FROM "home_services" WHERE "title" = 'אפליקציות ומערכות');
  INSERT INTO "home_services" ("_order", "_parent_id", "id", "title", "text", "bg", "ink")
    SELECT 4, "_parent_id", substr(md5(random()::text), 1, 24), 'אפליקציות ומערכות', 'כשגיליון וקבוצת וואטסאפ כבר לא מספיקים: מערכות ניהול ואפליקציות שנבנות סביב הדרך שבה העסק עובד באמת, מהזמנות ומשלוחים ועד משימות ועדכונים מול לקוחות, עם AI במקומות שבהם הוא באמת חוסך עבודה.', '#9b2226', '#f5ebe0'
    FROM "home_services" WHERE "title" = 'פיתוח ממשק' AND "text" = 'חנויות WooCommerce, חיבור למערכות שכבר עובדות אצלכם, תוספים ורכיבים שנכתבים במיוחד, כשמה שיש על המדף לא מספיק.' AND "_order" = 3
    AND NOT EXISTS (SELECT 1 FROM "home_services" WHERE "title" = 'אפליקציות ומערכות');
  UPDATE "home_services" SET "title" = 'פיתוח, API ואינטגרציות', "text" = 'חנויות WooCommerce, חיבור דרך API למערכות שכבר עובדות אצלכם, סנכרון נתונים בין מערכות, תוספים ורכיבים שנכתבים במיוחד, כשמה שיש על המדף לא מספיק.' WHERE "title" = 'פיתוח ממשק' AND "text" = 'חנויות WooCommerce, חיבור למערכות שכבר עובדות אצלכם, תוספים ורכיבים שנכתבים במיוחד, כשמה שיש על המדף לא מספיק.';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Texts only: the apps card stays (it may have been edited since).
  await db.execute(sql`
  ALTER TABLE "home" ALTER COLUMN "subtitle" SET DEFAULT 'אתרים בהתאמה אישית, מהאפיון ועד הליווי שאחרי ההשקה.';
  ALTER TABLE "home" ALTER COLUMN "about_body" SET DEFAULT 'MyMuse הוקמה ב־2010 על ידי רוית שליוינסקי, מפתחת אתרים, בעשר אצבעות ועם שפע של מקורות השראה. מאז בנינו, בשיתוף פעולה מלא עם הלקוחות, מאות אתרים: ליקבים ולמותגי יין, לחברות טכנולוגיה וביטוח, למרכזי קהילה ותרבות ולמותגי לייף־סטייל.

אנחנו מאמינות שלכל עסק יש אופי משלו, ולכן אין אצלנו אתרים מתבנית: כל לקוח מקבל יחס אישי, תשובות ישירות ואתר שנבנה סביב המטרות שלו.

ההשראה שלנו היא ההצלחה שלכם.';
  ALTER TABLE "settings" ALTER COLUMN "meta_description" SET DEFAULT 'MyMuse – סטודיו לבניית אתרים בהתאמה אישית מאז 2010: אפיון, עיצוב, פיתוח וליווי מתמשך, תחת קורת גג אחת.';
  UPDATE "home" SET "subtitle" = 'אתרים בהתאמה אישית, מהאפיון ועד הליווי שאחרי ההשקה.' WHERE "subtitle" = 'אתרים, אפליקציות ומערכות בהתאמה אישית, מהאפיון ועד הליווי שאחרי ההשקה.';
  UPDATE "home" SET "about_body" = 'MyMuse הוקמה ב־2010 על ידי רוית שליוינסקי, מפתחת אתרים, בעשר אצבעות ועם שפע של מקורות השראה. מאז בנינו, בשיתוף פעולה מלא עם הלקוחות, מאות אתרים: ליקבים ולמותגי יין, לחברות טכנולוגיה וביטוח, למרכזי קהילה ותרבות ולמותגי לייף־סטייל.

אנחנו מאמינות שלכל עסק יש אופי משלו, ולכן אין אצלנו אתרים מתבנית: כל לקוח מקבל יחס אישי, תשובות ישירות ואתר שנבנה סביב המטרות שלו.

ההשראה שלנו היא ההצלחה שלכם.' WHERE "about_body" = 'MyMuse הוקמה ב־2010 על ידי רוית שליוינסקי, מפתחת אתרים, בעשר אצבעות ועם שפע של מקורות השראה. מאז בנינו, בשיתוף פעולה מלא עם הלקוחות, מאות אתרים: ליקבים ולמותגי יין, לחברות טכנולוגיה וביטוח, למרכזי קהילה ותרבות ולמותגי לייף־סטייל. לצד האתרים אנחנו בונות גם אפליקציות ומערכות ניהול, כשהעבודה של העסק צריכה כלי משלה.

אנחנו מאמינות שלכל עסק יש אופי משלו, ולכן אין אצלנו אתרים מתבנית: כל לקוח מקבל יחס אישי, תשובות ישירות ואתר שנבנה סביב המטרות שלו.

ההשראה שלנו היא ההצלחה שלכם.';
  UPDATE "settings" SET "meta_description" = 'MyMuse – סטודיו לבניית אתרים בהתאמה אישית מאז 2010: אפיון, עיצוב, פיתוח וליווי מתמשך, תחת קורת גג אחת.' WHERE "meta_description" = 'MyMuse – סטודיו לאתרים, אפליקציות ומערכות בהתאמה אישית מאז 2010: אפיון, עיצוב, פיתוח וליווי מתמשך, תחת קורת גג אחת.';
  UPDATE "home_services" SET "title" = 'פיתוח ממשק', "text" = 'חנויות WooCommerce, חיבור למערכות שכבר עובדות אצלכם, תוספים ורכיבים שנכתבים במיוחד, כשמה שיש על המדף לא מספיק.' WHERE "title" = 'פיתוח, API ואינטגרציות' AND "text" = 'חנויות WooCommerce, חיבור דרך API למערכות שכבר עובדות אצלכם, סנכרון נתונים בין מערכות, תוספים ורכיבים שנכתבים במיוחד, כשמה שיש על המדף לא מספיק.';`)
}
