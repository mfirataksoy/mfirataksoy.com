// Every word on the site lives here. Text that differs by hiring lens is a
// { eng, cs } pair; everything else is a plain string.

import type { Track } from './tracks'

// `cs` is customer success; `eng` is the default for every engineering role,
// and a role can override it with its own key.
export type ByTrack = { cs: string; eng: string } & Partial<Record<Track, string>>

export type PlaceKey = 'istanbul' | 'fortWorth' | 'sanAntonio' | 'lasVegas' | 'newYork' | 'heart'

export const places: Record<PlaceKey, { label: string; lat: number; lon: number }> = {
  istanbul: { label: 'Istanbul', lat: 41.01, lon: 28.98 },
  fortWorth: { label: 'Fort Worth', lat: 32.75, lon: -97.33 },
  sanAntonio: { label: 'San Antonio', lat: 29.42, lon: -98.49 },
  lasVegas: { label: 'Las Vegas', lat: 36.17, lon: -115.14 },
  newYork: { label: 'New York', lat: 40.71, lon: -74.01 },
  // Not a real place: a heart-shaped continent in the Indian Ocean where the route ends.
  heart: { label: 'Your customers', lat: -16, lon: 75 },
}

export const profile = {
  name: 'Mehmet Firat Aksoy',
  shortName: 'Firat Aksoy',
  email: 'mehmetfirataksoy@gmail.com',
  linkedin: 'https://www.linkedin.com/in/mfirataksoy/',
  github: 'https://github.com/mfirataksoy',
  resume: '/Mehmet_Firat_Aksoy_Resume.pdf',
  classic: '/classic/',
  location: 'Istanbul, Türkiye',
}

export const hero = {
  kicker: {
    cs: 'Customer success · Istanbul · open to work',
    eng: 'Full-stack engineer · Istanbul · open to work',
    backend: 'Backend engineer · Istanbul · open to work',
    frontend: 'Frontend engineer · Istanbul · open to work',
  } satisfies ByTrack,
  headline: 'I build bridges',
  sub: {
    cs: 'between customers and the teams that serve them. A customer success manager with a software engineer’s background, so I can go deep on the technical side of every conversation.',
    eng: 'between a product idea and the code that ships it. Full-stack engineer across Flutter, Vue, Java Spring and AWS, with Claude Code at every stage.',
    backend: 'between business rules and the services that run them. Backend engineer in Java Spring and PostgreSQL, from a tax engine to an SMS microservice, shipped on Docker and AWS EKS.',
    frontend: 'between people and the products they use. Frontend engineer across Vue, React and Flutter, turning complex flows into screens that feel simple.',
  } satisfies ByTrack,
}

export const about = {
  photo: '/images/firat.jpg',
  greeting: 'Hi, I’m Firat.',
  body: {
    cs: 'I trained as a software engineer, and the part of every project I cared about most was the people using it. As a customer success manager for a New York delivery platform, I owned the client relationship and turned what they needed into work the dev team could build. At Credit One Bank I built the app the support team used every day. Now I want to help customers succeed full time, with the technical depth to back it up.',
    eng: 'I’m a full-stack engineer who likes owning a product end to end: the Flutter app, the Vue dashboard, the Spring service behind them and the cluster they run on. Most recently I led regulated e-document products at İzibiz, with Claude Code built into every step so a small team could ship like a bigger one.',
    backend: 'I’m a backend engineer who likes systems that are correct before they are clever. At İzibiz I built a tax calculation engine, an SMS microservice and regulated e-document services on Java Spring and PostgreSQL, ran them on Docker and Nginx and watched them with Graylog and Zabbix. Before that I onboarded banking applications onto AWS EKS with Terraform at Credit One.',
    frontend: 'I’m a frontend engineer who has shipped across Vue, React and Flutter: e-document products on web and mobile at İzibiz, an internal React app a bank’s support team used every day, and side projects from collaborative notes to a movie discovery site.',
  } satisfies ByTrack,
  facts: {
    cs: [
      { value: 'CSM', label: 'for a New York delivery platform' },
      { value: 'EN · TR', label: 'fluent in both' },
      { value: '3+ years', label: 'building software customers use' },
      { value: 'AWS', label: 'Certified Cloud Practitioner' },
    ],
    eng: [
      { value: '3+ years', label: 'shipping to production' },
      { value: 'AWS', label: 'Certified Cloud Practitioner' },
      { value: 'B.S. CS', label: 'Texas Christian University' },
      { value: 'EN · TR', label: 'working languages' },
    ],
    backend: [
      { value: '3+ years', label: 'shipping to production' },
      { value: 'Spring', label: 'Java and PostgreSQL services' },
      { value: 'AWS', label: 'Certified Cloud Practitioner' },
      { value: 'B.S. CS', label: 'Texas Christian University' },
    ],
    frontend: [
      { value: '3+ years', label: 'shipping to production' },
      { value: 'Vue · React', label: 'and Flutter for mobile' },
      { value: 'B.S. CS', label: 'Texas Christian University' },
      { value: 'EN · TR', label: 'working languages' },
    ],
  },
}

