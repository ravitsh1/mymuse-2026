import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Project accent: the old yellow (#d6a05b, and the lighter shades of it the import made for contrast) becomes the
// brand pink-red #ff7777, lightened per project only as far as 4.5:1 on its background needs (the accent is also
// used for small text). Only projects still holding that exact yellow change.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "projects" ALTER COLUMN "accent" SET DEFAULT '#ff7777';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'meteor-center' AND lower("accent") = '#deb37c';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'gurgroup' AND lower("accent") = '#deb37c';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'helios' AND lower("accent") = '#d6a05b';
  UPDATE "projects" SET "accent" = '#ff8585' WHERE "slug" = 'samurai' AND lower("accent") = '#d6a05b';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'barantech' AND lower("accent") = '#d6a05b';
  UPDATE "projects" SET "accent" = '#ff9292' WHERE "slug" = 'benny-goren' AND lower("accent") = '#d6a05b';
  UPDATE "projects" SET "accent" = '#ffadad' WHERE "slug" = 'agur' AND lower("accent") = '#e2bd8c';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'gordon-pool' AND lower("accent") = '#deb37c';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'firon' AND lower("accent") = '#deb37c';
  UPDATE "projects" SET "accent" = '#ff9292' WHERE "slug" = 'studio-gur' AND lower("accent") = '#daaa6b';
  UPDATE "projects" SET "accent" = '#ff7777' WHERE "slug" = 'little-fences' AND lower("accent") = '#d6a05b';
  UPDATE "projects" SET "accent" = '#ff8585' WHERE "slug" = 'boutique77' AND lower("accent") = '#d6a05b';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'enosh' AND lower("accent") = '#deb37c';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'moa-winery' AND lower("accent") = '#deb37c';
  UPDATE "projects" SET "accent" = '#ffa0a0' WHERE "slug" = 'winecase' AND lower("accent") = '#deb37c';
  UPDATE "projects" SET "accent" = '#ffadad' WHERE "slug" = 'teo' AND lower("accent") = '#e2bd8c';
  UPDATE "projects" SET "accent" = '#ff9292' WHERE "slug" = 'netofa' AND lower("accent") = '#daaa6b';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ALTER COLUMN "accent" SET DEFAULT '#d6a05b';
  UPDATE "projects" SET "accent" = '#deb37c' WHERE "slug" = 'meteor-center' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "accent" = '#deb37c' WHERE "slug" = 'gurgroup' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "accent" = '#d6a05b' WHERE "slug" = 'helios' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "accent" = '#d6a05b' WHERE "slug" = 'samurai' AND lower("accent") = '#ff8585';
  UPDATE "projects" SET "accent" = '#d6a05b' WHERE "slug" = 'barantech' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "accent" = '#d6a05b' WHERE "slug" = 'benny-goren' AND lower("accent") = '#ff9292';
  UPDATE "projects" SET "accent" = '#e2bd8c' WHERE "slug" = 'agur' AND lower("accent") = '#ffadad';
  UPDATE "projects" SET "accent" = '#deb37c' WHERE "slug" = 'gordon-pool' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "accent" = '#deb37c' WHERE "slug" = 'firon' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "accent" = '#daaa6b' WHERE "slug" = 'studio-gur' AND lower("accent") = '#ff9292';
  UPDATE "projects" SET "accent" = '#d6a05b' WHERE "slug" = 'little-fences' AND lower("accent") = '#ff7777';
  UPDATE "projects" SET "accent" = '#d6a05b' WHERE "slug" = 'boutique77' AND lower("accent") = '#ff8585';
  UPDATE "projects" SET "accent" = '#deb37c' WHERE "slug" = 'enosh' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "accent" = '#deb37c' WHERE "slug" = 'moa-winery' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "accent" = '#deb37c' WHERE "slug" = 'winecase' AND lower("accent") = '#ffa0a0';
  UPDATE "projects" SET "accent" = '#e2bd8c' WHERE "slug" = 'teo' AND lower("accent") = '#ffadad';
  UPDATE "projects" SET "accent" = '#daaa6b' WHERE "slug" = 'netofa' AND lower("accent") = '#ff9292';`)
}
