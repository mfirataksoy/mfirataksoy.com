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
    cs: 'Customer success manager with a software engineering background. I’ve managed a client account for a delivery app, built an internal app for a bank’s support team and released e-document products at İzibiz.',
    eng: 'Full-stack engineer. I work with Flutter, Vue, Java Spring, PostgreSQL and AWS, most recently at İzibiz.',
    backend: 'Backend engineer. I build services in Java Spring and PostgreSQL and run them on Docker and AWS EKS. At İzibiz I built a tax calculation engine and an SMS microservice.',
    frontend: 'Frontend engineer. I build web apps in Vue and React and mobile apps in Flutter.',
  } satisfies ByTrack,
}

export const about = {
  photo: '/images/firat.jpg',
  greeting: 'Hi, I’m Firat.',
  body: {
    cs: 'I studied computer science at TCU and have worked as a software engineer and as a customer success manager. For a New York delivery platform, I managed the client account and wrote the requirements the dev team built from. At Credit One Bank I built the internal app the customer support team used. I’m now looking for a full-time customer success role.',
    eng: 'I’m a full-stack engineer. I’ve worked on mobile apps in Flutter, web apps in Vue and React, backend services in Java Spring and deployments on AWS. Most recently I led regulated e-document products at İzibiz and used Claude Code for design, review, testing and documentation.',
    backend: 'I’m a backend engineer. At İzibiz I built a tax calculation engine, an SMS microservice and e-document services on Java Spring and PostgreSQL. They ran on Docker and Nginx and were monitored with Graylog and Zabbix. Before that, at Credit One Bank, I moved banking applications onto AWS EKS with Terraform.',
    frontend: 'I’m a frontend engineer. I’ve built e-document products for web and mobile at İzibiz, an internal React app for Credit One Bank’s support team, and side projects such as a shared notes app and a movie site.',
  } satisfies ByTrack,
  facts: {
    cs: [
      { value: 'CSM', label: 'for a New York delivery platform' },
      { value: 'EN · TR', label: 'fluent in both' },
      { value: '3+ years', label: 'as a software engineer' },
      { value: 'AWS', label: 'Certified Cloud Practitioner' },
    ],
    eng: [
      { value: '3+ years', label: 'as a software engineer' },
      { value: 'AWS', label: 'Certified Cloud Practitioner' },
      { value: 'B.S. CS', label: 'Texas Christian University' },
      { value: 'EN · TR', label: 'working languages' },
    ],
    backend: [
      { value: '3+ years', label: 'as a software engineer' },
      { value: 'Spring', label: 'Java and PostgreSQL services' },
      { value: 'AWS', label: 'Certified Cloud Practitioner' },
      { value: 'B.S. CS', label: 'Texas Christian University' },
    ],
    frontend: [
      { value: '3+ years', label: 'as a software engineer' },
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
      eng: 'Computer science degree at TCU',
      cs: 'Computer science degree and an alumni center job',
    },
    body: {
      eng: 'B.S. in Computer Science with a minor in Mathematics. Chancellor’s Scholar and Dean’s List.',
      cs: 'B.S. in Computer Science with a minor in Mathematics, as a Chancellor’s Scholar. During the degree I worked four years at the front desk of TCU’s D.J. Kelly Alumni Center, greeting guests and setting up events of 300+ people.',
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
      cs: 'Rebuilt the licensing server and its error messages',
    },
    body: {
      eng: 'Rebuilt the licensing server that checked every customer purchase, using React, Node, Express and TypeScript. Its customers ranged from Fortune 1000 firms to small businesses.',
      cs: 'Rebuilt the licensing server that checked every customer purchase. Its customers ranged from Fortune 1000 firms to small businesses. I also rewrote its error messages so customers could tell what went wrong, and total errors went down 15%.',
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
      eng: 'Led a smart grocery device project',
      cs: 'Took a smart grocery device from idea to prototype',
    },
    body: {
      eng: 'Technical lead for a smart-home grocery device. It recognized products and barcodes with TensorFlow models on an NVIDIA Jetson Nano. The companion app handled Wi-Fi setup, Firebase sign-in and linking an H-E-B account.',
      cs: 'Pitched a smart-home grocery device and led the team that built the prototype. Customers set it up from an app, linked their H-E-B account, and items they ran out of were added to that account. I also designed the cases used for testing in homes.',
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
      eng: 'Customer success manager for a delivery app',
      cs: 'Customer success manager for a delivery app',
    },
    body: {
      eng: 'Managed a New York client’s delivery app for local shops while it was being built. I wrote the requirements the dev team worked from.',
      cs: 'Managed the client account for a New York delivery app for local shops. I wrote requirements from the client’s requests and kept the client and the dev team agreed on scope and deadlines, across time zones.',
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
      eng: 'Moved bank applications to AWS',
      cs: 'IT leadership program and an app for the support team',
      frontend: 'Built an internal app for the support team',
    },
    body: {
      eng: 'Part of the bank’s Information Management Leadership Program. I moved applications onto the bank’s hybrid cloud with Terraform, deployed them to AWS EKS and monitored the production clusters.',
      frontend: 'Built an internal React app for the bank’s customer support staff. I also worked on moving applications to AWS EKS with Terraform.',
      cs: 'Joined the bank’s two-year IT leadership program and worked with senior IT leaders on planning and delivery. I built the internal React app the customer support staff used.',
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
      eng: 'Led e-document products from start to release',
      cs: 'Owned e-document products from requirements to release',
      backend: 'Built a tax engine and backend services',
      frontend: 'Built e-document apps for web and mobile',
    },
    body: {
      eng: 'Led e-Ledger, e-SMM, e-Creditnote and expense vouchers, and built a tax calculation engine and an SMS microservice. The stack was Flutter, Vue, JSP, Java Spring and PostgreSQL on Docker and Nginx, monitored with Graylog and Zabbix. I used Claude Code throughout.',
      backend: 'Built a tax calculation engine, an SMS microservice and the services behind e-Ledger, e-SMM, e-Creditnote and expense vouchers on Java Spring and PostgreSQL. Also built partner integrations such as IdeaSoft. The services ran on Docker and Nginx and were monitored with Graylog and Zabbix.',
      frontend: 'Built regulated e-document products for mobile in Flutter and for web in Vue and JSP, from requirements to release. I used Claude Code throughout.',
      cs: 'Responsible for regulated e-document products from requirements to release, and for partner integrations such as IdeaSoft. I set up Claude Code for design, code review, testing and documentation on a small team.',
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
    eng: 'Looking for a full-stack role',
    backend: 'Looking for a backend role',
    frontend: 'Looking for a frontend role',
    cs: 'Looking for a customer success role',
  } satisfies ByTrack,
  body: {
    cs: 'I live in Istanbul and I’m looking for a customer success role, ideally at a technical product. I speak English and Turkish fluently.',
    eng: 'I live in Istanbul and I’m looking for full-stack or cloud roles. I speak English and Turkish fluently.',
    backend: 'I live in Istanbul and I’m looking for backend or platform roles. I speak English and Turkish fluently.',
    frontend: 'I live in Istanbul and I’m looking for frontend or mobile roles. I speak English and Turkish fluently.',
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
    { group: 'Customer work', items: ['Client accounts', 'Writing requirements', 'Scope and deadlines', 'Working with stakeholders'] },
    { group: 'Communication', items: ['English and Turkish', 'Remote, across time zones', 'Error messages and help text', 'Documentation'] },
    { group: 'Worked alongside', items: ['Dev teams', 'Support staff', 'Senior IT leadership', 'Integration partners'] },
    { group: 'Technical depth', items: ['Software development', 'APIs and integrations', 'SQL', 'AWS Certified', 'Cloud and Kubernetes'] },
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
    body: 'A site that lists and ranks Istanbul’s events, collected every morning from over a hundred sources. It covers concerts, talks, theatre, exhibitions and workshops. The ranking uses fixed rules, not AI, so each score can be explained. It has a map, an events assistant, and accounts that rank events by your interests.',
    stack: ['Python', 'Vue 3', 'Cloudflare Pages and D1', 'GitHub Actions'],
    link: { label: 'Open the site', href: 'https://secki.istanbul' },
    preview: '/previews/secki.jpg',
  },
  {
    name: 'Film Fırtınası',
    year: '2026',
    kind: 'Side project',
    body: 'A movie site with the trailer, ratings and reviews for each film, built on TMDB data. Ratings from IMDb, TMDB and users are shown side by side. Visitors can request films and vote on requests, and an admin panel imports films from TMDB.',
    stack: ['Vue 3', 'TypeScript', 'Tailwind', 'Firebase'],
    link: { label: 'Open the site', href: 'https://filmfirtinasi.vercel.app' },
    preview: '/previews/filmfirtinasi.jpg',
    screen: 'tv',
  },
  {
    name: 'Noteful',
    year: '2021–2026',
    kind: 'Open source',
    body: 'A shared notes app that needs no account: open a page, send the link and edit together in real time. I first built it in 2021 as NoteWith.Me, and professors used it in online classes. In 2026 I rebuilt it with password-protected notes encrypted in the browser, read-only links, QR codes and Markdown export.',
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
    body: 'This portfolio, with a Three.js globe that moves through the places I’ve worked as you scroll and a 3D desk with my projects. It has separate versions for customer success and engineering roles.',
    stack: ['Vue 3', 'Three.js', 'GSAP', 'Vite'],
    link: { label: 'View on GitHub', href: 'https://github.com/mfirataksoy/mfirataksoy.com' },
    preview: '/previews/thissite.jpg',
    screen: 'laptop',
  },
  {
    name: 'Smart grocery device',
    year: '2022',
    kind: 'H-E-B Innovation & Technology',
    body: 'A smart-home device that recognizes products and barcodes with a camera and adds items you run out of to your H-E-B account.',
    stack: ['Jetson Nano', 'CUDA', 'TensorFlow', 'Firebase'],
  },
  {
    name: 'AcneAway',
    year: '2025',
    kind: 'Side project',
    body: 'A web app that retouched acne in selfies with an AI image model. Users bought credits through Stripe. It’s shut down now, and the site is kept as a showcase.',
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
    body: 'WhatsApp and Telegram bots that sent stickers on request, and a website that showed stickers users sent to the bots. Built with Bedirhan Celayir.',
    stack: ['Vue', 'Node.js', 'Firebase', 'Google Cloud'],
    link: { label: 'See the farewell page', href: 'https://stickerhub.mfirataksoy.com' },
    preview: '/previews/stickerhub.jpg',
    screen: 'phone',
    status: 'Retired',
  },
]

export type DeskKey = 'laptop' | 'tv' | 'calendar' | 'fridge' | 'phone' | 'headset' | 'server'

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
      eng: 'Projects I built on my own time to learn new tools.',
      cs: 'Projects I built on my own time. Building them keeps my technical skills current.',
    },
    projects: ['Noteful', 'This website'],
  },
  {
    id: 'tv',
    object: 'TV',
    title: { eng: 'Film Fırtınası, a movie site', cs: 'Film Fırtınası, a movie site' },
    body: {
      eng: 'A movie site built on TMDB data, with trailers, IMDb, TMDB and user ratings, reviews, and film requests that visitors vote on. An admin panel imports films from TMDB.',
      cs: 'A movie site that shows the trailer, ratings from three sources and user reviews on one page. Visitors vote on which films are added next.',
    },
    projects: ['Film Fırtınası'],
  },
  {
    id: 'calendar',
    object: 'Calendar',
    title: { eng: 'Seçki İstanbul, an events site', cs: 'Seçki İstanbul, an events site' },
    body: {
      eng: 'Scrapers collect events from over a hundred Istanbul sources every morning and follow robots.txt. Duplicates are merged and events are scored with fixed rules. Signed-in users pick their interests and events are ranked for them.',
      cs: 'I built this to keep track of events in Istanbul. Every morning it reads event pages from over a hundred sources and ranks the events. It’s now a public site, and users can set their own interests.',
    },
    projects: ['Seçki İstanbul'],
  },
  {
    id: 'fridge',
    object: 'Fridge',
    title: { eng: 'Smart grocery device at H-E-B', cs: 'Smart grocery device at H-E-B' },
    body: {
      eng: 'At H-E-B I led a smart-home grocery device. It used CNN models trained in TensorFlow and Keras, running on an NVIDIA Jetson Nano with CUDA and OpenCV.',
      cs: 'At H-E-B I pitched a smart-home grocery device and led the prototype that was tested in homes. Its app linked the device to the user’s H-E-B account.',
    },
    projects: ['Smart grocery device'],
  },
  {
    id: 'phone',
    object: 'Phone',
    title: { eng: 'Mobile apps and chatbots', cs: 'Mobile apps and chatbots' },
    body: {
      eng: 'I build mobile apps in Flutter, which I used at İzibiz. Side projects: AcneAway retouched selfies, and StickerHub was a sticker bot on WhatsApp and Telegram.',
      cs: 'Two phone-based side projects: AcneAway retouched selfies, and StickerHub was a sticker bot on WhatsApp and Telegram, so users didn’t need to install an app.',
    },
    projects: ['AcneAway', 'StickerHub'],
  },
  {
    id: 'headset',
    object: 'Headset',
    title: { eng: 'Working with customers', cs: 'Customer success' },
    body: {
      eng: 'Work where I dealt with clients and users directly: managing a client account, building a tool for a support team and rewriting error messages.',
      cs: 'I’ve managed a client account, built a tool for a support team and rewritten customer-facing error messages.',
    },
    points: [
      'Managed the client account for a New York delivery app and wrote its requirements',
      'Built the internal React app Credit One’s customer support staff used',
      'Rewrote the licensing server’s error messages at Anlaş; total errors went down 15%',
    ],
  },
  {
    id: 'server',
    object: 'Server',
    title: { eng: 'Cloud and DevOps', cs: 'Cloud and DevOps' },
    body: {
      eng: 'At Credit One I moved applications onto AWS EKS with Terraform and monitored the production clusters. At İzibiz I ran our services on Docker and Nginx and monitored them with Graylog and Zabbix.',
      cs: 'I’ve worked with AWS EKS and Terraform at Credit One, and Docker, Nginx and monitoring tools at İzibiz. I’m an AWS Certified Cloud Practitioner.',
    },
    points: ['AWS EKS', 'Kubernetes', 'Terraform', 'Docker', 'Nginx', 'Graylog', 'Zabbix'],
  },
]

export const contact = {
  headline: 'Let’s talk.',
  body: {
    cs: 'If you’re hiring for customer success, email me or message me on LinkedIn.',
    eng: 'If you’re hiring for a full-stack or cloud role, email me or message me on LinkedIn.',
    backend: 'If you’re hiring for a backend role, email me or message me on LinkedIn.',
    frontend: 'If you’re hiring for a frontend role, email me or message me on LinkedIn.',
  } satisfies ByTrack,
}