export type Chapter = {
  id: string
  years: string
  place: string
  focus: PlaceKey | 'bridge'
  arc?: [PlaceKey, PlaceKey]
  org: string
  role: string
  title: ByTrack
  body: ByTrack
  // The school or employer logo, set into the card's description.
  logo?: { src: string; alt: string }
}

export const chapters: Chapter[] = [
  {
    id: 'tcu',
    years: '2018 – 2023',
    place: 'Fort Worth, TX',
    focus: 'fortWorth',
    org: 'Texas Christian University',
    role: 'B.S. Computer Science, minor in Mathematics',
    title: {
      eng: 'Computer science degree at TCU',
      cs: 'Computer science degree at TCU',
    },
    body: {
      eng: 'Computer science with a math minor at TCU as a Chancellor’s Scholar, a merit-based full ride. I made the Dean’s List and wrote my first code that ended up in production.',
      cs: 'Computer science with a math minor as a Chancellor’s Scholar, a merit-based full ride. Alongside the degree, I worked for four years as an alumni relations and front desk specialist at TCU’s D.J. Kelly Alumni Center, where I welcomed guests and set up events for 300+ attendees.',
    },
    logo: { src: '/logos/tcu.svg', alt: 'TCU, Texas Christian University' },
  },
  {
    id: 'anlas',
    years: '2019 – 2020',
    place: 'Istanbul',
    focus: 'istanbul',
    arc: ['fortWorth', 'istanbul'],
    org: 'Anlaş Otomasyon',
    role: 'Software engineer intern',
    title: {
      eng: 'My first internship: rebuilding the licensing server',
      cs: 'My first internship: rebuilding the licensing server',
    },
    body: {
      eng: 'Rebuilt the licensing server that authenticated every purchase, from Fortune 1000 firms to small businesses, in ASP.NET and C#.',
      cs: 'Rebuilt the licensing server every customer purchase went through, from Fortune 1000 firms to small businesses, in ASP.NET and C#.',
    },
    logo: { src: '/logos/anlas.png', alt: 'Anlaş Otomasyon' },
  },
  {
    id: 'heb',
    years: 'Summer 2022',
    place: 'San Antonio, TX',
    focus: 'sanAntonio',
    arc: ['fortWorth', 'sanAntonio'],
    org: 'H-E-B Innovation & Technology',
    role: 'Software engineer intern · technical lead',
    title: {
      eng: 'An internship at the heart of retail innovation, at H‑E‑B',
      cs: 'An internship at the heart of retail innovation, at H‑E‑B',
    },
    body: {
      eng: 'Technical lead for a smart-home grocery device: CNN product and barcode recognition with TensorFlow on an NVIDIA Jetson Nano, plus Wi-Fi setup, Firebase Auth and H-E-B account linking in the companion app.',
      cs: 'Pitched a smart-home grocery device and led it to a working prototype built for real homes: Wi-Fi setup from the app, H-E-B account linking, and used-up items synced to the customer’s account automatically. Designed the enclosures for in-home testing.',
    },
    logo: { src: '/logos/heb.svg', alt: 'H-E-B' },
  },
  {
    id: 'csm',
    years: '2022 – 2023',
    place: 'New York · remote',
    focus: 'newYork',
    arc: ['fortWorth', 'newYork'],
    org: 'Local-delivery platform',
    role: 'Customer success manager (contract)',
    title: {
      eng: 'Customer success manager for a delivery app',
      cs: 'Customer success manager for a delivery app',
    },
    body: {
      eng: 'Managed a New York client’s delivery app for local shops through development, turning what the client needed into requirements the dev team could build.',
      cs: 'Owned the client relationship for a New York delivery app for local shops. Turned client needs into requirements and kept the client and the dev team aligned on scope and timelines across time zones.',
    },
  },
  {
    id: 'creditone',
    years: '2023 – 2024',
    place: 'Las Vegas, NV',
    focus: 'lasVegas',
    arc: ['fortWorth', 'lasVegas'],
    org: 'Credit One Bank',
    role: 'IT leadership associate · IMLP',
    title: {
      eng: 'IT leadership associate at Credit One Bank',
      cs: 'IT leadership associate at Credit One Bank',
    },
    body: {
      eng: 'In the Information Management Leadership Program: onboarded applications onto the bank’s hybrid cloud with Terraform, deployed to AWS EKS, and watched cluster health for production banking services.',
      frontend: 'Built an internal React application the bank’s customer support staff used every day, while rotating through cloud work: onboarding applications to AWS EKS with Terraform.',
      cs: 'Selected for the bank’s two-year IT leadership program and partnered with senior IT leaders on planning and delivery. Built the internal React app the bank’s customer support staff used every day.',
    },
    logo: { src: '/logos/creditone.svg', alt: 'Credit One Bank' },
  },
  {
    id: 'izibiz',
    years: '2025 – 2026',
    place: 'Istanbul',
    focus: 'istanbul',
    arc: ['lasVegas', 'istanbul'],
    org: 'İzibiz',
    role: 'Software engineer',
    title: {
      eng: 'Led e-document products from start to release',
      cs: 'Owned e-document products from requirements to release',
      backend: 'Built a tax engine and backend services',
      frontend: 'Built e-document apps for web and mobile',
    },
    body: {
      eng: 'Led delivery of e-Ledger, e-SMM, e-Creditnote and expense vouchers, a tax calculation engine and an SMS microservice across Flutter, Vue, JSP, Java Spring and PostgreSQL, running on Docker and Nginx with Graylog and Zabbix. Claude Code at every stage.',
      backend: 'Built a tax calculation engine, an SMS microservice and the services behind e-Ledger, e-SMM, e-Creditnote and expense vouchers on Java Spring and PostgreSQL, plus partner integrations such as IdeaSoft. Containerized with Docker and Nginx, monitored with Graylog and Zabbix.',
      frontend: 'Shipped regulated e-document products across Flutter mobile and Vue and JSP web, from requirements to release, with Claude Code at every stage.',
      cs: 'Owned regulated e-document products end to end, from requirements to release, and partner integrations such as IdeaSoft. Built Claude Code into design, review, testing and documentation so a lean team could deliver more.',
    },
    logo: { src: '/logos/izibiz.webp', alt: 'İzibiz Business Solutions' },
  },
]

