// Every site the chat widget runs on. The API picks the site from the request's
// Origin, so a page can't borrow another site's identity.

export type Site = {
  id: string
  name: string
  origins: (string | RegExp)[]
  // What the assistant knows about this site's project, on top of firatKnowledge.
  project: string
}

export const projectsOverview = `
## Fırat's projects (all of them; each name is followed by its live link if it has one)
- Smart grocery device (2022, H-E-B Innovation & Technology): a smart-home device that recognizes products and barcodes in real time and adds what you run out of to your H-E-B account. Jetson Nano, CUDA, TensorFlow, Firebase. No public link.
- NoteWith.Me (2021, open source, brought back online in 2026): collaborative notes without accounts. Open a page, share the URL, write together. Professors used it for online classes during the pandemic. Vue, Node.js, Express, MongoDB. https://notewith-me.netlify.app · code: https://github.com/mfirataksoy/notewith.me
- Film Fırtınası (2026, side project): a movie discovery site on TMDB data with official trailers, IMDb, TMDB and community ratings side by side, reviews, movie requests with voting, and an admin panel that adds films straight from TMDB. Vue 3, TypeScript, Tailwind, Firebase. https://filmfirtinasi.vercel.app
- Istanbul Etkinlik (2026, personal tool): every morning it collects Istanbul's concerts, talks, theatre, exhibitions and workshops from over a hundred sources and ranks them by Fırat's interests. No AI involved: every score can be explained. Python, Vue 3, GitHub Actions, iCal feed. Demo: https://istanbul-etkinlik-demo.pages.dev
- Altyazı Portalı (2026, side project): a portal that generates personal sites for watching YouTube videos with Turkish subtitles, all from one panel. A kids mode adds a teacher panel, time limits and games. Vue 3, Express, Cloudflare R2 and Pages, Gemini. Demo: https://altyazi-demo.pages.dev
- AcneAway (2025, side project, retired and kept as a showcase): upload a selfie and get a clear-skin retouch from an AI image pipeline, with Stripe checkout for credits. Vue 3, Firebase, Stripe, Replicate. https://acneaway.vercel.app
- StickerHub (2021, side project with Bedirhan Celayir, retired): WhatsApp and Telegram bots that sent people stickers on request, and a website built from stickers users sent back to the bot. Vue, Node.js, Firebase, Google Cloud. Farewell page: https://stickerhubio.netlify.app
- mfirataksoy.com (2026, open source): a Three.js globe that follows his career route as you scroll, a desk you can click around, and pages for customer success, full-stack, backend and frontend readers. Vue 3, Three.js, GSAP, Vite. Code: https://github.com/mfirataksoy/mfirataksoy.com
- This chat assistant itself: one Netlify Function backend shared by all of his sites, Claude Haiku answering only from a knowledge file, a contact handoff that delivers messages to Fırat's inbox, and a small script tag on each site.
`

const netlifySite = (name: string) => [`https://${name}.netlify.app`, new RegExp(`^https://[a-z0-9-]+--${name}\\.netlify\\.app$`)]
const pagesSite = (name: string) => [`https://${name}.pages.dev`, new RegExp(`^https://[a-z0-9-]+\\.${name}\\.pages\\.dev$`)]
const vercelSite = (name: string) => [`https://${name}.vercel.app`, new RegExp(`^https://${name}-[a-z0-9-]+\\.vercel\\.app$`)]

