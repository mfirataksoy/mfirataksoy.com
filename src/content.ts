// Every word on the site lives here. Text that differs by hiring lens is a
// { eng, cs } pair; everything else is a plain string.

export type Lens = 'eng' | 'cs'
export type ByLens = { eng: string; cs: string }

export type PlaceKey = 'istanbul' | 'fortWorth' | 'sanAntonio' | 'lasVegas'

export const places: Record<PlaceKey, { label: string; lat: number; lon: number }> = {
  istanbul: { label: 'Istanbul', lat: 41.01, lon: 28.98 },
  fortWorth: { label: 'Fort Worth', lat: 32.75, lon: -97.33 },
  sanAntonio: { label: 'San Antonio', lat: 29.42, lon: -98.49 },
  lasVegas: { label: 'Las Vegas', lat: 36.17, lon: -115.14 },
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

export const lensLabels: Record<Lens, string> = {
  eng: 'Engineering',
  cs: 'Customer success',
}

export const hero = {
  kicker: 'Istanbul ⇄ Texas · open to work',
  headline: 'I build bridges',
  sub: {
    eng: 'between a product idea and the code that ships it. Full-stack engineer across Flutter, Vue, Java Spring and AWS, with Claude Code at every stage.',
    cs: 'between customers and the engineers who serve them. Customer success with a software engineer’s toolkit, fluent in English and Turkish.',
  } satisfies ByLens,
  role: {
    eng: 'Full-stack software engineer',
    cs: 'Technical customer success',
  } satisfies ByLens,
}

export type Chapter = {
  id: string
  years: string
  place: string
  focus: PlaceKey | 'bridge'
  arc: [PlaceKey, PlaceKey]
  org: string
  role: string
  title: ByLens
  body: ByLens
  tags: string[]
}

export const chapters: Chapter[] = [
  {
    id: 'tcu',
    years: '2018 – 2023',
    place: 'Istanbul → Fort Worth, TX',
    focus: 'fortWorth',
    arc: ['istanbul', 'fortWorth'],
    org: 'Texas Christian University',
    role: 'B.S. Computer Science, minor in Mathematics',
    title: {
      eng: 'Crossed an ocean for computer science',
      cs: 'Learned to build things, and relationships',
    },
    body: {
      eng: 'Chancellor’s Scholar and Dean’s List at TCU. Computer science with a math minor, and the first lines of code that ended up in production.',
      cs: 'Chancellor’s Scholar while spending four years at the front desk of TCU’s alumni center, welcoming alumni and supporting events alongside a full course load.',
    },
    tags: ['Chancellor’s Scholar', 'Dean’s List'],
  },
  {
    id: 'anlas',
    years: '2019 – 2020',
    place: 'While at TCU',
    focus: 'bridge',
    arc: ['fortWorth', 'istanbul'],
    org: 'Anlaş Otomasyon',
    role: 'Software engineer intern',
    title: {
      eng: 'Rebuilt the licensing server',
      cs: 'Turned cryptic errors into answers',
    },
    body: {
      eng: 'Rebuilt the licensing server that authenticated every purchase, from Fortune 1000 firms to small businesses, in React, Node, Express and TypeScript.',
      cs: 'Replaced cryptic UI errors with clear, actionable messages and reporting, which cut total errors by 15% for customers from Fortune 1000 firms to small businesses.',
    },
    tags: ['React', 'Node', 'TypeScript', '−15% errors'],
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
      cs: 'Led a smart-home grocery device from pitch to working prototype, designed 3D-printed enclosures for in-home testing, and pitched integrating it into H-E-B’s customer apps.',
    },
    tags: ['Jetson Nano', 'TensorFlow', 'Firebase', '3D printing'],
  },
  {
    id: 'csm',
    years: '2022 – 2023',
    place: 'Remote · US ⇄ Türkiye',
    focus: 'bridge',
    arc: ['fortWorth', 'istanbul'],
    org: 'US local-delivery platform',
    role: 'Customer success manager (contract)',
    title: {
      eng: 'The bridge, literally',
      cs: 'The bridge, literally',
    },
    body: {
      eng: 'Managed a US client’s delivery app for local shops from kickoff to launch, turning what the client needed into requirements a Turkey-based dev team could build.',
      cs: 'Owned a US client’s delivery app for local shops from kickoff to launch. Turned client needs into requirements and kept a US client team and a Turkey-based dev team aligned on scope and timelines across time zones.',
    },
    tags: ['Kickoff → launch', 'Requirements', 'Across time zones'],
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
    },
    body: {
      eng: 'In the Information Management Leadership Program: onboarded applications onto the bank’s hybrid cloud with Terraform, deployed to AWS EKS, and watched cluster health for production banking services.',
      cs: 'Selected for the bank’s IT leadership program and partnered with senior IT leaders on planning and delivery. Built an internal React app that the customer support staff used daily.',
    },
    tags: ['AWS EKS', 'Terraform', 'Kubernetes', 'React'],
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
    },
    body: {
      eng: 'Led delivery of e-Ledger, e-SMM, e-Producer Receipt, a tax calculation engine and an SMS microservice across Flutter, Vue, JSP, Java Spring and PostgreSQL, running on Docker and Nginx with Graylog and Zabbix. Claude Code at every stage.',
      cs: 'Owned regulated e-document products end to end, from requirements to release, plus partner integrations such as IdeaSoft. Used Claude Code across design, review, testing and docs so a lean team could deliver more.',
    },
    tags: ['Flutter', 'Vue', 'Java Spring', 'PostgreSQL', 'Claude Code'],
  },
]

