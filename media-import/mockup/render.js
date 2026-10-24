// Device mockup: put laptop.jpg (16:9 desktop shot) and phone.jpg (mobile shot) next to mockup.html, then `node media-import/mockup/render.js` writes mockup.jpg (2400x1350). Colours in mockup.html follow the project palette.
const { chromium } = require('playwright')
const sharp = require('sharp')
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 2 })
  await p.goto('file://' + __dirname + '/mockup.html'); await p.waitForTimeout(500)
  await sharp(await p.screenshot()).jpeg({ quality: 88, mozjpeg: true }).toFile(__dirname + '/mockup.jpg')
  console.log((await sharp(__dirname + '/mockup.jpg').metadata()).width)
  await b.close()
})()
