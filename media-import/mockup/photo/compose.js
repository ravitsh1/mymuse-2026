// node compose.js <photo> <out.jpg> <comp#>=<screenshot> …  — puts each screenshot on a detected white screen
const sharp = require('sharp')
const { detect } = require('./detect')
// homography mapping unit square (0,0)(1,0)(1,1)(0,1) → quad
const sq2quad = (q) => {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q
  const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3
  const den = dx1 * dy2 - dx2 * dy1, g = (sx * dy2 - dx2 * sy) / den, h = (dx1 * sy - sx * dy1) / den
  return [x1 - x0 + g * x1, x3 - x0 + h * x3, x0, y1 - y0 + g * y1, y3 - y0 + h * y3, y0, g, h, 1]
}
const inv = (m) => {
  const [a, b, c, d, e, f, g, h, i] = m
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g, det = a * A + b * B + c * C
  return [A, -(b * i - c * h), b * f - c * e, B, a * i - c * g, -(a * f - c * d), C, -(a * h - b * g), a * e - b * d].map((v) => v / det)
}
;(async () => {
  const [photo, out, ...pairs] = process.argv.slice(2)
  const screens = await detect(photo)
  const img = sharp(photo).removeAlpha()
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
  const W = info.width, H = info.height
  for (const pair of pairs) {
    // <comp#>=<shot>[@x0,y0,x1,y1,x2,y2,x3,y3]: corners by hand (TL TR BR BL) when a hand hides one
    const [k, rest] = pair.split('=')
    const [shot, manual] = rest.split('@')
    const s = { ...screens[+k] }
    if (manual) { const n = manual.split(',').map(Number); s.quad = [0, 2, 4, 6].map((i) => [n[i], n[i + 1]]); s.loose = true; s.box = [Math.min(...s.quad.map((p) => p[0])), Math.min(...s.quad.map((p) => p[1])), Math.max(...s.quad.map((p) => p[0])), Math.max(...s.quad.map((p) => p[1]))].map(Math.round) }
    // grow the corner quad a little: rounded corners make the extreme points sit inside the true corners
    const cx = s.quad.reduce((a, p) => a + p[0], 0) / 4, cy = s.quad.reduce((a, p) => a + p[1], 0) / 4
    const q = s.quad.map(([x, y]) => [cx + (x - cx) * 1.025, cy + (y - cy) * 1.025])
    const len = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
    const aspect = (len(q[0], q[1]) + len(q[3], q[2])) / (len(q[0], q[3]) + len(q[1], q[2]))
    // crop the screenshot from the top to the screen's shape
    const sm = await sharp(shot).metadata()
    let cw = sm.width, ch = Math.round(sm.width / aspect)
    if (ch > sm.height) { ch = sm.height; cw = Math.round(ch * aspect) }
    const { data: sd, info: si } = await sharp(shot).extract({ left: Math.round((sm.width - cw) / 2), top: 0, width: cw, height: ch }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
    const M = inv(sq2quad(q))
    // mask: the screen's own white pixels, grown by 3px over the anti-aliased rim
    const [bx0, by0, bx1, by1] = s.box
    const lab = new Uint8Array(W * H)
    // screen = bright and neutral (shaded parts of the white screen included); skin is too saturated, bezels too dark
    const neutral = (i) => Math.min(data[i], data[i + 1], data[i + 2]) > (s.loose ? 150 : 232) && Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) < 24
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) { const i = (y * W + x) * 3; if (neutral(i)) lab[y * W + x] = 1 }
    const grown = new Uint8Array(lab)
    for (let r = 0; r < 3; r++) { const src = new Uint8Array(grown); for (let y = by0 - 3; y <= by1 + 3; y++) for (let x = bx0 - 3; x <= bx1 + 3; x++) { const p = y * W + x; if (p < 0 || p >= W * H || src[p]) continue; if (src[p - 1] || src[p + 1] || src[p - W] || src[p + W]) { const i = p * 3; if (Math.min(data[i], data[i + 1], data[i + 2]) > 120) grown[p] = 1 } } }
    // fill holes: screen pixels a shade too dark (gradients, JPEG noise) enclosed by the screen; whatever reaches in
    // from outside the box (fingers, bezel) is not enclosed and stays on top
    const X0 = Math.max(0, bx0 - 4), Y0 = Math.max(0, by0 - 4), X1 = Math.min(W - 1, bx1 + 4), Y1 = Math.min(H - 1, by1 + 4)
    const out = new Uint8Array(W * H), st = []
    for (let x = X0; x <= X1; x++) st.push(Y0 * W + x, Y1 * W + x)
    for (let y = Y0; y <= Y1; y++) st.push(y * W + X0, y * W + X1)
    while (st.length) {
      const p = st.pop(); if (out[p] || grown[p]) continue
      const x = p % W, y = (p / W) | 0; if (x < X0 || x > X1 || y < Y0 || y > Y1) continue
      out[p] = 1; st.push(p - 1, p + 1, p - W, p + W)
    }
    for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) { const p = y * W + x; if (!out[p]) grown[p] = 1 }
    for (let y = by0 - 3; y <= by1 + 3; y++) for (let x = bx0 - 3; x <= bx1 + 3; x++) {
      const p = y * W + x
      if (p < 0 || p >= W * H || !grown[p]) continue
      const z = M[6] * x + M[7] * y + M[8], u = (M[0] * x + M[1] * y + M[2]) / z, v = (M[3] * x + M[4] * y + M[5]) / z
      if (u < 0 || u > 1 || v < 0 || v > 1) continue
      const fx = u * (si.width - 1), fy = v * (si.height - 1), x0 = fx | 0, y0 = fy | 0, x1 = Math.min(x0 + 1, si.width - 1), y1 = Math.min(y0 + 1, si.height - 1), ax = fx - x0, ay = fy - y0
      const i = p * 3
      for (let c = 0; c < 3; c++) {
        const v00 = sd[(y0 * si.width + x0) * 3 + c], v10 = sd[(y0 * si.width + x1) * 3 + c], v01 = sd[(y1 * si.width + x0) * 3 + c], v11 = sd[(y1 * si.width + x1) * 3 + c]
        const val = (v00 * (1 - ax) + v10 * ax) * (1 - ay) + (v01 * (1 - ax) + v11 * ax) * ay
        // a touch of the room: screens in photos are never pure white-balanced
        data[i + c] = Math.round(val * 0.96 + 4)
      }
    }
  }
  await sharp(data, { raw: { width: W, height: H, channels: 3 } }).resize({ width: 2400 }).jpeg({ quality: 86, mozjpeg: true }).toFile(out)
  console.log(out, 'screens', screens.length)
})()
