import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Neon Sunset palette (Ravit's brand refresh, 2026-10-25; values from the brand book handoff). Every colour changes only
// while it still holds the exact value it had before, so anything set in the admin stays.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1')
    await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings", "home_words", "home_services", "projects" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "projects" ALTER COLUMN "ink" SET DEFAULT '#ffe8c2';
  ALTER TABLE "projects" ALTER COLUMN "accent" SET DEFAULT '#ff3d7f';
  ALTER TABLE "home_words" ALTER COLUMN "bg" SET DEFAULT '#1b1030';
  ALTER TABLE "home_words" ALTER COLUMN "accent" SET DEFAULT '#ff3d7f';
  ALTER TABLE "home_services" ALTER COLUMN "bg" SET DEFAULT '#ffe8c2';
  ALTER TABLE "home_services" ALTER COLUMN "ink" SET DEFAULT '#1b1030';
  ALTER TABLE "settings" ALTER COLUMN "bg" SET DEFAULT '#1b1030';
  ALTER TABLE "settings" ALTER COLUMN "ink" SET DEFAULT '#ffe8c2';
  ALTER TABLE "settings" ALTER COLUMN "accent" SET DEFAULT '#ff3d7f';`)
  await db.execute(sql`
  -- site colours
  UPDATE "settings" SET "bg" = '#1b1030' WHERE lower("bg") = '#001219';
  UPDATE "settings" SET "ink" = '#ffe8c2' WHERE lower("ink") = '#f5ebe0';
  UPDATE "settings" SET "accent" = '#ff3d7f' WHERE lower("accent") = '#ee9b00';
  -- Passion words (light text stays on every background: 4.5:1 or better against #ffe8c2)
  UPDATE "home_words" SET "bg" = '#1b1030', "accent" = '#ff3d7f' WHERE "word" = 'Expertise' AND lower("bg") = '#001219' AND lower("accent") = '#f5ebe0';
  UPDATE "home_words" SET "bg" = '#235c68', "accent" = '#ffe8c2' WHERE "word" = 'Culture' AND lower("bg") = '#005f73' AND lower("accent") = '#e9d8a6';
  UPDATE "home_words" SET "bg" = '#a42b5f', "accent" = '#ff9f1c' WHERE "word" = 'Flavor' AND lower("bg") = '#9b2226' AND lower("accent") = '#ee9b00';
  UPDATE "home_words" SET "bg" = '#7b2351', "accent" = '#ff9f1c' WHERE "word" = 'Lifestyle' AND lower("bg") = '#bb3e03' AND lower("accent") = '#ca6702';
  -- service cards (each sets its own text colour)
  UPDATE "home_services" SET "bg" = '#ffe8c2', "ink" = '#1b1030' WHERE "title" = 'אפיון' AND lower("bg") = '#e9d8a6' AND lower("ink") = '#001219';
  UPDATE "home_services" SET "bg" = '#2ec4b6', "ink" = '#1b1030' WHERE "title" = 'הקמת האתר' AND lower("bg") = '#0a9396' AND lower("ink") = '#001219';
  UPDATE "home_services" SET "bg" = '#ff9f1c', "ink" = '#1b1030' WHERE "title" = 'פיתוח, API ואינטגרציות' AND lower("bg") = '#bb3e03' AND lower("ink") = '#f5ebe0';
  UPDATE "home_services" SET "bg" = '#a42b5f', "ink" = '#ffe8c2' WHERE "title" = 'אפליקציות ומערכות' AND lower("bg") = '#9b2226' AND lower("ink") = '#f5ebe0';
  UPDATE "home_services" SET "bg" = '#235c68', "ink" = '#ffe8c2' WHERE "title" = 'ליווי מתמשך' AND lower("bg") = '#005f73' AND lower("ink") = '#f5ebe0';
  -- projects: each palette accent to its Neon counterpart (magenta #a42b5f on a light background; a lighter step where
  -- needed for 3:1 against the project background), light text to #ffe8c2. The apps keep their own brand accents.
  UPDATE "projects" SET "accent" = '#ff9f1c' WHERE "slug" = 'meteor-center' AND lower("accent") = '#ca6702';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'meteor-center' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#2ec4b6' WHERE "slug" = 'gurgroup' AND lower("accent") = '#0a9396';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'gurgroup' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff73a3' WHERE "slug" = 'helios' AND lower("accent") = '#bb3e03';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'helios' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#d1346f' WHERE "slug" = 'recanati' AND lower("accent") = '#ae2012';
  UPDATE "projects" SET "accent" = '#69d5ca' WHERE "slug" = 'samurai' AND lower("accent") = '#94d2bd';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'samurai' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff3d7f' WHERE "slug" = 'barantech' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'barantech' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ffe8c2' WHERE "slug" = 'benny-goren' AND lower("accent") = '#e9d8a6';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'benny-goren' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff9f1c' WHERE "slug" = 'margalit' AND lower("accent") = '#ca6702';
  UPDATE "projects" SET "accent" = '#2ec4b6' WHERE "slug" = 'agur' AND lower("accent") = '#0a9396';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'agur' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#69d5ca' WHERE "slug" = 'gordon-pool' AND lower("accent") = '#94d2bd';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'gordon-pool' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff73a3' WHERE "slug" = 'firon' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'firon' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ffe8c2' WHERE "slug" = 'vinspiration' AND lower("accent") = '#e9d8a6';
  UPDATE "projects" SET "accent" = '#ff9f1c' WHERE "slug" = 'studio-gur' AND lower("accent") = '#ca6702';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'studio-gur' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#69d5ca' WHERE "slug" = '3-bears' AND lower("accent") = '#94d2bd';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = '3-bears' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#d1346f' WHERE "slug" = 'little-fences' AND lower("accent") = '#ae2012';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'little-fences' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#2ec4b6' WHERE "slug" = 'boutique77' AND lower("accent") = '#0a9396';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'boutique77' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "bg" = '#1b1030' WHERE "slug" = 'boutique77' AND lower("bg") = '#001219';
  UPDATE "projects" SET "accent" = '#69d5ca' WHERE "slug" = 'enosh' AND lower("accent") = '#94d2bd';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'enosh' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff9ebf' WHERE "slug" = 'moa-winery' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'moa-winery' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#a42b5f' WHERE "slug" = 'mosessco' AND lower("accent") = '#bb3e03';
  UPDATE "projects" SET "accent" = '#d1346f' WHERE "slug" = 'jullius' AND lower("accent") = '#ae2012';
  UPDATE "projects" SET "accent" = '#ffe8c2' WHERE "slug" = 'winecase' AND lower("accent") = '#e9d8a6';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'winecase' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#ff9f1c' WHERE "slug" = 'teo' AND lower("accent") = '#ca6702';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'teo' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#2ec4b6' WHERE "slug" = 'netofa' AND lower("accent") = '#0a9396';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'netofa' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "accent" = '#d1346f' WHERE "slug" = 'our-kitchen' AND lower("accent") = '#ae2012';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'our-kitchen' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'mybase' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'delivery-app' AND lower("ink") = '#f5ebe0';
  UPDATE "projects" SET "ink" = '#ffe8c2' WHERE "slug" = 'client-portal' AND lower("ink") = '#f5ebe0';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
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
  UPDATE "settings" SET "bg" = '#001219' WHERE lower("bg") = '#1b1030';
  UPDATE "settings" SET "ink" = '#f5ebe0' WHERE lower("ink") = '#ffe8c2';
  UPDATE "settings" SET "accent" = '#ee9b00' WHERE lower("accent") = '#ff3d7f';
  UPDATE "home_words" SET "bg" = '#001219', "accent" = '#f5ebe0' WHERE "word" = 'Expertise' AND lower("bg") = '#1b1030' AND lower("accent") = '#ff3d7f';
  UPDATE "home_words" SET "bg" = '#005f73', "accent" = '#e9d8a6' WHERE "word" = 'Culture' AND lower("bg") = '#235c68' AND lower("accent") = '#ffe8c2';
  UPDATE "home_words" SET "bg" = '#9b2226', "accent" = '#ee9b00' WHERE "word" = 'Flavor' AND lower("bg") = '#a42b5f' AND lower("accent") = '#ff9f1c';
  UPDATE "home_words" SET "bg" = '#bb3e03', "accent" = '#ca6702' WHERE "word" = 'Lifestyle' AND lower("bg") = '#7b2351' AND lower("accent") = '#ff9f1c';
  UPDATE "home_services" SET "bg" = '#e9d8a6', "ink" = '#001219' WHERE "title" = 'אפיון' AND lower("bg") = '#ffe8c2' AND lower("ink") = '#1b1030';
  UPDATE "home_services" SET "bg" = '#0a9396', "ink" = '#001219' WHERE "title" = 'הקמת האתר' AND lower("bg") = '#2ec4b6' AND lower("ink") = '#1b1030';
  UPDATE "home_services" SET "bg" = '#bb3e03', "ink" = '#f5ebe0' WHERE "title" = 'פיתוח, API ואינטגרציות' AND lower("bg") = '#ff9f1c' AND lower("ink") = '#1b1030';
  UPDATE "home_services" SET "bg" = '#9b2226', "ink" = '#f5ebe0' WHERE "title" = 'אפליקציות ומערכות' AND lower("bg") = '#a42b5f' AND lower("ink") = '#ffe8c2';
  UPDATE "home_services" SET "bg" = '#005f73', "ink" = '#f5ebe0' WHERE "title" = 'ליווי מתמשך' AND lower("bg") = '#235c68' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#ca6702' WHERE "slug" = 'meteor-center' AND lower("accent") = '#ff9f1c';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'meteor-center' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#0a9396' WHERE "slug" = 'gurgroup' AND lower("accent") = '#2ec4b6';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'gurgroup' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#bb3e03' WHERE "slug" = 'helios' AND lower("accent") = '#ff73a3';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'helios' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#ae2012' WHERE "slug" = 'recanati' AND lower("accent") = '#d1346f';
  UPDATE "projects" SET "accent" = '#94d2bd' WHERE "slug" = 'samurai' AND lower("accent") = '#69d5ca';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'samurai' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'barantech' AND lower("accent") = '#ff3d7f';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'barantech' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#e9d8a6' WHERE "slug" = 'benny-goren' AND lower("accent") = '#ffe8c2';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'benny-goren' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#ca6702' WHERE "slug" = 'margalit' AND lower("accent") = '#ff9f1c';
  UPDATE "projects" SET "accent" = '#0a9396' WHERE "slug" = 'agur' AND lower("accent") = '#2ec4b6';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'agur' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#94d2bd' WHERE "slug" = 'gordon-pool' AND lower("accent") = '#69d5ca';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'gordon-pool' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'firon' AND lower("accent") = '#ff73a3';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'firon' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#e9d8a6' WHERE "slug" = 'vinspiration' AND lower("accent") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#ca6702' WHERE "slug" = 'studio-gur' AND lower("accent") = '#ff9f1c';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'studio-gur' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#94d2bd' WHERE "slug" = '3-bears' AND lower("accent") = '#69d5ca';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = '3-bears' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#ae2012' WHERE "slug" = 'little-fences' AND lower("accent") = '#d1346f';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'little-fences' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#0a9396' WHERE "slug" = 'boutique77' AND lower("accent") = '#2ec4b6';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'boutique77' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "bg" = '#001219' WHERE "slug" = 'boutique77' AND lower("bg") = '#1b1030';
  UPDATE "projects" SET "accent" = '#94d2bd' WHERE "slug" = 'enosh' AND lower("accent") = '#69d5ca';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'enosh' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'moa-winery' AND lower("accent") = '#ff9ebf';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'moa-winery' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#bb3e03' WHERE "slug" = 'mosessco' AND lower("accent") = '#a42b5f';
  UPDATE "projects" SET "accent" = '#ae2012' WHERE "slug" = 'jullius' AND lower("accent") = '#d1346f';
  UPDATE "projects" SET "accent" = '#e9d8a6' WHERE "slug" = 'winecase' AND lower("accent") = '#ffe8c2';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'winecase' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#ca6702' WHERE "slug" = 'teo' AND lower("accent") = '#ff9f1c';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'teo' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#0a9396' WHERE "slug" = 'netofa' AND lower("accent") = '#2ec4b6';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'netofa' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "accent" = '#ae2012' WHERE "slug" = 'our-kitchen' AND lower("accent") = '#d1346f';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'our-kitchen' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'mybase' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'delivery-app' AND lower("ink") = '#ffe8c2';
  UPDATE "projects" SET "ink" = '#f5ebe0' WHERE "slug" = 'client-portal' AND lower("ink") = '#ffe8c2';`)
}
