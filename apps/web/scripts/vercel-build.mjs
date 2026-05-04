import { cpSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const outDir = resolve(root, '.vercel/output')

rmSync(outDir, { recursive: true, force: true })

mkdirSync(`${outDir}/static`, { recursive: true })
mkdirSync(`${outDir}/functions/index.func`, { recursive: true })

// Static client assets → served as-is
cpSync(`${root}/dist/client`, `${outDir}/static`, { recursive: true })

// Server bundle → Vercel Node.js function
cpSync(`${root}/dist/server`, `${outDir}/functions/index.func`, { recursive: true })

// ESM package marker so .js chunks are treated as modules
writeFileSync(`${outDir}/functions/index.func/package.json`, JSON.stringify({ type: 'module' }))

// Thin Node.js ↔ Web Fetch adapter wrapping the TanStack Start fetch handler
writeFileSync(
  `${outDir}/functions/index.func/index.mjs`,
  `import server from './server.js'
import { Readable } from 'node:stream'

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'
  const url = \`\${proto}://\${host}\${req.url}\`

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value != null) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value)
    }
  }

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  const request = new Request(url, {
    method: req.method || 'GET',
    headers,
    ...(hasBody ? { body: Readable.toWeb(req), duplex: 'half' } : {}),
  })

  const response = await server.fetch(request)

  res.statusCode = response.status
  for (const [key, value] of response.headers) {
    res.setHeader(key, value)
  }

  if (response.body) {
    Readable.fromWeb(response.body).pipe(res)
  } else {
    res.end()
  }
}
`,
)

writeFileSync(
  `${outDir}/functions/index.func/.vc-config.json`,
  JSON.stringify({ runtime: 'nodejs22.x', handler: 'index.mjs' }, null, 2),
)

writeFileSync(
  `${outDir}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Cache hashed static assets forever
        {
          src: '/assets/(.+)',
          headers: { 'cache-control': 'public, max-age=31536000, immutable' },
          continue: true,
        },
        // Serve static files first
        { handle: 'filesystem' },
        // Everything else → SSR function
        { src: '/(.*)', dest: '/index' },
      ],
    },
    null,
    2,
  ),
)

console.log('Vercel build output ready at .vercel/output/')