// Who waits at the end of the route, on the heart-shaped continent.
export const heartLabel: ByTrack = {
  cs: 'Your customers',
  eng: 'Your team',
  frontend: 'Your users',
}

export const nowChapter = {
  years: 'Now',
  title: {
    eng: 'Looking for a full-stack role',
    backend: 'Looking for a backend role',
    frontend: 'Looking for a frontend role',
    cs: 'Looking for a customer success role',
  } satisfies ByTrack,
  body: {
    cs: 'Based in Istanbul and looking for a customer success role where technical depth helps customers get more out of the product. Fluent in English and Turkish.',
    eng: 'Based in Istanbul and open to full-stack and cloud roles. Fluent in English and Turkish.',
    backend: 'Based in Istanbul and open to backend and platform roles. Fluent in English and Turkish.',
    frontend: 'Based in Istanbul and open to frontend and mobile roles. Fluent in English and Turkish.',
  } satisfies ByTrack,
}

type ToolGroup = { group: string; items: string[] }

export const toolkit: { cs: ToolGroup[]; eng: ToolGroup[] } & Partial<Record<Track, ToolGroup[]>> = {
  eng: [
    { group: 'Languages', items: ['Java', 'Dart', 'TypeScript', 'JavaScript', 'Python', 'SQL'] },
    { group: 'Frameworks', items: ['Spring', 'Flutter', 'Vue.js', 'React', 'Node.js', 'Express', 'JSP', 'Tailwind'] },
    { group: 'Data', items: ['PostgreSQL', 'MS SQL', 'MongoDB', 'Firebase'] },
    { group: 'Cloud and DevOps', items: ['AWS EKS', 'Kubernetes', 'Terraform', 'Docker', 'Nginx', 'Graylog', 'Zabbix', 'CI/CD'] },
    { group: 'AI and tools', items: ['Claude Code', 'TensorFlow', 'OpenCV', 'CUDA', 'NVIDIA Jetson', 'Git', 'Jira'] },
  ],
  backend: [
    { group: 'Languages', items: ['Java', 'SQL', 'Python', 'TypeScript'] },
    { group: 'Backend', items: ['Spring', 'Node.js', 'Express', 'REST APIs', 'Microservices', 'JSP'] },
    { group: 'Data', items: ['PostgreSQL', 'MS SQL', 'MongoDB', 'Firebase'] },
    { group: 'Cloud and DevOps', items: ['AWS EKS', 'Kubernetes', 'Terraform', 'Docker', 'Nginx', 'CI/CD'] },
    { group: 'Observability and tools', items: ['Graylog', 'Zabbix', 'Claude Code', 'Git', 'Jira'] },
  ],
  frontend: [
    { group: 'Languages', items: ['TypeScript', 'JavaScript', 'Dart', 'HTML and CSS'] },
    { group: 'Frameworks', items: ['Vue.js', 'React', 'Flutter', 'Tailwind', 'JSP'] },
    { group: 'App plumbing', items: ['Pinia', 'Firebase Auth', 'REST APIs', 'Stripe'] },
    { group: 'Craft', items: ['Three.js', 'GSAP', 'Vite', 'Responsive layouts'] },
    { group: 'Tools', items: ['Claude Code', 'Git', 'Jira'] },
  ],
  cs: [
    { group: 'Customer work', items: ['Client relationships', 'Needs → requirements', 'Scope and timelines', 'Stakeholder alignment'] },
    { group: 'Communication', items: ['English and Turkish', 'Across time zones', 'Clear, actionable messaging', 'Documentation'] },
    { group: 'Worked alongside', items: ['Dev teams', 'Support staff', 'Senior IT leadership', 'Integration partners'] },
    { group: 'Technical depth', items: ['Reads and writes code', 'APIs and integrations', 'SQL', 'AWS Certified', 'Cloud and Kubernetes'] },
    { group: 'Tools', items: ['Jira', 'Git', 'Claude Code', 'AI-assisted docs and testing'] },
  ],
}

