import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "settings" IN ACCESS EXCLUSIVE MODE;`)
  await db.execute(sql`
   ALTER TABLE "settings" ADD COLUMN "show_trials" boolean DEFAULT false;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings" DROP COLUMN "show_trials";`)
}
