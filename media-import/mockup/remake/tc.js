// node tc.js <slug>  → <slug>/tc.json: colour of the top rows of each phone screenshot (status-bar fill)
const sharp = require('sharp'), fs = require('fs')
const dir = `${__dirname}/${process.argv[2]}`
;(async () => { const o = {}
  for (const f of fs.readdirSync(dir).filter((f) => /^phone\d?\.png$/.test(f))) {
    const { data } = await sharp(`${dir}/${f}`).extract({ left: 0, top: 0, width: 1170 > 0 ? (await sharp(`${dir}/${f}`).metadata()).width : 1, height: 6 }).resize(1, 1).raw().toBuffer({ resolveWithObject: true })
    o[f] = '#' + [...data.slice(0, 3)].map((v) => v.toString(16).padStart(2, '0')).join('')
  }
  fs.writeFileSync(`${dir}/tc.json`, JSON.stringify(o))
})()
