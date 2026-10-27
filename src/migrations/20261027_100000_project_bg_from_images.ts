import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Ravit (2026-10-27): each project's background matches the brand-colour band at the bottom of its hero images, so
// the title area and the page read as one colour (as Samurai already did). Colours were sampled from the mobile
// heroes. On the bright ones the text turns dark; Studio Gur's red needs black and Firon's blue a warm white to keep
// 4.5:1. Each row changes only while the project still holds its current colours.
// [slug, old bg, new bg, old ink, new ink]
const ROWS: [string, string, string, string, string][] = [
  ["client-portal","#15171a","#16171b","#ffe8c2","#ffe8c2"],
  ["delivery-app","#3d353b","#5a5058","#ffe8c2","#ffe8c2"],
  ["mybase","#1f3d2c","#2c5a3e","#ffe8c2","#ffe8c2"],
  ["netofa","#4b4236","#141f23","#ffe8c2","#ffe8c2"],
  ["teo","#454c55","#ecba61","#ffe8c2","#1b1030"],
  ["winecase","#683c37","#19423e","#ffe8c2","#ffe8c2"],
  ["jullius","#1b2a24","#1d1d1b","#e9dcc0","#e9dcc0"],
  ["mosessco","#e6e3dc","#f7dd00","#1d1c1a","#1d1c1a"],
  ["moa-winery","#5c544b","#722326","#ffe8c2","#ffe8c2"],
  ["enosh","#344951","#ffc732","#ffe8c2","#1b1030"],
  ["boutique77","#1b1030","#111111","#ffe8c2","#ffe8c2"],
  ["little-fences","#16141a","#ae2012","#ffe8c2","#ffe8c2"],
  ["3-bears","#000000","#111111","#ffe8c2","#ffe8c2"],
  ["studio-gur","#583a26","#ed1b24","#ffe8c2","#000000"],
  ["vinspiration","#4b5a2a","#0e0700","#f1efe2","#f1efe2"],
  ["firon","#314a61","#1d74c4","#ffe8c2","#fff7ea"],
  ["gordon-pool","#0d4f67","#f6c214","#ffe8c2","#1b1030"],
  ["agur","#634732","#7c1b0b","#ffe8c2","#ffe8c2"],
  ["margalit","#3a0f1c","#2b1d14","#f3e6e0","#f3e6e0"],
  ["benny-goren","#433e43","#263554","#ffe8c2","#ffe8c2"],
  ["barantech","#242151","#2fb3b8","#ffe8c2","#1b1030"],
  ["samurai","#333e57","#2f3c4c","#ffe8c2","#ffe8c2"],
  ["recanati","#0f2a3a","#0b0b0b","#e7eef0","#e7eef0"],
  ["helios","#242013","#1e2a1e","#ffe8c2","#ffe8c2"],
  ["gurgroup","#3c4b49","#099396","#ffe8c2","#1b1030"],
  ["meteor-center","#554645","#ca6702","#ffe8c2","#1b1030"],
]

const run = async (db: MigrateUpArgs['db'], from: 1 | 2, to: 1 | 2) => {
  // Production tables hold data: wait for the lock instead of failing mid-deploy (PGlite has no lock_timeout).
  if (process.env.LOCAL_PGLITE !== '1') await db.execute(sql`SET LOCAL lock_timeout='30s'; LOCK TABLE "projects" IN ACCESS EXCLUSIVE MODE;`)
  for (const r of ROWS) {
    const [bgFrom, bgTo, inkFrom, inkTo] = [r[from], r[to], r[from + 2], r[to + 2]]
    await db.execute(sql`UPDATE "projects" SET "bg" = ${bgTo}, "ink" = ${inkTo}
      WHERE "slug" = ${r[0]} AND lower("bg") = ${bgFrom} AND lower("ink") = ${inkFrom}`)
  }
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await run(db, 1, 2)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await run(db, 2, 1)
}
