import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Home page copy of 2026-10-29 (Ravit): about, selected work, contact, and the default meta description.
// Each field changes only while it still holds the text it replaces, so later edits in the admin are kept.
// [table, column, old, new]
const ROWS: [string, string, string, string][] = [
  ['home', 'about_headline', 'מאז 2010 בנינו מאות אתרים, וכל אחד מהם נראה כמו העסק שמאחוריו.', 'לכל אתר יש את הדרך שלו.'],
  [
    'home',
    'about_body',
    'MyMuse הוקמה ב־2010 על ידי רוית שליוינסקי, מפתחת אתרים, בעשר אצבעות ועם שפע של מקורות השראה. מאז בנינו, בשיתוף פעולה מלא עם הלקוחות, מאות אתרים: ליקבים ולמותגי יין, לחברות טכנולוגיה וביטוח, למרכזי קהילה ותרבות ולמותגי לייף־סטייל. לצד האתרים אנחנו בונות גם אפליקציות ומערכות ניהול, כשהעבודה של העסק צריכה כלי משלה.\n\nאנחנו מאמינות שלכל עסק יש אופי משלו, ולכן אין אצלנו אתרים מתבנית: כל לקוח מקבל יחס אישי, תשובות ישירות ואתר שנבנה סביב המטרות שלו.\n\nההשראה שלנו היא ההצלחה שלכם.',
    'יש עסקים שצריכים להתחיל מאפס, אחרים רוצים לקחת אתר קיים למקום חדש, ולפעמים האתגר הוא דווקא משהו שקורה מאחורי הקלעים.\n\nב־MyMuse כל פרויקט מתחיל בהיכרות עם העסק, האנשים והצרכים שלו. משם ממשיכים לחשוב, לתכנן ולמצוא את הפתרונות שמתאימים לו, גם מבחינה עיצובית וגם מבחינה טכנולוגית.\n\nוהקשר לא חייב להסתיים כשהאתר עולה לאוויר. חלק גדול מהעשייה הוא להמשיך ללוות לקוחות לאורך השנים, כשהעסק גדל, הצרכים משתנים ועולים רעיונות חדשים.',
  ],
  ['home', 'work_title', 'עבודות נבחרות', 'כמה דברים שבנינו בדרך.'],
  [
    'home',
    'subtitle',
    'אתרים, אפליקציות ומערכות בהתאמה אישית, מהאפיון ועד הליווי שאחרי ההשקה.',
    'אתרים ופרויקטים מתחומים שונים, שלכל אחד מהם היו צרכים, אתגרים ופתרונות משלו.',
  ],
  ['home', 'contact_title', 'נדבר?', 'יש על מה לדבר?'],
  [
    'home',
    'contact_body',
    'יש לכם עסק עם אופי ורעיון לאתר, או אתר קיים שצריך לחשוב עליו מחדש? \nספרו לנו במה מדובר ונחזור אליכם.',
    'פרויקט חדש, שינוי באתר קיים או שאלה שמחפשת פתרון? בואו נתחיל משיחה.',
  ],
  [
    'settings',
    'meta_description',
    'MyMuse – סטודיו לאתרים, אפליקציות ומערכות בהתאמה אישית מאז 2010: אפיון, עיצוב, פיתוח וליווי מתמשך, תחת קורת גג אחת.',
    'MyMuse הוא סטודיו לתכנון, עיצוב ופיתוח אתרים בהתאמה אישית מאז 2010. עיצוב, פתרונות טכנולוגיים וליווי מתמשך לעסקים, מהתכנון ועד אחרי ההשקה.',
  ],
]

const run = async (db: MigrateUpArgs['db'], from: 2 | 3, to: 2 | 3) => {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "home", "settings" IN ACCESS EXCLUSIVE MODE;`)
  for (const r of ROWS)
    await db.execute(sql`UPDATE ${sql.identifier(r[0])} SET ${sql.identifier(r[1])} = ${r[to]} WHERE ${sql.identifier(r[1])} = ${r[from]}`)
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await run(db, 2, 3)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await run(db, 3, 2)
}
