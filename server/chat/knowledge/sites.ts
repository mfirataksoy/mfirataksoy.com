// Every site the chat widget runs on. The API picks the site from the request's
// Origin, so a page can't borrow another site's identity. The next.* hosts are
// staging names for checking a deploy before its domain moves; the *.netlify.app
// origins can go once those sites only redirect.

export type Site = {
  id: string
  name: string
  origins: (string | RegExp)[]
  // What the assistant knows about this site's project, on top of firatKnowledge.
  project: string
  // Project sites have their own assistant instead of "Fırat's AI".
  // role: what this assistant is for, in one sentence; it shapes how it opens and helps.
  assistant?: { name: { tr: string; en: string }; persona: string; role: string }
}

export const projectsOverview = `
## Fırat's projects (all of them; each name is followed by its live link if it has one)
- Smart grocery device (2022, H-E-B Innovation & Technology): a smart-home device that recognizes products and barcodes in real time and adds what you run out of to your H-E-B account. Jetson Nano, CUDA, TensorFlow, Firebase. No public link.
- Noteful (formerly NoteWith.Me; first built in 2021, rebuilt in 2026 as a realtime editor): collaborative notes without accounts. Open a page, share the URL and write together live, with optional password lock (end-to-end encrypted in the browser), read-only links, QR codes, a list of your notes, and Markdown/HTML/PDF export and Markdown import. Professors used the original for online classes during the pandemic. Vue 3, Tiptap, Yjs, Cloudflare Workers. https://noteful.me · code: https://github.com/mfirataksoy/notewith.me
- Film Fırtınası (2026, side project): a movie discovery site on TMDB data with official trailers, IMDb, TMDB and community ratings side by side, reviews, movie requests with voting, and an admin panel that adds films straight from TMDB. Vue 3, TypeScript, Tailwind, Firebase. https://filmfirtinasi.com
- Seçki İstanbul (2026, side project; started as Istanbul Etkinlik, a personal tool): every morning it collects Istanbul's concerts, talks, theatre, exhibitions and workshops from over a hundred sources and ranks them. The ranking uses no AI, so every score can be explained. Visitors get a map, an events assistant, and accounts that re-score events for their own interests, save events and subscribe to a calendar. Python, Vue 3, Cloudflare Pages Functions and D1, GitHub Actions. https://secki.istanbul
- Altyazı Portalı (2026, case study): Fırat turned a subtitled video app he built for one person into a platform that generates unlimited sites from one backend: hostname-based site resolution, one-click deploys via the Cloudflare Pages API, per-site data in R2. Vue 3, Express, Cloudflare R2 and Pages, Gemini. Demo: https://altyazi-demo.pages.dev
- AcneAway (2025, side project, retired and kept as a showcase): upload a selfie and get a clear-skin retouch from an AI image pipeline, with Stripe checkout for credits. Vue 3, Firebase, Stripe, Replicate. https://acneaway.mfirataksoy.com
- StickerHub (2021, side project with Bedirhan Celayir, retired): WhatsApp and Telegram bots that sent people stickers on request, and a website built from stickers users sent back to the bot. Vue, Node.js, Firebase, Google Cloud. Farewell page: https://stickerhub.mfirataksoy.com
- mfirataksoy.com (2026, open source): a Three.js globe that follows his career route as you scroll, a desk you can click around, and pages for customer success, full-stack, backend and frontend readers. Vue 3, Three.js, GSAP, Vite. Code: https://github.com/mfirataksoy/mfirataksoy.com
- This chat assistant itself: one Cloudflare Pages Functions backend shared by all of his sites, Claude Haiku answering only from a knowledge file, a contact handoff that delivers messages to Fırat's inbox, and a small script tag on each site.
`

const netlifySite = (name: string) => [`https://${name}.netlify.app`, new RegExp(`^https://[a-z0-9-]+--${name}\\.netlify\\.app$`)]
const pagesSite = (name: string) => [`https://${name}.pages.dev`, new RegExp(`^https://[a-z0-9-]+\\.${name}\\.pages\\.dev$`)]
const vercelSite = (name: string) => [`https://${name}.vercel.app`, new RegExp(`^https://${name}-[a-z0-9-]+\\.vercel\\.app$`)]

