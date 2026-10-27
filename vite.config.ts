import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Connect, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { trackOrder, tracks } from './src/tracks'

// The 2020 site is a plain static page in public/classic. Netlify serves its
// index.html for /classic/ on its own; this does the same for `vite` and `vite preview`.
function classicSite(): Plugin {
  const rewrite: Connect.NextHandleFunction = (req, res, next) => {
    const [path, query = ''] = (req.url ?? '').split('?')
    if (path === '/classic' || path === '/2020') {
      res.statusCode = 301
      res.setHeader('Location', '/classic/')
      res.end()
      return
    }
    if (path === '/classic/') req.url = `/classic/index.html${query ? `?${query}` : ''}`
    next()
  }
  return {
    name: 'classic-site',
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
  }
}

// Link previews (LinkedIn, Slack) don't run JavaScript, so each role page gets
// its own copy of index.html with that role's title and description.
function rolePages(): Plugin {
  const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
  return {
    name: 'role-pages',
    apply: 'build',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const base = readFileSync(resolve(dist, 'index.html'), 'utf8')
      for (const t of trackOrder) {
        const { path, title, description } = tracks[t]
        const url = `https://mfirataksoy.com${path}`
        const html = base
          .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
          .replace(/(<meta name="description" content=")[^"]*/, `$1${escape(description)}`)
          .replace(/(<meta property="og:title" content=")[^"]*/, `$1${escape(title)}`)
          .replace(/(<meta property="og:description" content=")[^"]*/, `$1${escape(description)}`)
          .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
          .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
        mkdirSync(resolve(dist, path.slice(1)), { recursive: true })
        writeFileSync(resolve(dist, path.slice(1), 'index.html'), html)
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), classicSite(), rolePages()],
  build: {
    chunkSizeWarningLimit: 900,
  },
})
