// node detect.js <photo>… → screens: white regions (area > 1.5%), with corner quads
const sharp = require('sharp')
const detect = async (file) => {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const W = info.width, H = info.height, C = info.channels
  const white = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++) { const r = data[i * C], g = data[i * C + 1], b = data[i * C + 2]; white[i] = Math.min(r, g, b) > 232 && Math.max(r, g, b) - Math.min(r, g, b) < 18 ? 1 : 0 }
  const label = new Int32Array(W * H), comps = []
  for (let s = 0; s < W * H; s++) {
    if (!white[s] || label[s]) continue
    const id = comps.length + 1, stack = [s]; label[s] = id
    let n = 0, tl = [0, 0, Infinity], br = [0, 0, -Infinity], tr = [0, 0, -Infinity], bl = [0, 0, Infinity], minx = W, maxx = 0, miny = H, maxy = 0
    while (stack.length) {
      const p = stack.pop(); n++
      const x = p % W, y = (p / W) | 0
      if (x + y < tl[2]) tl = [x, y, x + y]; if (x + y > br[2]) br = [x, y, x + y]
      if (x - y > tr[2]) tr = [x, y, x - y]; if (x - y < bl[2]) bl = [x, y, x - y]
      minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y)
      for (const q of [p - 1, p + 1, p - W, p + W]) if (q >= 0 && q < W * H && white[q] && !label[q] && Math.abs((q % W) - x) <= 1) { label[q] = id; stack.push(q) }
    }
    comps.push({ id, n, quad: [tl, tr, br, bl].map((c) => [c[0], c[1]]), box: [minx, miny, maxx, maxy] })
  }
  // a screen fills most of its corner quad (rules out walls, cups, paper)
  const area = (q) => Math.abs(q.reduce((s, p, i) => { const r = q[(i + 1) % 4]; return s + p[0] * r[1] - r[0] * p[1] }, 0)) / 2
  return comps.filter((c) => c.n > W * H * 0.015 && c.n / area(c.quad) > 0.9).map((c) => ({ ...c, fill: +(c.n / area(c.quad)).toFixed(3) }))
}
module.exports = { detect }
if (require.main === module) (async () => { for (const f of process.argv.slice(2)) { const s = await detect(f); console.log(f.split('/').pop(), JSON.stringify(s.map((c) => ({ n: c.n, fill: c.fill, quad: c.quad })))) } })()
