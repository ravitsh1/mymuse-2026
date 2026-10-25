import path from 'path'
import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

// New project: ourkitchen.co.il, the Shalivinsky family recipe site. Images follow Ravit's rule (see the skill): a main
// mockup in the project's own brand language (media-import/mockup/mockup-ourkitchen.html) and two landscape screens.
// Created once; skipped if the slug already exists. Same Blob-token guard as the other media imports.
const DIR = path.resolve(process.cwd(), 'media-import/ourkitchen')

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const exists = await payload.find({ collection: 'projects', where: { slug: { equals: 'our-kitchen' } }, limit: 1, depth: 0, req })
  if (exists.docs.length) return payload.logger.info('ourkitchen: project already exists')

  if (process.env.LOCAL_PGLITE !== '1' && !process.env.BLOB_READ_WRITE_TOKEN)
    throw new Error('ourkitchen: BLOB_READ_WRITE_TOKEN is not set, refusing to store media on local disk')

  const add = async (file: string, alt: string) =>
    (await payload.create({ collection: 'media', data: { alt }, filePath: path.join(DIR, file), req })).id

  const hero = await add('ourkitchen-01-mockup.jpg', 'האתר "מהמטבח שלנו" על מסך לפטופ ועל טלפון, לצד תמונות משפחתיות')
  const g1 = await add('ourkitchen-02-album.jpg', 'האלבום המשפחתי באתר: תמונות מהמטבח בסגנון פולארויד')
  const g2 = await add('ourkitchen-03-recipes.jpg', 'עמוד כל המתכונים, עם סינון לפי קטגוריה וחיפוש')

  const cat = await payload.find({ collection: 'categories', where: { title: { equals: 'יין ואוכל' } }, limit: 1, depth: 0, req })

  await payload.create({
    collection: 'projects',
    req,
    data: {
      title: 'המטבח שלנו',
      slug: 'our-kitchen',
      nameEn: 'OUR KITCHEN',
      field: 'אתר מתכונים',
      scope: 'עיצוב ובניית אתר מתכונים',
      platform: 'WordPress',
      lead: 'אתר המתכונים של משפחת שליוינסקי: כל המתכונים שעוברים אצלנו מיד ליד, מהעוגה של יום שישי ועד הלחם של הבוקר, במקום אחד. כ־120 מתכונים בארבע קטגוריות, עוגות, מאפים, אוכל וכל מיני, עם חיפוש, סינון ואלבום משפחתי שמחזיר את הטעמים לאנשים שמאחוריהם.',
      statement: 'מתכונים שעוברים *מיד ליד*.',
      siteUrl: 'https://ourkitchen.co.il/',
      featured: true,
      hidden: false,
      category: cat.docs[0]?.id,
      hero,
      gallery: [g1, g2],
      bg: '#2b2622',
      ink: '#f5ebe0',
      accent: '#ae2012',
    },
  })
  payload.logger.info('ourkitchen: project created')
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.delete({ collection: 'projects', where: { slug: { equals: 'our-kitchen' } }, req })
}
