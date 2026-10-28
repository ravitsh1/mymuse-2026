const { chromium } = require('playwright')
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
// node tablet.js <slug> <url> → <slug>/tab-l.png (1180×820 @2) and tab-p.png (820×1180 @2)
;(async () => {
  const [slug, url] = process.argv.slice(2)
  const b = await chromium.launch()
  for (const [n, w, h] of [['tab-l', 1180, 820], ['tab-p', 820, 1180]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: n === 'tab-p', hasTouch: true, locale: 'he-IL' })
    const p = await ctx.newPage()
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch((e) => console.log('goto', e.message))
    await prep(p)
    await p.screenshot({ path: `${__dirname}/${slug}/${n}.png` })
    await ctx.close()
  }
  await b.close()
  console.log(slug, 'ok')
})()