export type Project = {
  name: string
  year: string
  kind: string
  body: string
  stack: string[]
  link?: { label: string; href: string }
  code?: string
  status?: string
  // A screenshot shown in the playground, and the desk screen it appears on.
  preview?: string
  screen?: 'laptop' | 'tv' | 'phone'
}

// The projects list shows them in this order on every role page.
export const projects: Project[] = [
  {
    name: 'Seçki İstanbul',
    year: '2026',
    kind: 'Side project',
    body: 'Every morning it gathers Istanbul’s concerts, talks, theatre, exhibitions and workshops from over a hundred sources and ranks them. The ranking uses no AI, so every score can be explained. Visitors get a map, an events assistant and an account that re-scores events for their own taste.',
    stack: ['Python', 'Vue 3', 'Cloudflare Pages and D1', 'GitHub Actions'],
    link: { label: 'Open the site', href: 'https://secki.istanbul' },
    preview: '/previews/secki.jpg',
  },
  {
    name: 'Film Fırtınası',
    year: '2026',
    kind: 'Side project',
    body: 'A movie discovery site on TMDB data: official trailers, IMDb, TMDB and community ratings side by side, reviews, movie requests with voting, and an admin panel that adds films straight from TMDB.',
    stack: ['Vue 3', 'TypeScript', 'Tailwind', 'Firebase'],
    link: { label: 'Open the site', href: 'https://filmfirtinasi.vercel.app' },
    preview: '/previews/filmfirtinasi.jpg',
    screen: 'tv',
  },
  {
    name: 'Noteful',
    year: '2021–2026',
    kind: 'Open source',
    body: 'Shared notes without accounts: open a page, share the link and write together live. It began in 2021 as NoteWith.Me, when professors used it for online classes. In 2026 I rebuilt it as a realtime editor with password locks encrypted in the browser, read-only links, QR codes and Markdown export.',
    stack: ['Vue 3', 'Tiptap', 'Yjs', 'Cloudflare Workers'],
    link: { label: 'Open the app', href: 'https://noteful.me' },
    preview: '/previews/noteful.jpg',
    screen: 'laptop',
    code: 'https://github.com/mfirataksoy/notewith.me',
  },
  {
    name: 'This website',
    year: '2026',
    kind: 'Open source',
    body: 'A Three.js globe that follows my career route as you scroll, a desk you can click around, and a lens switch for customer success and engineering readers.',
    stack: ['Vue 3', 'Three.js', 'GSAP', 'Vite'],
    link: { label: 'View on GitHub', href: 'https://github.com/mfirataksoy/mfirataksoy.com' },
    preview: '/previews/thissite.jpg',
    screen: 'laptop',
  },
  {
    name: 'Smart grocery device',
    year: '2022',
    kind: 'H-E-B Innovation & Technology',
    body: 'A smart-home device that recognizes products and barcodes in real time and adds what you run out of to your H-E-B account.',
    stack: ['Jetson Nano', 'CUDA', 'TensorFlow', 'Firebase'],
  },
  {
    name: 'AcneAway',
    year: '2025',
    kind: 'Side project',
    body: 'Upload a selfie and get a clear-skin retouch from an AI image pipeline, with Stripe checkout for credits. Now retired and kept as a showcase.',
    stack: ['Vue 3', 'Firebase', 'Stripe', 'Replicate'],
    link: { label: 'See the showcase', href: 'https://acneaway.vercel.app' },
    preview: '/previews/acneaway.jpg',
    screen: 'phone',
    status: 'Retired',
  },
  {
    name: 'StickerHub',
    year: '2021',
    kind: 'Side project',
    body: 'WhatsApp and Telegram bots that sent people stickers on request, and a website built from stickers users sent back to the bot. Built with Bedirhan Celayir.',
    stack: ['Vue', 'Node.js', 'Firebase', 'Google Cloud'],
    link: { label: 'See the farewell page', href: 'https://stickerhub.mfirataksoy.com' },
    preview: '/previews/stickerhub.jpg',
    screen: 'phone',
    status: 'Retired',
  },
]

