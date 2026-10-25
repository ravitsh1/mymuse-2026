import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// A different Ocean Sunset colour per project instead of amber everywhere: rotated in list order among the palette
// colours that stay visible (2:1+) on each project's background, so neighbours differ. Text that uses the accent is
// made readable at render time (accentText in lib/data). Only projects still holding the ocean_sunset_palette value change.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
  UPDATE "projects" SET "accent" = '#ca6702' WHERE "slug" = 'meteor-center' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "accent" = '#0a9396' WHERE "slug" = 'gurgroup' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "accent" = '#bb3e03' WHERE "slug" = 'helios' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#ae2012' WHERE "slug" = 'recanati' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#94d2bd' WHERE "slug" = 'samurai' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#e9d8a6' WHERE "slug" = 'benny-goren' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#ca6702' WHERE "slug" = 'margalit' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#0a9396' WHERE "slug" = 'agur' AND lower("accent") = '#f3b94d';
  UPDATE "projects" SET "accent" = '#94d2bd' WHERE "slug" = 'gordon-pool' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'firon' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "accent" = '#e9d8a6' WHERE "slug" = 'vinspiration' AND lower("accent") = '#f5c366';
  UPDATE "projects" SET "accent" = '#ca6702' WHERE "slug" = 'studio-gur' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#bb3e03' WHERE "slug" = '3-bears' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#ae2012' WHERE "slug" = 'little-fences' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#0a9396' WHERE "slug" = 'boutique77' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#94d2bd' WHERE "slug" = 'enosh' AND lower("accent") = '#f0a51a';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'moa-winery' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "accent" = '#bb3e03' WHERE "slug" = 'mosessco' AND lower("accent") = '#ae2012';
  UPDATE "projects" SET "accent" = '#ae2012' WHERE "slug" = 'jullius' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#e9d8a6' WHERE "slug" = 'winecase' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "accent" = '#ca6702' WHERE "slug" = 'teo' AND lower("accent") = '#f1af33';
  UPDATE "projects" SET "accent" = '#0a9396' WHERE "slug" = 'netofa' AND lower("accent") = '#f0a51a';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'meteor-center' AND lower("accent") = '#ca6702';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'gurgroup' AND lower("accent") = '#0a9396';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'helios' AND lower("accent") = '#bb3e03';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'recanati' AND lower("accent") = '#ae2012';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'samurai' AND lower("accent") = '#94d2bd';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'benny-goren' AND lower("accent") = '#e9d8a6';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'margalit' AND lower("accent") = '#ca6702';
  UPDATE "projects" SET "accent" = '#f3b94d' WHERE "slug" = 'agur' AND lower("accent") = '#0a9396';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'gordon-pool' AND lower("accent") = '#94d2bd';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'firon' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#f5c366' WHERE "slug" = 'vinspiration' AND lower("accent") = '#e9d8a6';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'studio-gur' AND lower("accent") = '#ca6702';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = '3-bears' AND lower("accent") = '#bb3e03';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'little-fences' AND lower("accent") = '#ae2012';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'boutique77' AND lower("accent") = '#0a9396';
  UPDATE "projects" SET "accent" = '#f0a51a' WHERE "slug" = 'enosh' AND lower("accent") = '#94d2bd';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'moa-winery' AND lower("accent") = '#ee9b00';
  UPDATE "projects" SET "accent" = '#ae2012' WHERE "slug" = 'mosessco' AND lower("accent") = '#bb3e03';
  UPDATE "projects" SET "accent" = '#ee9b00' WHERE "slug" = 'jullius' AND lower("accent") = '#ae2012';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'winecase' AND lower("accent") = '#e9d8a6';
  UPDATE "projects" SET "accent" = '#f1af33' WHERE "slug" = 'teo' AND lower("accent") = '#ca6702';
  UPDATE "projects" SET "accent" = '#f0a51a' WHERE "slug" = 'netofa' AND lower("accent") = '#0a9396';`)
}
