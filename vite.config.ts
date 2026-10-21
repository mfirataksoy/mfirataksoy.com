import { defineConfig, type Connect, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

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

export default defineConfig({
  plugins: [vue(), classicSite()],
  build: {
    chunkSizeWarningLimit: 900,
  },
})
