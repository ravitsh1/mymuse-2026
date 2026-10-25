// node capture.js <slug> <url>  → mk/<slug>/{laptop.png,phone.png,g1.png,g2.png,card-*.png,brand.json}
const { chromium } = require('playwright')
const fs = require('fs')
const [slug, url] = process.argv.slice(2)
const out = `${__dirname}/${slug}`
fs.mkdirSync(out, { recursive: true })
const HIDE = `
  .elementor-invisible{visibility:visible!important}
  [data-aos]{opacity:1!important;transform:none!important}
  body :is(.elementor-popup-modal,[class*="cookie" i],[id*="cookie" i],[class*="consent" i],[id*="consent" i],[class*="gdpr" i], #vplugin,#pojo-a11y-toolbar,.pojo-a11y-toolbar-toggle,[class*="a11y" i][class*="toggle" i],[id*="accessib" i],[class*="accessib" i][class*="btn" i], [class*="nagish" i],[id*="nagish" i],[class*="enable" i][class*="toolbar" i],.uwy,#userwayAccessibilityIcon,[class*="userway" i], [class*="whatsapp" i][style*="fixed"],a[href*="wa.me"][class*="float" i],[class*="chat-widget" i],#hubspot-messages-iframe-container, .cursor,[class*="cursor" i][class*="follow" i]){display:none!important}`
