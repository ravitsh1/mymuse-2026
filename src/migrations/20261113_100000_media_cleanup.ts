import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

// Media library cleanup (2026-11-13, approved by Ravit: "תמחקי את כולן"): the 414 files nothing on the site uses
// (old-site imports and design trials). Deleted through Payload so the files are removed from Blob storage too.
// Guard: any of these that is referenced again by a foreign key from a content table (not versions or locks) is kept.
const IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
  61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
  81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 101, 102, 103, 104, 105,
  106, 107, 110, 111, 112, 113, 114, 116, 117, 118, 121, 122, 123, 124, 125, 126, 127, 130, 131, 132,
  133, 136, 139, 140, 141, 142, 145, 146, 147, 148, 151, 154, 155, 156, 157, 160, 161, 162, 163, 166,
  167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 181, 184, 187, 188, 189, 190, 191, 192,
  193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212,
  213, 214, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234,
  235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 250, 251, 252, 253, 254, 255, 260,
  261, 262, 263, 268, 269, 270, 271, 274, 278, 279, 284, 285, 288, 289, 292, 293, 294, 295, 296, 297,
  298, 299, 301, 303, 304, 305, 308, 310, 315, 319, 320, 322, 325, 326, 327, 328, 329, 330, 331, 332,
  333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352,
  353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 369, 370, 371, 372, 373,
  374, 375, 376, 377, 379, 380, 381, 382, 383, 384, 385, 386, 387, 391, 392, 396, 397, 398, 399, 400,
  401, 402, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422,
  423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 437, 438, 439, 440, 443, 444, 445, 446,
  447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 459, 461, 471, 479, 480, 484, 485, 486, 487, 488,
  489, 490, 491, 492, 493, 496, 499, 502, 506, 507, 512, 513, 516, 517, 518, 519, 521, 522, 525, 526,
  527, 528, 532, 534, 538, 540, 541, 546, 551, 555, 557, 558, 559, 560,
]

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const refs = (await db.execute(sql`
    SELECT c.conrelid::regclass::text AS t, a.attname AS col
    FROM pg_constraint c JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
    WHERE c.contype = 'f' AND c.confrelid = 'media'::regclass`)) as unknown as { rows: { t: string; col: string }[] }
  const inUse = new Set<number>()
  for (const { t, col } of refs.rows) {
    const table = t.replace(/"/g, "")
    if (table.startsWith("_") || table.startsWith("payload_")) continue
    const r = (await db.execute(sql.raw(`SELECT DISTINCT "${col}" AS id FROM "${table}" WHERE "${col}" IS NOT NULL`))) as unknown as { rows: { id: number }[] }
    for (const { id } of r.rows) inUse.add(Number(id))
  }
  const ids = IDS.filter((id) => !inUse.has(id))
  if (ids.length < IDS.length) payload.logger.info(`media cleanup: keeping ${IDS.length - ids.length} files that are in use`)
  let n = 0
  for (const id of ids) {
    const res = await payload.delete({ collection: "media", where: { id: { equals: id } }, req, overrideAccess: true })
    n += res.docs.length
  }
  payload.logger.info(`media cleanup: deleted ${n} files`)
}

export async function down(_: MigrateDownArgs): Promise<void> {
  // the files are gone from storage; nothing to restore
}