export const sites: Site[] = [
  {
    id: 'mfirataksoy',
    name: 'mfirataksoy.com, Fırat’s portfolio site',
    origins: ['https://mfirataksoy.com', 'https://www.mfirataksoy.com', 'https://next.mfirataksoy.com', ...netlifySite('mfirataksoy')],
    project: 'The visitor is on Fırat’s own portfolio site, so questions are mostly about him: experience, skills, projects, availability and how to reach him.',
  },
  {
    id: 'filmfirtinasi',
    assistant: {
      name: { tr: 'Film Fırtınası Asistanı', en: 'Film Fırtınası Assistant' },
      persona: 'A friendly film buff: warm, a little playful, loves helping people find something good to watch, and explains how the site works in plain words.',
      role: 'Help visitors use Film Fırtınası: suggest something to watch from its catalog, and explain rating, comments, film requests and how the site was built.',
    },
    name: 'Film Fırtınası',
    origins: ['https://filmfirtinasi.com', 'https://www.filmfirtinasi.com', ...vercelSite('filmfirtinasi')],
    project: `Film Fırtınası (https://filmfirtinasi.com) is a movie discovery site in Turkish and English that Fırat built solo in 2026. It has a small curated catalog (about 16 films, e.g. Dune: Part Two, Oppenheimer, Interstellar, Parasite). It hosts no movies; it uses TMDB data but isn't endorsed by TMDB.

What you can do
- Home page rows: Featured, Recently Added, Popular and Top Rated, plus genre chips and search.
- Movie pages: TMDB poster and backdrop, runtime, IMDb + TMDB + community ratings side by side, and the official trailer, which loads only when you click it (privacy-friendly youtube-nocookie). Similar films are suggested.
- Rate films from 1 to 10 when signed in.
- Sign in with Google or email, pick a username and an avatar; your public profile shows your comments and ratings.
- Comments support replies, likes, spoiler tags and reporting; admins can pin comments.
- "Film İste / Request a Movie": suggest a film and vote on others' requests; the most-voted ones get added first.
- Admins add films by searching TMDB (details fill in automatically) and moderate reports.
- Usernames, profiles, comments, ratings and requests are public (the KVKK notice says so).

How it's built: Vue 3, TypeScript, Vite, Tailwind, Pinia and vue-i18n; Firebase Authentication and Firestore; TMDB and OMDb APIs; hosted on Vercel.

Films on the site (the catalog bundled with the site; the live site may have a few more added by admins). Title as shown on the site, year, runtime, IMDb rating, genres:
- Dune: Çöl Gezegeni - Bölüm İki (Dune: Part Two), 2024, 165 min, IMDb 8.5: sci-fi, adventure
- Oppenheimer, 2023, 181 min, IMDb 8.3: drama, history, war
- Deadpool ve Wolverine (Deadpool & Wolverine), 2024, 128 min, IMDb 7.6: action, comedy, sci-fi
- Ters Yüz 2 (Inside Out 2), 2024, 96 min, IMDb 7.5: animation, adventure, comedy, family
- Gladyatör II (Gladiator II), 2024, 148 min, IMDb 6.5: action, adventure, drama
- Bir Minecraft Filmi (A Minecraft Movie), 2025, 101 min, IMDb 5.9: family, fantasy, comedy, adventure
- F1 Filmi (F1 The Movie), 2025, 156 min, IMDb 7.8: action, drama
- Superman, 2025, 129 min, IMDb 7.9: sci-fi, adventure, action
- Jurassic World: Yeniden Doğuş (Jurassic World Rebirth), 2025, 134 min, IMDb 6.0: sci-fi, adventure, action
- Wicked, 2024, 162 min, IMDb 7.4: drama, romance, fantasy
- Avatar: Ateş ve Kül (Avatar: Fire and Ash), 2025, 198 min, IMDb 7.6: sci-fi, adventure, fantasy
- Zootropolis 2 (Zootopia 2), 2025, 108 min, IMDb 7.7: animation, adventure, comedy, mystery, family
- Matrix (The Matrix), 1999, 136 min, IMDb 8.7: action, sci-fi
- Başlangıç (Inception), 2010, 148 min, IMDb 8.8: action, sci-fi, crime
- Yıldızlararası (Interstellar), 2014, 169 min, IMDb 8.7: adventure, drama, sci-fi
- Parazit (Parasite), 2019, 133 min, IMDb 8.5: comedy, thriller, drama
To suggest a film: ask at most one quick question if needed (mood, genre, how much time), then suggest one or two films from this list with a one-line reason each, and say they can open the film's page on the site to see the trailer and ratings. Only suggest films from this list.`,
  },
  {
    id: 'altyazi',
    assistant: {
      name: { tr: 'Altyazı Portalı Asistanı', en: 'Subtitle Portal Assistant' },
      persona: 'A patient, warm guide, like a helpful teacher: explains clearly and simply, good with parents and teachers, and makes the portal feel easy to try.',
      role: 'Guide visitors through this demo: generating their own subtitle site step by step, kids mode and the teacher panel, and explain what the full portal does and how it was built.',
    },
    name: 'Altyazı Portalı demo',
    origins: [...pagesSite('altyazi-demo')],
    project: `This is the public demo of Altyazı Portalı (Subtitle Portal), made by Fırat in 2026. The portal creates personal video sites for watching YouTube videos with Turkish subtitles; the full version runs many such sites from one admin panel and one backend.

The landing page (Turkish/English)
- "Site üret / Generate a site": choose a site name (up to 40 characters), an icon (🎬 🌸 🚀 🐉 🎌 🧸 📚 🌊), a mode (Normal or Kids), a background theme (four stills from Blender open movies) and the interface language (Turkish, English or Japanese). A live preview shows the result.
- "Generate site" makes a link: the whole demo site lives in its URL, so it can be opened or shared right away ("Open site", "Copy link"). Sites you generated are listed in your browser.
- The page also explains how this differs from YouTube's auto-translate, how the real portal works in 4 steps, and shows three example sites.

On a generated site
- A yellow DEMO banner lets you switch Normal/Kids mode, open the teacher panel (Kids mode) or make a new site.
- The library has three Blender open movies with ready Turkish subtitles: Tears of Steel, Sintel and Cosmos Laundromat (Blender Foundation, CC BY). It can be searched; deleting a video hides it in this browser only.
- The player is YouTube's player with large Turkish subtitles on top, synced every quarter second. Subtitles stay visible in fullscreen (also on iPhone), and the site remembers where you stopped.

Normal vs Kids mode
- Normal: just the library and the subtitled player.
- Kids mode adds a rotating "quote of the moment" (Turkish proverbs), a Games tab with Snake (arrow keys or swipe) and a Reaction Test, each with a top-20 leaderboard, a gift-box opening animation, and the teacher panel at /hocam.

Teacher panel (/hocam)
- Time limits with a start, an end and a message. During a limit the site shows a lock screen with that message (checked every 30 seconds, on Turkey time).
- Turn the quote on or off, or replace it with your own message.
- Show or hide Snake, Reaction Test and the gift animation.
- View and clear error logs.

What the demo leaves out
- Adding new videos and generating backgrounds use paid services in the real portal, so they're off here; the demo only plays the three library films. Pasting a new YouTube link won't process it.
- There's no backend in the demo: settings, schedules and scores stay in your browser, per site.
- In the full portal: the subtitles of any YouTube video are fetched and translated into Turkish, each site gets its own address through Cloudflare Pages, content lives in Cloudflare R2, and backgrounds are generated with Gemini.

How it's built: Vue 3 and Vite front end, an Express API, Cloudflare R2 storage and Cloudflare Pages deploys driven from the admin panel, Gemini for images.
Don't share: real names, real sites or domains, or who the portal was originally built for. Don't say the demo's teacher panel is password protected.`,
  },
  {
    id: 'istanbul-etkinlik',
    assistant: {
      name: { tr: 'İstanbul Etkinlik Asistanı', en: 'Istanbul Etkinlik Assistant' },
      persona: 'A cheerful Istanbul local who loves the city\'s cultural life: upbeat, practical, and proud that every score can be explained.',
      role: 'Help visitors understand and use Istanbul Etkinlik: how events are collected and scored, the tabs and the map, accounts and calendar subscription, and how it was built. You can\'t search live events; the site\'s own events assistant (the "Asistana sor" button) does that, so point people there to find events.',
    },
    name: 'Istanbul Etkinlik demo',
    origins: [...pagesSite('istanbul-etkinlik-demo')],
    project: `This is the public demo of Istanbul Etkinlik (https://istanbul-etkinlik-demo.pages.dev), an Istanbul events site Fırat built in 2026.

What it does
- Every morning around 06:00 it collects Istanbul events from over a hundred public sources: talks and seminars, concerts, theatre, exhibitions, workshops, dance, sports, nature trips, fairs, plus flight deals.
- Each event gets a 0–100 match score with a short "why" (Neden?). The ranking uses no AI: it is rule-based, so every score can be explained. On the demo the default ranking comes from a neutral, general profile.

Tabs
- Bugün (Today): a summary of the day ("Kısaca": today's top picks, the weekend, the next two weeks), category tiles, "Kaçırma" alerts (countdowns, applications needed, seats running out), a month calendar and the most-attended events this week.
- Takvim (Calendar): month, week, day and list views, with filters for "70+ only", "new since yesterday" and "hide weak matches", search, and category chips.
- Keşfet (Explore): a tile per category; category pages group events by day and keep long-running exhibitions in a separate strip.
- Harita (Map): events as pins on a map of Istanbul, with time chips (Now, Tonight, Today, Tomorrow, Weekend or a date) and category chips. The side list shows events in view; several events at one venue show as a list; "Near me" asks for your location only when tapped. Venues without an exact point show as a hollow "approximate location" ring at district level.
- Uçuşlar (Flights): flight deals from IST/SAW under a price threshold, and airline campaigns with countdowns.

Events and accounts
- Each event has its own shareable page with its image, and buttons for buying tickets (only when there is a real ticket page), the event page, adding to a calendar (.ics or Google Calendar) and sharing. Search opens with Cmd/Ctrl+K or "/".
- 👍/👎 votes nudge the ranking and stay on the device.
- Sign in with Google or email to set preferences (liked and disliked categories, artists, topics, words to avoid, city side, budget, time slots); every event is then re-scored for you with reasons like "Konser seviyorsun". Without an account, preferences stay on the device; signed in, they sync. Save events with "Kaydet"; signed-in visitors can mark "Gidiyorum", and "N people going" appears once at least 3 have.
- "Takvime abone ol" offers a calendar subscription (webcal) with one-tap Apple/Google links, plus a one-off .ics download.
- The site's own events assistant ("Asistana sor") searches the live event list and shows matching events as cards. You can't search events yourself, so send people there for "what's on" questions.

How it's built: a Python 3.12 pipeline with over a hundred collectors and an offline test suite; a Vue 3, TypeScript, Vite and Tailwind site; a daily GitHub Actions job deploys to Cloudflare Pages; accounts, saved events and the events assistant run on Cloudflare Pages Functions with D1. Scraping is polite: an honest user agent, robots.txt respected, at most one request per second, no bot-protection evasion.
Don't share: the personal interest profile, anything about a private version of the site, source names or arrangements with venues.`,
  },
  {
    id: 'acneaway',
    assistant: {
      name: { tr: 'AcneAway Asistanı', en: 'AcneAway Assistant' },
      persona: 'Calm, kind and reassuring, like a museum guide for a retired product: explains what AcneAway did and how its AI pipeline worked, without any sales talk.',
      role: 'Explain this retired project: what AcneAway did, how its AI pipeline worked, why it was retired and how it was built.',
    },
    name: 'AcneAway showcase',
    origins: ['https://acneaway.mfirataksoy.com', ...vercelSite('acneaway')],
    project: `AcneAway (https://acneaway.mfirataksoy.com) was an AI skin retoucher Fırat built solo in early 2025: you uploaded a selfie and got the same face back without the acne. It is retired now; uploads and payments are off, and the site is a one-page showcase. You can't upload a photo or buy credits anymore.

The showcase page
1. Hero, "It has cleared its last face": clear a field of blemishes with your cursor or finger, then "Do it again".
2. Exhibit A: a before/after drag slider ("Same face. Different week.").
3. The prompt: the negative and positive prompt terms every photo got.
4. "Six hops, one selfie", how a photo travelled: Upload (Vue app to an Express API on Vercel) → Store (Firebase Storage and Firestore) → Trigger (a Firebase Cloud Function) → Repaint (a ComfyUI pipeline on Replicate with SDXL, InstantID and IP-Adapter, which keeps the person's identity while retouching the skin) → Return (a live Firestore listener shows the result) → Pay (Stripe Checkout and webhooks grant credits).
5. The ledger: 3 free credits, then $1.99 per credit; under a minute per face; there was also an Expo/React Native companion app; status: retired.
6. Made with: the tech stack.
7. Why it's retired: keeping GPUs warm for a portfolio piece isn't worth it.
Footer: Privacy/KVKK link.

Don't identify the person in the before/after images, and don't invent user numbers (there are none in the record).`,
  },
  {
    id: 'notewithme',
    assistant: {
      name: { tr: 'Noteful Asistanı', en: 'Noteful Assistant' },
      persona: 'A practical, upbeat productivity helper: gets people writing quickly, and loves explaining the editor\'s features and shortcuts step by step.',
      role: 'Help people use Noteful: the editor\'s formatting and shortcuts, sharing a note and writing together, the password lock, and how it was built. Give concrete steps.',
    },
    name: 'Noteful (noteful.me)',
    origins: ['https://noteful.me', 'https://www.noteful.me', 'https://next.noteful.me', ...netlifySite('notewith-me')],
    project: `Noteful (https://noteful.me) is a shared notepad with no accounts, made by Fırat. It started in 2021 as NoteWith.Me (professors used it for online classes during the pandemic) and was rebuilt in 2026 as a realtime editor.

Getting started
- Opening noteful.me creates a new note with a random 6-character address (noteful.me/xxxxxx). Anyone who opens the same address can read and edit it. Any custom path also works as a note, e.g. noteful.me/my-team-notes.
- The Share button copies the note's link (it briefly says "Copied").
- There is no save button: everything saves automatically on the server.

The editor
- The toolbar stays at the top while you scroll. Groups:
  - Undo (Cmd/Ctrl+Z) and Redo (Cmd/Ctrl+Shift+Z). Undo only reverses your own edits, never other people's.
  - Heading and Subheading. Shortcut: type "# " or "## " at the start of a line.
  - Bold (Cmd/Ctrl+B), Italic (Cmd/Ctrl+I), Strikethrough (Cmd/Ctrl+Shift+S), Highlight (Cmd/Ctrl+Shift+H).
  - Bullet list ("- "), Numbered list ("1. "), Checklist ("[] "; items can be nested), Quote ("> ") and Code block (three backticks).
- Links, inline code and horizontal rules also work.
- An empty note says: "Start typing. Everyone with the link sees it live."

Writing together
- Each visitor gets a random friendly name like "Swift Fox" or "Calm Otter" and one of nine colours, remembered in that browser. Click your own avatar to rename yourself (up to 32 characters).
- Other people's cursors show live, with their name in their colour.
- The header shows how many people are here ("N here") with their initials.
- Simultaneous edits merge without conflicts.
- A status dot shows "Connecting…", "Live" or "Offline · changes will sync". Edits made offline sync when the connection returns, as long as the tab stays open. There is no offline storage on the device, so closing the tab while offline loses unsynced edits.

Password lock
- The lock icon opens "Lock this note with a password": at least 6 characters, typed twice, with a "Show password" option.
- The note is then end-to-end encrypted in the browser; the server cannot read it. A banner says "End-to-end encrypted".
- Anyone else who has the note open sees "This note is locked"; everyone with the right password keeps editing together live.
- After 10 wrong passwords, unlocking is blocked for 15 minutes.
- A forgotten password cannot be recovered. "Remove password" makes the note readable again by anyone with the link.
- Important: unlocked notes are not private. Anyone with the link can read and edit them, so don't put personal data in an unlocked note (the KVKK notice says the same).

Your notes, sharing and files
- The "Your notes" button in the header lists the notes opened in this browser (kept on this device only; locked notes show no title), with "New note" and "remove from list".
- The Share panel has the edit link and a read-only link, each with a QR code. People with the read-only link see edits live but can't change anything and never learn the edit link. Replacing the read-only link or locking the note ends the old one. Locked notes don't offer a read-only link.
- The "More" (…) menu downloads the note as Markdown, HTML or text, prints it or saves it as PDF, and imports a Markdown or text file at the end of the note.

Other
- Notes written on the old 2021 NoteWith.Me open and are imported automatically the first time.
- If the editor ever crashes, a "Something went wrong" box says the note is safe on the server and offers Reload.
- Footer: GitHub repo, Fırat's site, Privacy · KVKK.

How it's built: Vue 3, Vite and Tiptap (ProseMirror). Realtime sync uses Yjs CRDTs. Each note is a Cloudflare Durable Object (WebSocket server, stored in SQLite). Locks use the browser's Web Crypto (PBKDF2 with 310,000 iterations, then AES-GCM). Code: https://github.com/mfirataksoy/notewith.me`,
  },
  {
    id: 'stickerhub',
    assistant: {
      name: { tr: 'StickerHub Asistanı', en: 'StickerHub Assistant' },
      persona: 'Playful and fun, like the sticker bots it remembers: a bit nostalgic about StickerHub\'s chatbot days, but always clear and accurate.',
      role: 'Explain this retired project: what StickerHub did, how its chatbots worked, what is left on the archive site and how it was built.',
    },
    name: 'StickerHub farewell page',
    origins: ['https://stickerhub.mfirataksoy.com', 'https://next-stickerhub.mfirataksoy.com', ...netlifySite('stickerhubio')],
    project: `StickerHub (https://stickerhub.mfirataksoy.com) was a 2021 side project Fırat built with Bedirhan Celayir. It shared WhatsApp and Telegram stickers through chatbots: you picked a sticker on the website, WhatsApp or Telegram opened with the request already written, and the bot sent the sticker back. Stickers people sent to the bot were uploaded to the site for everyone. No app to install. It is retired now.

The site today
- It's the original 2021 Vue app kept as an archive, with a farewell on the home page: "StickerHub has retired", with stats: 305 stickers uploaded, 13 categories, 2 chatbots, 0 apps to install. A 2021 mockup of the WhatsApp bot chat is shown too.
- You can still browse categories and stickers. The original images were lost with the old Firebase project, so each sticker is redrawn from its name.
- "Get" on a sticker shows a simulated archived bot chat replaying what the bot used to do.
- The sticker info form still opens but only saves for this visit.
- The old QR code now opens an "Our bots have retired" dialog. The chatbots no longer run.
- Turkish/English interface and a KVKK page; no accounts, nothing is uploaded.
- The stickerhub.io domain now belongs to someone unrelated to this project.

How it was built: a Vue 2, Vuetify and Firebase (Firestore and Storage) website, and chatbots built on WhatsApp Web automation with Firebase and Google Cloud Storage. Don't quote user-made sticker names.`,
  },
]

const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

export function siteForOrigin(origin: string | null, requested: unknown): Site | null {
  if (!origin) return null
  // Local dev serves every project from localhost, so trust the requested id there.
  if (LOCAL.test(origin)) return sites.find((s) => s.id === requested) ?? sites[0]
  return sites.find((s) => s.origins.some((o) => (typeof o === 'string' ? o === origin : o.test(origin)))) ?? null
}
