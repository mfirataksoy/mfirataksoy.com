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
  tags: string[]
  // Customer-facing tags for the customer success lens; falls back to `tags`.
  csTags?: string[]
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
      eng: 'Where the code started',
      cs: 'A technical foundation, and a network',
    },
    body: {
      eng: 'Computer science with a math minor at TCU as a Chancellor’s Scholar, on the Dean’s List, and the first lines of code that ended up in production.',
      cs: 'Computer science with a math minor as a Chancellor’s Scholar. Alongside the degree, four years at TCU’s alumni center building ties with alumni across industries.',
    },
    tags: ['Chancellor’s Scholar', 'Dean’s List'],
    csTags: ['Chancellor’s Scholar', 'Alumni relations'],
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
      eng: 'Rebuilt the licensing server',
      cs: 'Turned cryptic errors into answers',
    },
    body: {
      eng: 'Rebuilt the licensing server that authenticated every purchase, from Fortune 1000 firms to small businesses, in React, Node, Express and TypeScript.',
      cs: 'Rebuilt the licensing server every customer purchase went through, from Fortune 1000 firms to small businesses, and replaced cryptic errors with clear, actionable messages. Total errors dropped 15%.',
    },
    tags: ['React', 'Node', 'TypeScript', '−15% errors'],
    csTags: ['Customer-facing errors', '−15% errors', 'Fortune 1000 to SMB'],
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
      eng: 'A grocery device that sees what you run out of',
      cs: 'From pitch to a prototype tested in homes',
    },
    body: {
      eng: 'Technical lead for a smart-home grocery device: CNN product and barcode recognition with TensorFlow on an NVIDIA Jetson Nano, plus Wi-Fi setup, Firebase Auth and H-E-B account linking in the companion app.',
      cs: 'Pitched a smart-home grocery device and led it to a working prototype built for real homes: Wi-Fi setup from the app, H-E-B account linking, and used-up items synced to the customer’s account automatically. Designed the enclosures for in-home testing.',
    },
    tags: ['Jetson Nano', 'TensorFlow', 'Firebase', '3D printing'],
    csTags: ['Pitch → prototype', 'In-home testing', 'Setup and onboarding'],
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
      eng: 'Between the client and the code',
      cs: 'The client’s voice in the build',
    },
    body: {
      eng: 'Managed a New York client’s delivery app for local shops from kickoff through development, turning what the client needed into requirements the dev team could build.',
      cs: 'Owned the client relationship for a New York delivery app for local shops. Turned client needs into requirements and kept the client and the dev team aligned on scope and timelines across time zones.',
    },
    tags: ['Client management', 'Requirements', 'Across time zones'],
    csTags: ['Client relationship', 'Needs → requirements', 'Scope and timelines', 'Across time zones'],
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
      eng: 'Banking workloads on Kubernetes',
      cs: 'Built the tool support used every day',
      frontend: 'An app the support team used every day',
    },
    body: {
      eng: 'In the Information Management Leadership Program: onboarded applications onto the bank’s hybrid cloud with Terraform, deployed to AWS EKS, and watched cluster health for production banking services.',
      frontend: 'Built an internal React application the bank’s customer support staff used every day, while rotating through cloud work: onboarding applications to AWS EKS with Terraform.',
      cs: 'Selected for the bank’s two-year IT leadership program and partnered with senior IT leaders on planning and delivery. Built the internal React app the bank’s customer support staff used every day.',
    },
    tags: ['AWS EKS', 'Terraform', 'Kubernetes', 'React'],
    csTags: ['Support tooling', 'Senior stakeholders', 'Banking'],
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
      eng: 'Regulated products, end to end',
      cs: 'From regulation to a product people use',
      backend: 'A tax engine and the services around it',
      frontend: 'Regulated products on web and mobile',
    },
    body: {
      eng: 'Led delivery of e-Ledger, e-SMM, e-Producer Receipt, a tax calculation engine and an SMS microservice across Flutter, Vue, JSP, Java Spring and PostgreSQL, running on Docker and Nginx with Graylog and Zabbix. Claude Code at every stage.',
      backend: 'Built a tax calculation engine, an SMS microservice and the services behind e-Ledger, e-SMM and e-Producer Receipt on Java Spring and PostgreSQL, plus partner integrations such as IdeaSoft. Containerized with Docker and Nginx, monitored with Graylog and Zabbix.',
      frontend: 'Shipped regulated e-document products across Flutter mobile and Vue and JSP web, from requirements to release, with Claude Code at every stage.',
      cs: 'Owned regulated e-document products end to end, from requirements to release, and partner integrations such as IdeaSoft. Built Claude Code into design, review, testing and documentation so a lean team could deliver more.',
    },
    tags: ['Flutter', 'Vue', 'Java Spring', 'PostgreSQL', 'Claude Code'],
    csTags: ['Regulated products', 'Partner integrations', 'Requirements → release'],
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
    eng: 'Next stop: your engineering team',
    backend: 'Next stop: your backend team',
    frontend: 'Next stop: your product team',
    cs: 'Next stop: your customers',
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
  screen?: 'laptop' | 'monitor' | 'phone'
}