export type DeskKey = 'laptop' | 'tv' | 'calendar' | 'fridge' | 'phone' | 'server'

export type DeskItem = {
  id: DeskKey
  object: string
  title: ByTrack
  body: ByTrack
  points?: string[]
  projects?: string[]
}

// The playground: each object on the desk opens one part of the story.
export const desk: DeskItem[] = [
  {
    id: 'laptop',
    object: 'Laptop',
    title: { eng: 'Side projects', cs: 'Side projects' },
    body: {
      eng: 'Side projects are where I try new stacks before I need them at work.',
      cs: 'Side projects keep my hands on the code, so I know what I’m promising customers.',
    },
    projects: ['Noteful', 'This website'],
  },
  {
    id: 'tv',
    object: 'TV',
    title: { eng: 'Film Fırtınası, a movie site', cs: 'Film Fırtınası, a movie site' },
    body: {
      eng: 'A movie discovery site on TMDB data: trailers and IMDb, TMDB and community ratings side by side, reviews, and movie requests people vote on. An admin panel adds films straight from TMDB.',
      cs: 'A movie site where trailers, ratings from three sources and the community’s reviews sit on one page, and visitors vote on which films get added next.',
    },
    projects: ['Film Fırtınası'],
  },
  {
    id: 'calendar',
    object: 'Calendar',
    title: { eng: 'Seçki İstanbul, an events site', cs: 'Seçki İstanbul, an events site' },
    body: {
      eng: 'Collectors pull events from over a hundred Istanbul sources every morning, respecting robots.txt, then dedupe them and score them with rules anyone can read. Signed-in visitors set their own interests and every event is re-scored for them.',
      cs: 'I wanted to stop missing good events, so I built a tool that reads Istanbul’s event pages every morning and explains what’s worth the time. Now it’s a public site, Seçki İstanbul, that anyone can tune to their own taste.',
    },
    projects: ['Seçki İstanbul'],
  },
  {
    id: 'fridge',
    object: 'Fridge',
    title: { eng: 'Smart grocery device at H-E-B', cs: 'Smart grocery device at H-E-B' },
    body: {
      eng: 'At H-E-B I led a smart-home grocery device: CNN models trained in TensorFlow and Keras, running in real time on an NVIDIA Jetson Nano with CUDA and OpenCV.',
      cs: 'At H-E-B I took a smart-home grocery device from pitch to a prototype people could test at home, with an app flow that linked it to their H-E-B account.',
    },
    projects: ['Smart grocery device'],
  },
  {
    id: 'phone',
    object: 'Phone',
    title: { eng: 'Mobile apps', cs: 'Mobile apps' },
    body: {
      eng: 'Flutter is my go-to for mobile, and what I shipped the e-document apps with at İzibiz.',
      cs: 'Flutter is my go-to for mobile, and what I shipped the e-document apps with at İzibiz.',
    },
  },

  {
    id: 'server',
    object: 'Archive',
    title: { eng: 'Archive', cs: 'Archive' },
    body: {
      eng: 'Products I built that are retired now. Their sites stay up as showcases.',
      cs: 'Products I built that are retired now. Their sites stay up as showcases.',
    },
    projects: ['AcneAway', 'StickerHub'],
  },

]

export const contact = {
  headline: 'Let’s talk.',
  body: {
    cs: 'Hiring for customer success? I’d like to hear about your customers and what success means for them.',
    eng: 'Hiring for a full-stack or cloud role? I’d like to hear about the product and the team.',
    backend: 'Hiring for a backend role? I’d like to hear about the systems and the team.',
    frontend: 'Hiring for a frontend role? I’d like to hear about the product and the people who use it.',
  } satisfies ByTrack,
}
