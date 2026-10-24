// Local TCP bridge to Neon over WebSocket, for environments that only allow HTTPS out
// (e.g. Claude Code cloud sessions: Postgres on :5432 times out, port 443 works).
// Listens on 127.0.0.1:5432 and pipes each connection to wss://<neon host>/v2, Neon's
// WebSocket endpoint (the one @neondatabase/serverless uses), through HTTPS_PROXY if set.
// Usage: see docs/IMPORT.md. Reads DATABASE_URL. Clients connect to 127.0.0.1 with
// sslmode=disable: TLS is the WebSocket's, the Postgres protocol inside it runs without SSL.
const net = require('net')
const tls = require('tls')
const http = require('http')
const WebSocket = require('ws')

const PORT = Number(process.env.BRIDGE_PORT || 5432)
const db = new URL(process.env.DATABASE_URL || '')
const HOST = db.hostname
if (!HOST.endsWith('.neon.tech')) {
  console.error('DATABASE_URL must point to a *.neon.tech host')
  process.exit(1)
}
const proxy = process.env.HTTPS_PROXY ? new URL(process.env.HTTPS_PROXY) : null

function connectTls(cb) {
  if (!proxy) {
    const sock = tls.connect({ host: HOST, port: 443, servername: HOST }, () => cb(null, sock))
    sock.on('error', cb)
    return
  }
  const req = http.request({ host: proxy.hostname, port: proxy.port, method: 'CONNECT', path: `${HOST}:443` })
  req.on('connect', (res, sock) => {
    if (res.statusCode !== 200) return cb(new Error(`proxy CONNECT ${res.statusCode}`))
    cb(null, tls.connect({ socket: sock, servername: HOST }))
  })
  req.on('error', cb)
  req.end()
}

net
  .createServer((client) => {
    client.pause()
    connectTls((err, sock) => {
      if (err) {
        console.error(err.message)
        return client.destroy()
      }
      const ws = new WebSocket(`wss://${HOST}/v2?address=${HOST}:5432`, { createConnection: () => sock })
      ws.binaryType = 'nodebuffer'
      ws.on('open', () => {
        client.on('data', (d) => ws.send(d))
        client.resume()
      })
      ws.on('message', (d) => client.write(d))
      ws.on('close', () => client.end())
      ws.on('error', (e) => {
        console.error('ws', e.message)
        client.destroy()
      })
      client.on('close', () => ws.close())
      client.on('error', () => ws.close())
    })
  })
  .listen(PORT, '127.0.0.1', () => {
    console.log(`bridge up on 127.0.0.1:${PORT} -> ${HOST}`)
  })
