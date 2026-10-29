// node mockup26.js <slug> [variant 0-3]  → <slug>/m26.jpg (2400x1350) and, with PORTRAIT=1, <slug>/m26-m.jpg (1080x1920)
// Brand book 2026 imagery: a porcelain room (wall + floor, soft corner), side sun with leaf shadows, painted slabs in the
// brand colours leaning behind the devices, long soft shadows. No people, no gradients as graphics.
const fs = require('fs')
const { chromium } = require('playwright')
const sharp = require('/home/user/mymuse-2026/node_modules/sharp')
const slug = process.argv[2]
const dir = `${__dirname}/${slug}`
const has = (f) => fs.existsSync(`${dir}/${f}`)
const tc = has('tc.json') ? JSON.parse(fs.readFileSync(`${dir}/tc.json`, 'utf8')) : {}
const PORTRAIT = process.env.PORTRAIT === '1'
const V = Number(process.argv[3] ?? [...slug].reduce((a, c) => a + c.charCodeAt(0), 0) % 4) % 4

const C = { ink: '#1c0f30', deep: '#801f48', pink: '#ff2d83', pop: '#f4e85a', mauve: '#2e1f45' }
// slab pairs per variant: big slab behind the laptop, small one behind the phone
const SLABS = [
  [C.deep, C.pop],
  [C.ink, C.pink],
  [C.pop, C.deep],
  [C.pink, C.ink],
][V]
const lap = ['laptop.png', 'tab-l.png', 'g1.png'].find(has) || null
const ph = has('phone.png') ? 'phone.png' : null

const phone = (src, cls) =>
  `<div class="phone ${cls}"><span class="island"></span><div class="screen" style="background:${tc[src] || '#fff'}"><img src="${src}" alt=""></div></div>`

// leaf shadow: blurred leaves on two twigs, multiplied over the wall
const leaves = (x, y, s, r) => {
  let out = ''
  for (let i = 0; i < 9; i++) {
    const a = (i * 37) % 360
    out += `<ellipse cx="${(i % 3) * 38 - 30}" cy="${Math.floor(i / 3) * 44 - 40}" rx="13" ry="30" transform="rotate(${a} ${(i % 3) * 38 - 30} ${Math.floor(i / 3) * 44 - 40})"/>`
  }
  return `<svg class="leaf" style="left:${x}px;top:${y}px;transform:scale(${s}) rotate(${r}deg)" viewBox="-120 -120 240 240" width="240" height="240"><path d="M-110 110 Q -20 10 100 -110" stroke="#1c0f30" stroke-width="4" fill="none"/>${out}</svg>`
}

const W = PORTRAIT ? 540 : 1200
const H = PORTRAIT ? 960 : 675
// the floor (bottom 30%) stays clear: the project title sits there on the site
const floorY = PORTRAIT ? 70 : 62

