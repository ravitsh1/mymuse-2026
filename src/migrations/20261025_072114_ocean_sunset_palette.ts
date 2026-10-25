import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Ocean Sunset palette (Ravit's choice, light text #f5ebe0). Every colour changes only while it still holds the exact
// value it had before, so anything set in the admin stays.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1')
    await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings", "home_words", "home_services", "projects" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "projects" ALTER COLUMN "ink" SET DEFAULT '#f5ebe0';
  ALTER TABLE "projects" ALTER COLUMN "accent" SET DEFAULT '#ee9b00';
  ALTER TABLE "home_words" ALTER COLUMN "bg" SET DEFAULT '#001219';
  ALTER TABLE "home_words" ALTER COLUMN "accent" SET DEFAULT '#ee9b00';
  ALTER TABLE "home_services" ALTER COLUMN "bg" SET DEFAULT '#e9d8a6';
  ALTER TABLE "home_services" ALTER COLUMN "ink" SET DEFAULT '#001219';
  ALTER TABLE "settings" ALTER COLUMN "bg" SET DEFAULT '#001219';
  ALTER TABLE "settings" ALTER COLUMN "ink" SET DEFAULT '#f5ebe0';
  ALTER TABLE "settings" ALTER COLUMN "accent" SET DEFAULT '#ee9b00';`)
  await db.execute(sql`
  -- site colours
  UPDATE "settings" SET "bg" = '#001219' WHERE lower("bg") = '#111517';
  UPDATE "settings" SET "ink" = '#f5ebe0' WHERE lower("ink") = '#ffffff';
  UPDATE "settings" SET "accent" = '#ee9b00' WHERE lower("accent") = '#ff7777';
  -- Passion words (colours behind each word and its &)
  UPDATE "home_words" SET "bg" = '#001219', "accent" = '#ee9b00' WHERE "word" = 'Expertise' AND lower("bg") = '#16141a' AND lower("accent") = '#ff7777';
  UPDATE "home_words" SET "bg" = '#005f73', "accent" = '#e9d8a6' WHERE "word" = 'Culture' AND lower("bg") = '#14243a' AND lower("accent") = '#ff7777';
  UPDATE "home_words" SET "bg" = '#9b2226', "accent" = '#ee9b00' WHERE "word" = 'Flavor' AND lower("bg") = '#3a0f1c' AND lower("accent") = '#ff7777';
  UPDATE "home_words" SET "bg" = '#bb3e03', "accent" = '#e9d8a6' WHERE "word" = 'Lifestyle' AND lower("bg") = '#26331d' AND lower("accent") = '#ff7777';
  -- service cards
  UPDATE "home_services" SET "bg" = '#e9d8a6', "ink" = '#001219' WHERE "title" = 'אפיון' AND lower("bg") = '#f6f6f6' AND lower("ink") = '#111517';
  UPDATE "home_services" SET "bg" = '#0a9396', "ink" = '#001219' WHERE "title" = 'הקמת האתר' AND lower("bg") = '#ff7777' AND lower("ink") = '#111517';
  UPDATE "home_services" SET "bg" = '#bb3e03', "ink" = '#f5ebe0' WHERE "title" = 'פיתוח ממשק' AND lower("bg") = '#32323a' AND lower("ink") = '#ffffff';
  UPDATE "home_services" SET "bg" = '#005f73', "ink" = '#f5ebe0' WHERE "title" = 'ליווי מתמשך' AND lower("bg") = '#a54d4d' AND lower("ink") = '#ffffff';
  -- projects: accent from the brand pink to amber (lightened, or a darker palette colour on a light background, for 4.5:1); light text to #f5ebe0
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'meteor-center' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'meteor-center' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'gurgroup' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'gurgroup' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'helios' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'helios' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'recanati' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'samurai' AND lower("accent") = '#ff8585';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'samurai' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'barantech' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'barantech' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'benny-goren' AND lower("accent") = '#ff9292';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'benny-goren' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'margalit' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "accent" = '#f3b94d' WHERE "slug" = 'agur' AND lower("accent") = '#ffadad';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'agur' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'gordon-pool' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'gordon-pool' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'firon' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'firon' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#f5c366' WHERE "slug" = 'vinspiration' AND lower("accent") = '#ffbbbb';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'studio-gur' AND lower("accent") = '#ff9292';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'studio-gur' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = '3-bears' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = '3-bears' AND lower("ink") = '#ffffff';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'little-fences' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'little-fences' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'boutique77' AND lower("accent") = '#ff8585';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'boutique77' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#f0a51a' WHERE "slug" = 'enosh' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'enosh' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'moa-winery' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'moa-winery' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#ae2012' WHERE "slug" = 'mosessco' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'jullius' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'winecase' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'winecase' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'teo' AND lower("accent") = '#ffadad';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'teo' AND lower("ink") = '#efe8de';
  UPDATE "projects" SET "accent" = '#f0a51a' WHERE "slug" = 'netofa' AND lower("accent") = '#ff9292';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'netofa' AND lower("ink") = '#efe8de';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ALTER COLUMN "ink" SET DEFAULT '#efe8de';
  ALTER TABLE "projects" ALTER COLUMN "accent" SET DEFAULT '#ff7777';
  ALTER TABLE "home_words" ALTER COLUMN "bg" SET DEFAULT '#16141a';
  ALTER TABLE "home_words" ALTER COLUMN "accent" SET DEFAULT '#d6a05b';
  ALTER TABLE "home_services" ALTER COLUMN "bg" SET DEFAULT '#efe8de';
  ALTER TABLE "home_services" ALTER COLUMN "ink" SET DEFAULT '#16141a';
  ALTER TABLE "settings" ALTER COLUMN "bg" SET DEFAULT '#111517';
  ALTER TABLE "settings" ALTER COLUMN "ink" SET DEFAULT '#ffffff';
  ALTER TABLE "settings" ALTER COLUMN "accent" SET DEFAULT '#ff7777';`)
  await db.execute(sql`
  UPDATE "settings" SET "bg" = '#111517' WHERE lower("bg") = '#001219';
  UPDATE "settings" SET "ink" = '#ffffff' WHERE lower("ink") = '#f5ebe0';
  UPDATE "settings" SET "accent" = '#ff7777' WHERE lower("accent") = '#ee9b00';
  UPDATE "home_words" SET "bg" = '#16141a', "accent" = '#ff7777' WHERE "word" = 'Expertise' AND lower("bg") = '#001219' AND lower("accent") = '#ee9b00';
  UPDATE "home_words" SET "bg" = '#14243a', "accent" = '#ff7777' WHERE "word" = 'Culture' AND lower("bg") = '#005f73' AND lower("accent") = '#e9d8a6';
  UPDATE "home_words" SET "bg" = '#3a0f1c', "accent" = '#ff7777' WHERE "word" = 'Flavor' AND lower("bg") = '#9b2226' AND lower("accent") = '#ee9b00';
  UPDATE "home_words" SET "bg" = '#26331d', "accent" = '#ff7777' WHERE "word" = 'Lifestyle' AND lower("bg") = '#bb3e03' AND lower("accent") = '#e9d8a6';
  UPDATE "home_services" SET "bg" = '#f6f6f6', "ink" = '#111517' WHERE "title" = 'אפיון' AND lower("bg") = '#e9d8a6' AND lower("ink") = '#001219';
  UPDATE "home_services" SET "bg" = '#ff7777', "ink" = '#111517' WHERE "title" = 'הקמת האתר' AND lower("bg") = '#0a9396' AND lower("ink") = '#001219';
  UPDATE "home_services" SET "bg" = '#32323a', "ink" = '#ffffff' WHERE "title" = 'פיתוח ממשק' AND lower("bg") = '#bb3e03' AND lower("ink") = '#f5ebe0';
  UPDATE "home_services" SET "bg" = '#a54d4d', "ink" = '#ffffff' WHERE "title" = 'ליווי מתמשך' AND lower("bg") = '#005f73' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'meteor-center' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'meteor-center' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'gurgroup' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'gurgroup' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'helios' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'helios' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'recanati' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#ff8585' WHERE "slug" = 'samurai' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'samurai' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'barantech' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'barantech' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff9292' WHERE "slug" = 'benny-goren' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'benny-goren' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'margalit' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#ffadad' WHERE "slug" = 'agur' AND lower("accent") = '#f3b94d';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'agur' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'gordon-pool' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'gordon-pool' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'firon' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'firon' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ffbbbb' WHERE "slug" = 'vinspiration' AND lower("accent") = '#f5c366';
  UPDATE "projects" SET "accent" = '#ff9292' WHERE "slug" = 'studio-gur' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'studio-gur' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = '3-bears' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "ink" = '#ffffff' WHERE "slug" = '3-bears' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'little-fences' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'little-fences' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff8585' WHERE "slug" = 'boutique77' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'boutique77' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'enosh' AND lower("accent") = '#f0a51a';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'enosh' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'moa-winery' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'moa-winery' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'mosessco' AND lower("accent") = '#ae2012';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'jullius' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'winecase' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'winecase' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ffadad' WHERE "slug" = 'teo' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'teo' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff9292' WHERE "slug" = 'netofa' AND lower("accent") = '#f0a51a';
  UPDATE "projects" SET "ink" = '#efe8de' WHERE "slug" = 'netofa' AND lower("ink") = '#f5ebe0';`)
}