export const projects: Project[] = [
  {
    name: 'Smart grocery device',
    year: '2022',
    kind: 'H-E-B Innovation & Technology',
    body: 'A smart-home device that recognizes products and barcodes in real time and adds what you run out of to your H-E-B account.',
    stack: ['Jetson Nano', 'CUDA', 'TensorFlow', 'Firebase'],
  },
  {
    name: 'NoteWith.Me',
    year: '2021',
    kind: 'Open source',
    body: 'Collaborative notes without accounts: open a page, share the URL, write together. Professors used it for online classes during the pandemic. Brought back online in 2026.',
    stack: ['Vue', 'Node.js', 'Express', 'MongoDB'],
    link: { label: 'Open the app', href: 'https://notewith-me.netlify.app' },
    preview: '/previews/notewithme.jpg',
    screen: 'laptop',
    code: 'https://github.com/mfirataksoy/notewith.me',
  },
  {
    name: 'Film Fırtınası',
    year: '2026',
    kind: 'Side project',
    body: 'A movie discovery site on TMDB data: official trailers, IMDb, TMDB and community ratings side by side, reviews, movie requests with voting, and an admin panel that adds films straight from TMDB.',
    stack: ['Vue 3', 'TypeScript', 'Tailwind', 'Firebase'],
    link: { label: 'Open the site', href: 'https://filmfirtinasi.vercel.app' },
    preview: '/previews/filmfirtinasi.jpg',
    screen: 'laptop',
  },
  {
    name: 'Istanbul Etkinlik',
    year: '2026',
    kind: 'Personal tool',
    body: 'Every morning it collects Istanbul’s concerts, talks, theatre, exhibitions and workshops from over a hundred sources and ranks them by my interests. No AI involved: every score can be explained.',
    stack: ['Python', 'Vue 3', 'GitHub Actions', 'iCal feed'],
    link: { label: 'Open the demo', href: 'https://istanbul-etkinlik-demo.pages.dev' },
    preview: '/previews/istanbul.jpg',
  },
  {
    name: 'Altyazı Portalı',
    year: '2026',
    kind: 'Side project',
    body: 'Everyone gets their own video site: a portal that generates personal sites for watching YouTube videos with Turkish subtitles, all from one panel. A kids mode adds a teacher panel, time limits and games.',
    stack: ['Vue 3', 'Express', 'Cloudflare R2 and Pages', 'Gemini'],
    link: { label: 'Open the demo', href: 'https://altyazi-demo.pages.dev' },
    preview: '/previews/altyazi.jpg',
    screen: 'monitor',
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
    link: { label: 'See the farewell page', href: 'https://stickerhubio.netlify.app' },
    preview: '/previews/stickerhub.jpg',
    screen: 'phone',
    status: 'Retired',
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
]

export type DeskKey = 'laptop' | 'monitor' | 'calendar' | 'fridge' | 'phone' | 'headset' | 'server'

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
    title: { eng: 'Things I built on the side', cs: 'Things I built on the side' },
    body: {
      eng: 'Side projects are where I try new stacks before I need them at work.',
      cs: 'Side projects keep my hands on the code, so I know what I’m promising customers.',
    },
    projects: ['NoteWith.Me', 'Film Fırtınası', 'This website'],
  },
  {
    id: 'monitor',
    object: 'Monitor',
    title: { eng: 'One panel, many sites', cs: 'A product shaped around its users' },
    body: {
      eng: 'A portal that spins up a separate subtitle site per person or class: a Vue front end, an Express API, content in Cloudflare R2, and each site deployed through the Cloudflare Pages API.',
      cs: 'Each family or class gets its own video site with Turkish subtitles, and teachers get a kids mode with time limits and a panel of their own.',
    },
    projects: ['Altyazı Portalı'],
  },
  {
    id: 'calendar',
    object: 'Calendar',
    title: { eng: 'A scraper that plans my week', cs: 'A tool built for my own week' },
    body: {
      eng: 'Collectors pull events from over a hundred Istanbul sources every morning, respecting robots.txt, then dedupe them and score them against my interests with rules I can explain.',
      cs: 'I wanted to stop missing good events, so I built a tool that reads Istanbul’s event pages every morning and tells me what’s worth my time, and why.',
    },
    projects: ['Istanbul Etkinlik'],
  },
  {
    id: 'fridge',
    object: 'Fridge',
    title: { eng: 'Computer vision in the kitchen', cs: 'A device built for real homes' },
    body: {
      eng: 'At H-E-B I led a smart-home grocery device: CNN models trained in TensorFlow and Keras, running in real time on an NVIDIA Jetson Nano with CUDA and OpenCV.',
      cs: 'At H-E-B I took a smart-home grocery device from pitch to a prototype people could test at home, with an app flow that linked it to their H-E-B account.',
    },
    projects: ['Smart grocery device'],
  },
  {
    id: 'phone',
    object: 'Phone',
    title: { eng: 'Mobile and chat', cs: 'Meeting people where they already are' },
    body: {
      eng: 'Flutter is my go-to for mobile and what I shipped with at İzibiz. On the side, AcneAway turned a selfie into a retouched photo, and StickerHub lived inside WhatsApp and Telegram.',
      cs: 'Products people reach from their phones: AcneAway turned a selfie into a retouched photo, and StickerHub didn’t ask anyone to install an app, it lived in the chats people already used.',
    },
    projects: ['AcneAway', 'StickerHub'],
  },
  {
    id: 'headset',
    object: 'Headset',
    title: { eng: 'Listening to customers', cs: 'Customer success' },
    body: {
      eng: 'My best engineering started with a conversation: what the client actually needs, what the support team fights with every day, which error message makes a user give up.',
      cs: 'I’ve owned the client side of a product and built for the people who support customers. I translate between what customers need and what engineers can ship.',
    },
    points: [
      'Owned the client relationship for a New York delivery app and turned needs into requirements',
      'Built the internal React app Credit One’s customer support staff used daily',
      'Replaced cryptic errors with actionable messages at Anlaş, cutting errors by 15%',
    ],
  },
  {
    id: 'server',
    object: 'Server',
    title: { eng: 'Cloud and DevOps', cs: 'Technical depth with customers’ engineers' },
    body: {
      eng: 'At Credit One I onboarded applications onto AWS EKS with Terraform and watched cluster health for production banking services. At İzibiz I containerized the stack with Docker and Nginx and set up Graylog and Zabbix.',
      cs: 'Enough cloud experience to talk infrastructure with a customer’s engineers: AWS EKS and Terraform at Credit One, Docker, Nginx and monitoring at İzibiz. AWS Certified Cloud Practitioner.',
    },
    points: ['AWS EKS', 'Kubernetes', 'Terraform', 'Docker', 'Nginx', 'Graylog', 'Zabbix'],
  },
]

export const contact = {
  headline: 'Let’s build a bridge.',
  body: {
    cs: 'Hiring for customer success? I’d like to hear about your customers and what success means for them.',
    eng: 'Hiring for a full-stack or cloud role? I’d like to hear about the product and the team.',
    backend: 'Hiring for a backend role? I’d like to hear about the systems and the team.',
    frontend: 'Hiring for a frontend role? I’d like to hear about the product and the people who use it.',
  } satisfies ByTrack,
}