export const nowChapter = {
  years: 'Now',
  title: {
    eng: 'Next stop: your engineering team',
    cs: 'Next stop: your customers',
  } satisfies ByLens,
  body: 'Based in Istanbul and open to new roles. I speak English and Turkish.',
}

export const toolkit: Record<Lens, { group: string; items: string[] }[]> = {
  eng: [
    { group: 'Languages', items: ['Java', 'Dart', 'TypeScript', 'JavaScript', 'Python', 'SQL'] },
    { group: 'Frameworks', items: ['Spring', 'Flutter', 'Vue.js', 'React', 'Node.js', 'Express', 'JSP', 'Tailwind'] },
    { group: 'Data', items: ['PostgreSQL', 'MS SQL', 'MongoDB', 'Firebase'] },
    { group: 'Cloud and DevOps', items: ['AWS EKS', 'Kubernetes', 'Terraform', 'Docker', 'Nginx', 'Graylog', 'Zabbix', 'CI/CD'] },
    { group: 'AI and tools', items: ['Claude Code', 'TensorFlow', 'OpenCV', 'CUDA', 'NVIDIA Jetson', 'Git', 'Jira'] },
  ],
  cs: [
    { group: 'With customers', items: ['Kickoff to launch', 'Needs → requirements', 'Scope and timelines', 'Stakeholder updates'] },
    { group: 'Across teams', items: ['US ⇄ Türkiye time zones', 'Client ⇄ dev team', 'Senior IT leadership', 'Support staff tooling'] },
    { group: 'Languages', items: ['English', 'Turkish'] },
    { group: 'Technical depth', items: ['Reads and writes code', 'APIs and integrations', 'AWS Certified', 'SQL', 'Jira'] },
    { group: 'AI', items: ['Claude Code', 'AI-assisted docs and testing'] },
  ],
}

export type Project = {
  name: string
  year: string
  kind: string
  body: string
  stack: string[]
  link?: { label: string; href: string }
  status?: string
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
    body: 'Collaborative notes without accounts: open a page, share the URL, write together. Professors used it for online classes during the pandemic.',
    stack: ['Vue', 'Node.js', 'Express', 'MongoDB'],
    link: { label: 'View on GitHub', href: 'https://github.com/mfirataksoy/notewith.me' },
    status: 'Being revived',
  },
  {
    name: 'StickerHub',
    year: '2021',
    kind: 'Side project',
    body: 'WhatsApp and Telegram bots that sent people stickers on request, and a website built from stickers users sent back to the bot.',
    stack: ['Vue', 'Node.js', 'Firebase', 'Google Cloud'],
    status: 'Retired',
  },
  {
    name: 'This website',
    year: '2026',
    kind: 'Open source',
    body: 'A Three.js globe that follows my path between Istanbul and Texas as you scroll, with a lens switch for engineering and customer success readers.',
    stack: ['Vue 3', 'Three.js', 'GSAP', 'Vite'],
    link: { label: 'View on GitHub', href: 'https://github.com/mfirataksoy/mfirataksoy.com' },
  },
]

export const contact = {
  headline: 'Let’s build a bridge.',
  body: {
    eng: 'Hiring for a full-stack or cloud role? I’d like to hear about the product and the team.',
    cs: 'Hiring for customer success? I’d like to hear about your customers and what success means for them.',
  } satisfies ByLens,
}
