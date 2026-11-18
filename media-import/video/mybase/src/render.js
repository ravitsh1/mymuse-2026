// node render.js <main|loop|stills> — captures frames of index.html at 1920x1080, 30fps
const { chromium } = require('playwright')
const path = require('path')
const mode = process.argv[2] || 'main'
;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })
  await page.goto('file://' + path.join(__dirname, 'index.html'))
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode())).then(() => document.fonts.ready))
  const shot = (file) => page.screenshot({ path: path.join(__dirname, file), type: 'png' })
  if (mode === 'stills') {
    for (const t of process.argv.slice(3).map(Number)) {
      await page.evaluate((t) => window.render(t), t)
      await shot(`still-${t}.png`)
    }
  } else {
    const dur = mode === 'loop' ? 7 : 28, fn = mode === 'loop' ? 'renderLoop' : 'render', dir = mode === 'loop' ? 'loop' : 'frames'
    for (let f = 0; f < dur * 30; f++) {
      await page.evaluate(([fn, t]) => window[fn](t), [fn, f / 30])
      await shot(`${dir}/${String(f).padStart(4, '0')}.png`)
    }
  }
  await browser.close()
})()
