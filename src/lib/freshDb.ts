import { sql, type MigrateUpArgs } from '@payloadcms/db-postgres'

// Guard for the project data migrations that go through the Payload API (payload.find / update / create).
// Payload selects every table and column of the *current* config, so on a database that is being built from
// scratch such a migration fails as soon as a later schema migration adds anything to the collection it reads
// ("relation projects_texts does not exist"). A database with no projects at all has no project content to fix
// or extend (the real projects started from the WordPress import), so these migrations skip themselves there;
// local projects come from `npm run seed`.
// Raw SQL on a table of the initial migration, so the check is valid at any point of the chain.
// Production always has projects (and has these migrations recorded as done), so nothing changes there.
export async function isFreshDatabase({ db, payload }: Pick<MigrateUpArgs, 'db' | 'payload'>, name: string): Promise<boolean> {
  const res = (await db.execute(sql`SELECT EXISTS (SELECT 1 FROM "projects") AS "any"`)) as unknown as { rows: { any: boolean }[] }
  const fresh = !res.rows[0]?.any
  if (fresh) payload.logger.info(`${name}: no projects in this database, nothing to migrate`)
  return fresh
}
