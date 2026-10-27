// node mockup.js <slug> [overrides.json]  → <slug>/mockup.html + <slug>/mockup.jpg (2400x1350)
const fs = require('fs')
const { chromium } = require('playwright')
const sharp = require('/home/user/mymuse-2026/node_modules/sharp')
const slug = process.argv[2]
const dir = `${__dirname}/${slug}`
const brand = JSON.parse(fs.readFileSync(`${dir}/brand.json`, 'utf8'))
const over = fs.existsSync(`${dir}/over.json`) ? JSON.parse(fs.readFileSync(`${dir}/over.json`, 'utf8')) : {}

const rgb = (s) => (s.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number)
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const lum = (c) => { const [r, g, b] = c.map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }); return 0.2126 * r + 0.7152 * g + 0.0722 * b }
const sat = (c) => { const mx = Math.max(...c), mn = Math.min(...c); return mx ? (mx - mn) / mx : 0 }
const opaque = (s) => !/rgba\([^)]*,\s*0(\.\d+)?\)$/.test(s) || /,\s*0?\.[5-9]\d*\)$/.test(s)
const cols = [...(brand.colors?.bg || []), ...(brand.colors?.text || [])].filter(([s]) => opaque(s)).map(([s, w]) => ({ c: rgb(s), w }))
const light = over.light || hex((cols.filter((x) => lum(x.c) > 0.72 && sat(x.c) < 0.25).sort((a, b) => b.w - a.w)[0] || { c: [246, 243, 238] }).c)
const dark = over.dark || hex((cols.filter((x) => lum(x.c) < 0.08).sort((a, b) => b.w - a.w)[0] || { c: [28, 26, 30] }).c)
const accents = cols.filter((x) => sat(x.c) > 0.35 && lum(x.c) > 0.04 && lum(x.c) < 0.8).sort((a, b) => b.w - a.w)
const accent = over.accent || hex((accents[0] || { c: [200, 80, 60] }).c)
const accent2 = over.accent2 || hex((accents.find((x) => Math.abs(lum(x.c) - lum(rgb(accent))) > 0.06 || sat(x.c) < sat(rgb(accent)) - 0.2) || accents[1] || { c: rgb(accent) }).c)
const bodyDark = lum(rgb(brand.colors?.body || 'rgb(255,255,255)')) < 0.2
const theme = over.theme || (bodyDark ? 'dark' : 'light')
const bg = theme === 'dark' ? dark : light
const band = over.band || (theme === 'dark' ? accent : dark)
const cards = fs.readdirSync(dir).filter((f) => /^card-\d\.(jpg|png)$/.test(f)).slice(0, 2)
const PORTRAIT = process.env.PORTRAIT === '1'
// TRANSPARENT=1: everything painted in the band colour is left transparent (the site's palette shows through) → .webp with alpha
const T = process.env.TRANSPARENT === '1'
const bandFill = T ? 'transparent' : band
const layout = PORTRAIT ? 'portrait' : over.layout || 'desk'
const names = (() => { try { return Object.fromEntries(JSON.parse(fs.readFileSync(__dirname + '/../projects6.json', 'utf8')).docs.map((p) => [p.slug, p.nameEn])) } catch { return {} } })()
const nameEn = over.name || names[slug] || slug.toUpperCase()
const domain = over.domain || (brand.url ? new URL(brand.url).hostname.replace(/^www\./, '') : '')
const has = (f) => fs.existsSync(`${dir}/${f}`)
const tc = fs.existsSync(`${dir}/tc.json`) ? JSON.parse(fs.readFileSync(`${dir}/tc.json`, 'utf8')) : {}
const phone = (src, cls = '', st = '') => `<div class="phone ${cls}" style="${st}"><span class="island"></span><div class="screen" style="background:${tc[src] || '#fff'}"><img src="${src}" alt=""><div class="glare"></div></div></div>`
const browser = (src, cls = '', st = '') => `<div class="browser ${cls}" style="${st}"><div class="bar"><i></i><i></i><i></i>${domain ? `<span class="url">${domain}</span>` : ''}</div><div class="bscreen"><img src="${src}" alt=""></div></div>`
const BASE = `*{box-sizing:border-box;margin:0}html,body{width:1200px;height:675px;overflow:hidden}body{position:relative}
.screen{position:relative;width:100%;height:100%;border-radius:6px;overflow:hidden;background:#fff}
.screen img,.bscreen img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block}
.glare{position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.12),rgba(255,255,255,0) 40%)}
.phone{position:absolute;width:178px;height:380px;padding:8px;border-radius:34px;background:linear-gradient(145deg,#403e46,#18171b);box-shadow:inset 0 0 0 1.5px #52505a,inset 0 0 0 3px #0e0e10,18px 30px 50px -12px rgba(0,0,0,.55)}
.phone .screen{border-radius:27px;padding-top:21%}.phone .screen img{border-radius:0}
.island{position:absolute;top:15px;left:50%;width:52px;height:15px;margin-left:-26px;border-radius:9px;background:#050505;z-index:2}
.browser{position:absolute;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 40px 80px -24px rgba(0,0,0,.55),0 0 0 1px rgba(0,0,0,.08)}
.bar{height:30px;display:flex;align-items:center;gap:7px;padding:0 14px;background:#ececee;border-bottom:1px solid #dcdce0;direction:ltr}
.bar i{width:10px;height:10px;border-radius:50%;background:#ff5f57}.bar i:nth-child(2){background:#febc2e}.bar i:nth-child(3){background:#28c840}
.url{margin-left:18px;flex:0 1 46%;height:18px;border-radius:9px;background:#fff;font:500 10px/18px system-ui,sans-serif;color:#555;padding:0 10px;overflow:hidden;white-space:nowrap}
.bscreen{position:absolute;top:30px;left:0;right:0;bottom:0;overflow:hidden}
.name{position:absolute;font:900 190px/0.9 "Arial Black","Helvetica Neue",Arial,sans-serif;letter-spacing:-.02em;white-space:nowrap;color:transparent;direction:ltr}
.dot{position:absolute;border-radius:50%}`
const bandLight = lum(rgb(band.replace(/^#(..)(..)(..)$/, (m, a, b, c) => `rgb(${parseInt(a, 16)},${parseInt(b, 16)},${parseInt(c, 16)})`))) > 0.35
const strokeOn = () => T ? 'rgba(128,128,128,.4)' : bandLight ? 'rgba(0,0,0,.42)' : 'rgba(255,255,255,.34)'
let css = '', body = ''
if (layout === 'portrait') {
  const p2 = has('phone2.png'), p3 = has('phone3.png')
  const side = p2 || p3
  css = `html,body{width:540px;height:960px}
body{background:radial-gradient(90% 60% at 50% 30%, color-mix(in srgb, ${bg} 90%, #fff) 0%, ${bg} 70%)${T ? ' top / 100% 66% no-repeat' : ''}}
.band{position:absolute;left:0;right:0;bottom:0;height:34%;background:${bandFill}}
.name{left:50%;top:41%;transform:translate(-50%,-50%) rotate(-90deg);font-size:${Math.min(150, 1350 / Math.max(5, nameEn.length))}px;-webkit-text-stroke:1.6px ${theme === 'dark' ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.2)'}}
.pm{left:157px;top:112px;width:226px;height:484px;padding:10px;border-radius:40px;z-index:3}.pm .screen{border-radius:31px}.pm .island{top:18px;width:66px;height:18px;border-radius:10px}
.ps{width:162px;height:347px;top:190px;z-index:2}.ps1{left:44px;transform:rotate(-9deg)}.ps2{right:44px;transform:rotate(9deg)}
.card{position:absolute;z-index:1;background:${theme === 'dark' ? 'color-mix(in srgb,' + bg + ' 80%, #fff)' : '#fff'};padding:8px;border-radius:8px;box-shadow:0 18px 40px -12px rgba(0,0,0,.45)}
.card img{display:block;width:100%;height:100%;object-fit:cover;border-radius:4px}
.card::before{content:"";position:absolute;top:-9px;left:50%;width:64px;height:18px;margin-left:-32px;background:${accent};opacity:.9;transform:rotate(-3deg);border-radius:2px}
.c1{width:176px;height:142px;left:36px;top:138px;transform:rotate(-8deg)}.c2{width:154px;height:185px;right:36px;top:380px;transform:rotate(7deg)}`
  const cards = fs.readdirSync(dir).filter((f) => /^card-\d\.(jpg|png)$/.test(f)).slice(0, 2)
  body = `<div class="band"></div>
${side ? phone(p2 ? 'phone2.png' : 'phone3.png', 'ps ps1') + phone(p3 ? 'phone3.png' : 'phone2.png', 'ps ps2') : (cards[0] ? `<div class="card c1"><img src="${cards[0]}" alt=""></div>` : '') + (cards[1] ? `<div class="card c2"><img src="${cards[1]}" alt=""></div>` : '')}
${phone('phone.png', 'pm')}
<span class="dot" style="width:18px;height:18px;left:420px;top:70px;background:${accent}"></span><span class="dot" style="width:12px;height:12px;left:96px;top:600px;background:${accent2}"></span>`
} else if (layout === 'trio') {
  const P = [has('phone2.png') ? 'phone2.png' : 'phone.png', 'phone.png', has('phone3.png') ? 'phone3.png' : 'phone.png']
  css = `body{background:${T ? 'radial-gradient(70% 80% at 50% 40%, rgba(255,255,255,.14) 0%, rgba(255,255,255,0) 70%)' : `radial-gradient(70% 80% at 50% 40%, color-mix(in srgb, ${band} 86%, #fff) 0%, ${band} 70%)`}}
.name{left:50%;top:50%;transform:translate(-50%,-52%);-webkit-text-stroke:2px ${strokeOn(band)};font-size:${Math.min(230, 1900 / Math.max(4, nameEn.length))}px}
.p1{left:300px;top:150px;width:196px;height:418px;transform:rotate(-9deg)}.p3{left:704px;top:150px;width:196px;height:418px;transform:rotate(9deg)}
.p2{left:482px;top:95px;width:236px;height:505px;padding:10px;border-radius:42px}.p2 .screen{border-radius:33px}.p2 .island{top:18px;width:62px;height:18px}`
  body = `<div class="name">${nameEn}</div>${phone(P[0], 'p1')}${phone(P[2], 'p3')}${phone(P[1], 'p2')}
<span class="dot" style="width:22px;height:22px;left:250px;top:90px;background:${accent}"></span><span class="dot" style="width:14px;height:14px;right:250px;bottom:80px;background:${accent2}"></span>`
} else if (layout === 'browser') {
  css = `body{background:${T ? `radial-gradient(410px 450px at 910px 290px, transparent 99.6%, ${bg} 100%)` : bg}}
.blob{position:absolute;right:-120px;top:-160px;width:820px;height:900px;border-radius:50%;background:${bandFill}}
.name{left:48px;top:34px;font-size:${Math.min(110, 560 / (nameEn.length * 0.8))}px;-webkit-text-stroke:1.6px ${theme === 'dark' ? 'rgba(255,255,255,.4)' : 'rgba(0,0,0,.38)'};opacity:.9}
.bw{left:330px;top:120px;width:740px;height:462px;transform:perspective(1800px) rotateY(-14deg) rotateX(3deg);transform-origin:70% 50%}
.ph{left:200px;top:215px;width:200px;height:428px;transform:rotate(-3deg)}`
  body = `<div class="blob"></div><div class="name">${nameEn}</div>${browser('laptop.png', 'bw')}${phone('phone.png', 'ph')}
<span class="dot" style="width:20px;height:20px;left:230px;top:120px;background:${accent}"></span>`
} else if (layout === 'iso') {
  css = `body{background:${T ? 'radial-gradient(90% 90% at 60% 30%, rgba(255,255,255,.15) 0%, rgba(255,255,255,0) 75%)' : `radial-gradient(90% 90% at 60% 30%, color-mix(in srgb, ${band} 85%, #fff) 0%, ${band} 75%)`}}
.iso{position:absolute;left:560px;top:420px;width:0;height:0;transform:rotateX(52deg) rotateZ(-38deg);transform-style:preserve-3d}
.iso .browser{width:500px;height:312px;left:-250px;top:-156px;box-shadow:-30px 40px 60px -10px rgba(0,0,0,.45)}
.b1{transform:translate(-170px,165px)}.b2{transform:translate(10px,0) translateZ(60px)}.b3{transform:translate(190px,-165px) translateZ(120px)}
.name{right:40px;bottom:20px;font-size:${Math.min(110, 1100 / Math.max(5, nameEn.length))}px;-webkit-text-stroke:1.6px ${strokeOn(band)}}`
  body = `<div class="name">${nameEn}</div><div class="iso">${browser(has('g2.png') ? 'g2.png' : 'laptop.png', 'b1')}${browser(has('g1.png') ? 'g1.png' : 'laptop.png', 'b2')}${browser('laptop.png', 'b3')}</div>
<span class="dot" style="width:22px;height:22px;left:120px;top:110px;background:${accent}"></span><span class="dot" style="width:14px;height:14px;left:180px;top:150px;background:${accent2}"></span>`
}
const html = layout !== 'desk' ? `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}${css}</style></head><body>${body}</body></html>` : `<!doctype html><html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}html,body{width:1200px;height:675px;overflow:hidden}
body{background:radial-gradient(80% 70% at 55% 35%, color-mix(in srgb, ${bg} 92%, #fff) 0%, ${bg} 60%, color-mix(in srgb, ${bg} 88%, #000) 100%)${T ? ` top / 100% ${100 - (over.bandHeight || 36)}% no-repeat` : ''};position:relative}
.band{position:absolute;left:0;right:0;bottom:0;height:${over.bandHeight || 36}%;background:${bandFill}}
.stage{position:absolute;inset:0;transform:scale(.74);transform-origin:50% 47%}
.card{position:absolute;background:${theme === 'dark' ? 'color-mix(in srgb,' + bg + ' 80%, #fff)' : '#fff'};padding:10px;border-radius:8px;box-shadow:0 18px 40px -12px rgba(0,0,0,.45)}
.card img{display:block;width:100%;height:100%;object-fit:cover;border-radius:4px}
.card::before{content:"";position:absolute;top:-10px;left:50%;width:80px;height:20px;margin-left:-40px;background:${accent};opacity:.9;transform:rotate(-3deg);border-radius:2px}
.ca{width:270px;height:220px;left:110px;top:80px;transform:rotate(-7deg)}
.cb{width:250px;height:300px;right:70px;top:40px;transform:rotate(6deg)}
.dot{position:absolute;border-radius:50%}
.laptop{position:absolute;left:330px;top:120px;width:640px}
.lid{position:relative;width:640px;height:400px;padding:13px 13px 19px;border-radius:18px 18px 6px 6px;background:linear-gradient(180deg,#34323a,#1c1b20);box-shadow:inset 0 0 0 1.5px #46444c,inset 0 0 0 3px #111}
.cam{position:absolute;top:5px;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:#0b0b0d}
.screen{position:relative;width:100%;height:100%;border-radius:6px;overflow:hidden;background:#fff}
.screen img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block}
.glare{position:absolute;inset:0;background:linear-gradient(115deg,rgba(255,255,255,.12),rgba(255,255,255,0) 40%)}
.base{position:relative;width:740px;height:17px;margin-left:-50px;border-radius:3px 3px 15px 15px;background:linear-gradient(180deg,#56545c 0%,#34323a 45%,#1c1b20 100%);box-shadow:0 22px 40px -10px rgba(0,0,0,.6)}
.base::before{content:"";position:absolute;top:0;left:50%;width:110px;height:7px;margin-left:-55px;border-radius:0 0 8px 8px;background:#26252a}
.phone{position:absolute;left:250px;top:230px;width:178px;height:380px;padding:8px;border-radius:34px;transform:rotate(-4deg);background:linear-gradient(145deg,#403e46,#18171b);box-shadow:inset 0 0 0 1.5px #52505a,inset 0 0 0 3px #0e0e10,18px 30px 50px -12px rgba(0,0,0,.55)}
.phone .screen{border-radius:27px;padding-top:21%}.phone .screen img{border-radius:0}
.island{position:absolute;top:15px;left:50%;width:52px;height:15px;margin-left:-26px;border-radius:9px;background:#050505;z-index:2}
</style></head><body>
<div class="band"></div><div class="stage">
${cards[0] ? `<div class="card ca"><img src="${cards[0]}" alt=""></div>` : ''}
${cards[1] ? `<div class="card cb"><img src="${cards[1]}" alt=""></div>` : ''}
<span class="dot" style="width:22px;height:22px;left:520px;top:70px;background:${accent}"></span>
<span class="dot" style="width:14px;height:14px;right:330px;bottom:60px;background:${accent2}"></span>
<div class="laptop"><div class="lid"><span class="cam"></span><div class="screen"><img src="laptop.png" alt=""><div class="glare"></div></div></div><div class="base"></div></div>
${phone('phone.png')}
</div></body></html>`
const OUT = (PORTRAIT ? 'mockup-m' : 'mockup') + (T ? '-t' : '')
fs.writeFileSync(`${dir}/${OUT}.html`, html)
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: PORTRAIT ? { width: 540, height: 960 } : { width: 1200, height: 675 }, deviceScaleFactor: 2 })
  await p.goto('file://' + dir + '/' + OUT + '.html'); await p.waitForTimeout(500)
  if (T) await sharp(await p.screenshot({ omitBackground: true })).webp({ quality: 86, alphaQuality: 90 }).toFile(`${dir}/${OUT}.webp`)
  else await sharp(await p.screenshot()).jpeg({ quality: 88, mozjpeg: true }).toFile(`${dir}/${OUT}.jpg`)
  await b.close()
  console.log(slug, JSON.stringify({ theme, bg, band, accent, accent2, cards: cards.length }))
})()
