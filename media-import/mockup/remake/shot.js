// node shot.js <slug> <outname> <url> [y] [mobile]  → one extra screenshot with capture.js' prep
const { chromium } = require('playwright')
const src = require('fs').readFileSync(__dirname + '/capture.js', 'utf8')
eval(src.slice(src.indexOf('const HIDE'), src.indexOf(';(async () => {')))
const [slug, name, url, y = '0', mob] = process.argv.slice(2)
;(async () => {
  const b = await chromium.launch()
  const ctx = mob ? await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: mob !== 'd', hasTouch: true, locale: 'he-IL', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' })
    : await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, locale: 'he-IL', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36' })
  const p = await ctx.newPage()
  await p.goto(url, { waitUntil: 'load', timeout: 60000 })
  await prep(p)
  if (process.env.BGIMG) { const d = 'data:image/jpeg;base64,' + require('fs').readFileSync(process.env.BGIMG).toString('base64'); await p.evaluate((d) => { for (const c of document.querySelectorAll('.elementor-background-video-container')) { c.innerHTML = ''; c.style.cssText += ';background:url(' + d + ') center/cover no-repeat;opacity:1;display:block' } }, d); await p.waitForTimeout(800) }
  if (+y) { await scrollToY(p, +y); await p.waitForTimeout(1500) }
  if (process.env.WAIT) await p.waitForTimeout(+process.env.WAIT)
  await p.evaluate(() => { for (const e of document.querySelectorAll('body *')) { const c = getComputedStyle(e); if (c.position !== 'fixed') continue; const r = e.getBoundingClientRect(); if (r.width < 160 && r.height < 160 && r.top > 80 && (r.left < 120 || innerWidth - r.right < 120)) e.style.setProperty('display', 'none', 'important') } }).catch(() => {})
  await p.waitForTimeout(300)
  await p.evaluate(() => { const H = innerHeight, W = innerWidth; for (const [x, y] of [[30, H - 120], [30, H * .72], [W - 30, H - 120], [W - 30, H * .72], [40, H - 60]]) { for (const el of document.elementsFromPoint(x, y)) { let e = el; while (e && e !== document.body) { const c = getComputedStyle(e); if (c.position === 'fixed') { const r = e.getBoundingClientRect(); if (r.width < 160 && r.height < 160) e.style.setProperty('display', 'none', 'important'); break } e = e.parentElement } } } }).catch(() => {})
  await p.waitForTimeout(200)
  await p.screenshot({ path: `${__dirname}/${slug}/${name}.png` })
  const H = await p.evaluate(() => document.documentElement.scrollHeight)
  console.log(slug, name, 'H', H, 'links', JSON.stringify(await p.$$eval('header a, nav a', (as) => [...new Set(as.map((a) => a.href))].filter((h) => h.startsWith(location.origin)).slice(0, 14))))
  await b.close()
})()