export const sites: Site[] = [
  {
    id: 'mfirataksoy',
    name: 'mfirataksoy.com, Fırat’s portfolio site',
    origins: ['https://mfirataksoy.com', 'https://www.mfirataksoy.com', ...netlifySite('mfirataksoy')],
    project: 'The visitor is on Fırat’s own portfolio site, so questions are mostly about him: experience, skills, projects, availability and how to reach him.',
  },
  {
    id: 'filmfirtinasi',
    name: 'Film Fırtınası',
    origins: [...vercelSite('filmfirtinasi')],
    project: `The visitor is on Film Fırtınası (https://filmfirtinasi.vercel.app), a movie discovery site Fırat built solo in 2026 for Turkish and English speakers. Answer questions about the site first, then about Fırat.
What it does: home page rows for featured, popular, recently added and top-rated films; genre filter and search; movie pages with the TMDB poster, runtime, and IMDb, TMDB and community ratings side by side; the official YouTube trailer loads only when clicked (privacy-friendly youtube-nocookie); Google or email sign-in with usernames, preset avatars and profiles; comments with replies, likes, spoiler tags, reporting and pinning; movie requests that users vote on; an admin panel that adds a movie by searching TMDB (details fill in automatically), edits films and moderates reports.
How it is built: Vue 3 and TypeScript with Vite, Tailwind, Pinia and vue-i18n; Firebase Authentication and Firestore (security rules and indexes kept in the repo); TMDB and OMDb APIs; hosted on Vercel. A mock mode runs the whole app on a localStorage backend behind the same service interface, demo admin login included, so it works without any Firebase setup.`,
  },
  {
    id: 'altyazi',
    name: 'Altyazı Portalı demo',
    origins: [...pagesSite('altyazi-demo')],
    project: `The visitor is on the public demo of Altyazı Portalı (https://altyazi-demo.pages.dev), a subtitle portal Fırat built in 2026. Answer questions about the portal first, then about Fırat.
What it does: from one admin panel, it creates personal sites for watching YouTube videos with Turkish (or other language) subtitles. Users search for or paste a YouTube link; the subtitles are fetched, translated, saved and shown in a player. Each site has its own video library, backgrounds, schedules and analytics. A kids mode adds a teacher panel, a time limit, small games with leaderboards (such as Snake and a reaction game) and fun touches like quotes and a gift-opening animation. The interface is in Turkish, English and Japanese.
How it is built: Vue 3 and Vite front end; an Express API; all data stored as JSON and subtitle files in Cloudflare R2; subtitles translated in batches with progress streamed to the browser over server-sent events; Gemini generates background images; the full app ships as a Docker image. The admin panel deploys each generated site to Cloudflare Pages itself, by reimplementing Cloudflare's direct-upload flow through its API. The public demo needs no backend: each demo site lives entirely in its URL and the paid steps are switched off.`,
  },
  {
    id: 'istanbul-etkinlik',
    name: 'Istanbul Etkinlik demo',
    origins: [...pagesSite('istanbul-etkinlik-demo')],
    project: `The visitor is on the public demo of Istanbul Etkinlik (https://istanbul-etkinlik-demo.pages.dev), Fırat's personal Istanbul events calendar, built solo in 2026. Answer questions about it first, then about Fırat.
What it does: every morning it collects Istanbul seminars, concerts, theatre, exhibitions, workshops, dance, sport, nature trips, fairs and flight deals from over a hundred sources, scores each event 0 to 100 against his interests with a one-line "why" in Turkish, and publishes a ranked calendar, an iCal feed and a source-health page. A newer version adds accounts and personal ranking on the public site.
How it is built: a Python 3.12 pipeline with over a hundred collectors and an offline test suite; a Vue 3, TypeScript, Vite, Tailwind and shadcn-vue web app; a GitHub Actions job at 06:00 Istanbul time builds and deploys to Cloudflare Pages.
Engineering choices: no AI, every score is rule-based and explainable with weights kept in a config file; penalties for repeats and far districts, series detection and deduplication across sources; polite scraping (honest user agent, robots.txt respected, at most one request per second, no bot-protection evasion, blocked sources marked as blocked); a guard refuses to publish when too few sources or events come through; a check keeps personal data out of the public demo.
Don't share: his personal interest list, how the private version is accessed, or any arrangements with event venues.`,
  },
  {
    id: 'acneaway',
    name: 'AcneAway showcase',
    origins: [...vercelSite('acneaway')],
    project: `The visitor is on the AcneAway showcase (https://acneaway.vercel.app). AcneAway was a side project Fırat built solo and ran in 2025; it is now retired and kept as a showcase page. Answer questions about it first, then about Fırat.
What it did: users uploaded a selfie and got the same face back without acne, and bought credits through Stripe Checkout.
How it was built: Vue 3, Vite, Tailwind, Pinia and Firebase Authentication on the front end; an Express backend on Vercel for uploads to Firebase Storage, Stripe checkout, the customer portal and webhooks (credits granted by a Stripe webhook); a Firebase Cloud Function sent each photo through an image pipeline on Replicate (SDXL with InstantID, IP-Adapter and ControlNet), which keeps the person's identity while retouching the skin, then saved the result and updated Firestore. There was also an Expo companion app.`,
  },
  {
    id: 'notewithme',
    name: 'NoteWith.Me',
    origins: [...netlifySite('notewith-me')],
    project: `The visitor is on NoteWith.Me (https://notewith-me.netlify.app), Fırat's collaborative notes app, built in 2021 and brought back online in October 2026. Answer questions about it first, then about Fırat.
What it does: shared notes with no account. Opening the site creates a page with a random short ID; share the URL and write together in a rich-text editor. Notes save automatically a couple of seconds after typing stops, and there is a copy-link button. Professors used it for online classes during the pandemic.
How it is built: Vue 2 with Vuetify; an Express and Mongoose API on MongoDB Atlas, running as a Netlify Function; the database connection is reused across warm serverless calls, and the API fails fast with a clear error when the database is unreachable. Code: https://github.com/mfirataksoy/notewith.me`,
  },
  {
    id: 'stickerhub',
    name: 'StickerHub farewell page',
    origins: [...netlifySite('stickerhubio')],
    project: `The visitor is on the StickerHub farewell page (https://stickerhubio.netlify.app). StickerHub was a 2021 side project Fırat built with Bedirhan Celayir; it is retired. The stickerhub.io domain now belongs to someone else and has nothing to do with Fırat. Answer questions about StickerHub first, then about Fırat.
What it did: people browsed stickers by category or tag on the website and tapped one; WhatsApp or Telegram opened with the request already written, and a bot replied with the sticker. Stickers people sent to the bot were added to the site, and the bot replied with a link for tagging them. No app to install. The farewell page counts 305 user stickers, 13 categories and 2 chatbots.
How it was built: a Vue 2, Vuetify and Firebase (Firestore and Storage) website on Netlify, and chatbots built with WhatsApp Web automation, Firebase and Google Cloud Storage. The farewell page is plain HTML, CSS and JavaScript and also serves the original 2021 site.`,
  },
]

const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

export function siteForOrigin(origin: string | null, requested: unknown): Site | null {
  if (!origin) return null
  // Local dev serves every project from localhost, so trust the requested id there.
  if (LOCAL.test(origin)) return sites.find((s) => s.id === requested) ?? sites[0]
  return sites.find((s) => s.origins.some((o) => (typeof o === 'string' ? o === origin : o.test(origin)))) ?? null
}