const css = `*{box-sizing:border-box;margin:0}html,body{width:${W}px;height:${H}px;overflow:hidden}
body{position:relative;background:#f8f7f9}
.wall{position:absolute;inset:0 0 ${100 - floorY}% 0;background:#f8f7f9}
.floor{position:absolute;inset:${floorY}% 0 0 0;background:#ebe7ee}
.corner{position:absolute;left:0;right:0;top:${floorY}%;height:26px;margin-top:-13px;background:#ddd7e1;filter:blur(10px);opacity:.7}
.sun{position:absolute;left:${PORTRAIT ? -80 : -120}px;top:-60px;width:${PORTRAIT ? 380 : 560}px;height:${PORTRAIT ? 1100 : 900}px;background:#fff;opacity:.55;filter:blur(40px);transform:rotate(24deg)}
.leaf{position:absolute;filter:blur(3.5px);opacity:.08;fill:#1c0f30;mix-blend-mode:multiply}
.slab{position:absolute;box-shadow:40px 60px 50px rgba(28,15,48,.22)}
.slab::after{content:"";position:absolute;inset:0;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>");mix-blend-mode:soft-light;opacity:.55}
.slab::before{content:"";position:absolute;left:-2%;right:-2%;bottom:-10px;height:18px;border-radius:50%;background:rgba(28,15,48,.35);filter:blur(8px);z-index:-1}
.fs{position:absolute;border-radius:50%;background:rgba(28,15,48,.22);filter:blur(16px)}
.screen{position:relative;width:100%;height:100%;border-radius:6px;overflow:hidden;background:#fff}
.screen img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block}
.laptop{position:absolute}
.lid{position:relative;padding:12px 12px 18px;border-radius:16px 16px 6px 6px;background:#1d1b21;box-shadow:inset 0 0 0 1.5px #3c3a42}
.base{position:relative;height:15px;border-radius:3px 3px 14px 14px;background:#2a2830;box-shadow:0 18px 28px -8px rgba(28,15,48,.45)}
.base::before{content:"";position:absolute;top:0;left:50%;width:100px;height:6px;margin-left:-50px;border-radius:0 0 8px 8px;background:#1d1b21}
.phone{position:absolute;padding:8px;border-radius:32px;background:#1d1b21;box-shadow:inset 0 0 0 1.5px #3c3a42,22px 34px 40px -14px rgba(28,15,48,.5)}
.phone .screen{border-radius:25px;padding-top:21%}
.island{position:absolute;top:15px;left:50%;width:50px;height:14px;margin-left:-25px;border-radius:9px;background:#050505;z-index:2}`

const scene = PORTRAIT
  ? `<div class="wall"></div><div class="floor"></div><div class="corner"></div><div class="sun"></div>
${leaves(20, 40, 1.4, 10)}${leaves(330, 120, 1.1, -30)}
<div class="slab" style="left:40px;top:120px;width:300px;height:552px;background:${SLABS[0]};transform:rotate(-6deg)"></div>
<div class="slab" style="left:300px;top:340px;width:190px;height:332px;background:${SLABS[1]};transform:rotate(9deg)"></div>
<div class="fs" style="left:150px;top:628px;width:280px;height:36px"></div>
${ph ? phone(ph, 'p') : ''}`
  : `<div class="wall"></div><div class="floor"></div><div class="corner"></div><div class="sun"></div>
${leaves(40, 10, 1.6, 8)}${leaves(220, 140, 1.1, -24)}${leaves(980, 30, 1.2, 40)}
<div class="slab" style="left:330px;top:30px;width:440px;height:400px;background:${SLABS[0]};transform:rotate(-6deg)"></div>
<div class="slab" style="left:150px;top:150px;width:200px;height:280px;background:${SLABS[1]};transform:rotate(10deg)"></div>
<div class="fs" style="left:340px;top:390px;width:540px;height:40px"></div><div class="fs" style="left:210px;top:416px;width:170px;height:26px"></div>
${lap ? `<div class="laptop" style="left:380px;top:82px;width:480px"><div class="lid" style="height:300px"><div class="screen"><img src="${lap}" alt=""></div></div><div class="base" style="width:560px;margin-left:-40px"></div></div>` : ''}
${ph ? phone(ph, 'p') : ''}`
const pcss = PORTRAIT
  ? `.p{left:157px;top:150px;width:226px;height:482px;padding:10px;border-radius:40px}.p .screen{border-radius:31px}.p .island{top:18px;width:64px;height:18px}`
  : `.p{left:255px;top:128px;width:142px;height:304px;transform:rotate(3deg)}`

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}${pcss}</style></head><body>${scene}</body></html>`
const OUT = PORTRAIT ? 'm26-m' : 'm26'
fs.writeFileSync(`${dir}/${OUT}.html`, html)
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })
  await p.goto('file://' + dir + '/' + OUT + '.html')
  await p.waitForTimeout(400)
  await sharp(await p.screenshot()).jpeg({ quality: 88, mozjpeg: true }).toFile(`${dir}/${OUT}.jpg`)
  await b.close()
  console.log(slug, 'variant', V, lap, ph)
})()