async function prep(p) {
  await p.waitForTimeout(2500)
  // wait for real content (preloaders keep the page one screen tall and blank)
  for (let i = 0; i < 16; i++) {
    const ok = await p.evaluate(() => document.querySelectorAll('img').length > 2 && [...document.querySelectorAll('img')].some((i) => i.complete && i.naturalWidth > 300 && i.getBoundingClientRect().width > 200)).catch(() => false)
    if (ok) break
    await p.waitForTimeout(700)
  }
  await p.evaluate(() => scrollBy(0, 400)).catch(() => {}); await p.waitForTimeout(500); await p.evaluate(() => scrollTo(0, 0)).catch(() => {})
  await p.waitForTimeout(1500)
  // age gates (wineries) first, then cookie bars
  for (const t of ['כן', 'Yes', 'אני מעל גיל 18', 'מעל 18', 'אישור', 'הבנתי', 'מסכים', 'אני מסכים', 'קבל', 'Accept', 'Accept all', 'OK', 'Ok', 'אוקיי', 'סגור']) {
    for (const role of ['button', 'link']) {
      const b = p.getByRole(role, { name: t, exact: true })
      if (await b.count()) { await b.first().click({ timeout: 1500 }).catch(() => {}); await p.waitForTimeout(500) }
    }
  }
  await p.addStyleTag({ content: HIDE }).catch(() => {})
  // small floating buttons in the corners (accessibility, chat, back-to-top): not part of the design
  await p.evaluate(() => {
    for (const e of document.querySelectorAll('body *')) {
      const c = getComputedStyle(e); if (c.position !== 'fixed' && c.position !== 'sticky') continue
      const r = e.getBoundingClientRect()
      if (r.width < 130 && r.height < 130 && (r.top > innerHeight * 0.55 || r.left < 140 || innerWidth - r.right < 140) && r.top > 80) e.style.setProperty('display', 'none', 'important')
    }
  }).catch(() => {})
  await p.waitForTimeout(600)
}
async function scrollToY(p, y) {
  const done = await p.evaluate((y) => {
    const before = scrollY; scrollTo(0, y)
    if (Math.abs(scrollY - y) < 5 || scrollY !== before) return 'window'
    const S = window.Scrollbar && window.Scrollbar.getAll && window.Scrollbar.getAll().sort((a, b) => b.limit.y - a.limit.y)[0]
    if (S) { S.setPosition(0, y); return 'scrollbar' }
    const el = [...document.querySelectorAll('*')].find((e) => e.scrollHeight > e.clientHeight + 200 && /(auto|scroll)/.test(getComputedStyle(e).overflowY))
    if (el) { el.scrollTop = y; return 'element' }
    return 'none'
  }, y)
  await p.waitForTimeout(2200)
  return done
}
;(async () => {
  const b = await chromium.launch()
  const info = { slug, url }
  try {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', locale: 'he-IL' })
    const p = await ctx.newPage()
    const r = await p.goto(url, { waitUntil: 'load', timeout: 60000 })
    info.status = r ? r.status() : 0
    info.title = await p.title()
    await prep(p)
    await p.screenshot({ path: `${out}/laptop.png` })
    // brand colours by painted area
    info.colors = await p.evaluate(() => {
      const area = {}, text = {}
      for (const e of document.querySelectorAll('body *')) {
        const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue
        const c = getComputedStyle(e)
        if (c.visibility === 'hidden' || c.display === 'none') continue
        const bg = c.backgroundColor; if (bg && !/rgba\(.*, 0\)$/.test(bg)) area[bg] = (area[bg] || 0) + r.width * Math.min(r.height, 3000)
        if (e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) text[c.color] = (text[c.color] || 0) + (n => n)(e.textContent.trim().length)
      }
      const body = getComputedStyle(document.body).backgroundColor
      const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 10)
      return { body, bg: top(area), text: top(text) }
    })
    // sections with pictures, for the two landscape shots
    const H = await p.evaluate(() => Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, ...[...document.querySelectorAll('body *')].filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY)).map((e) => e.scrollHeight), ...(window.Scrollbar && window.Scrollbar.getAll ? window.Scrollbar.getAll().map((s) => s.limit.y + innerHeight) : [])))
    info.height = H
    const secs = await p.evaluate(() => [...document.querySelectorAll('section, .elementor-section, .elementor-top-section, .e-con, main > div, [class*="section" i]')]
      .map((s) => { const r = s.getBoundingClientRect(); const imgs = [...s.querySelectorAll('img, video, picture')].filter((i) => i.getBoundingClientRect().width > 200).length + (getComputedStyle(s).backgroundImage !== 'none' ? 1 : 0); return { y: Math.round(r.top + scrollY), h: Math.round(r.height), imgs } })
      .filter((s) => s.h > 380 && s.imgs > 0 && s.y > 500).sort((a, b) => a.y - b.y))
    const picks = []
    for (const s of secs) if (!picks.length || s.y - picks[picks.length - 1] > 1100) picks.push(s.y)
    const ys = picks.length >= 2 ? [picks[0], picks[Math.min(2, picks.length - 1)]] : [900, 2000].filter((y) => y < H - 900)
    info.shots = []
    for (const [k, y] of ys.slice(0, 2).entries()) { const how = await scrollToY(p, Math.max(0, y - 40)); await p.screenshot({ path: `${out}/g${k + 1}.png` }); info.shots.push({ y, how }) }
    // content images for cards: the largest photos on the page
    await scrollToY(p, 0)
    const imgs = await p.$$eval('img', (is) => is.map((i, n) => ({ n, w: i.naturalWidth, h: i.naturalHeight, src: i.currentSrc || i.src, alt: i.alt }))
      .filter((i) => i.w >= 500 && i.h >= 350 && !/logo|icon|svg/i.test(i.src)).sort((a, b) => b.w * b.h - a.w * a.h).slice(0, 4))
    info.images = imgs
    let c = 0
    for (const i of imgs) {
      try { const res = await ctx.request.get(i.src); if (res.ok()) { const ext = (res.headers()['content-type'] || '').includes('png') ? 'png' : 'jpg'; fs.writeFileSync(`${out}/card-${c++}.${ext}`, await res.body()) } } catch {}
      if (c >= 2) break
    }
    await ctx.close()
    const m = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: 'he-IL', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' })
    const mp = await m.newPage()
    await mp.goto(url, { waitUntil: 'load', timeout: 60000 })
    await prep(mp)
    await mp.screenshot({ path: `${out}/phone.png` })
    await m.close()
  } catch (e) { info.error = String(e).slice(0, 200) }
  fs.writeFileSync(`${out}/brand.json`, JSON.stringify(info, null, 1))
  console.log(slug, info.status, info.error || '', (info.title || '').slice(0, 50), 'shots', JSON.stringify(info.shots), 'cards', (info.images || []).length)
  await b.close()
})()
