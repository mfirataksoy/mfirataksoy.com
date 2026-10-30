// Everything the assistant may say about Fırat. Sources: the one-page resume
// (public/Mehmet_Firat_Aksoy_Resume.pdf, synced with LinkedIn 2026-10-28) and
// the copy in src/content.ts. If a fact is not here, the assistant must not say it.

export const firatKnowledge = `
# Mehmet Fırat Aksoy ("Fırat")

## At a glance
- Full-stack software engineer with a customer success background, based in Istanbul, Türkiye.
- 3+ years shipping mobile, web and backend products from design to production, with AI tools such as Claude Code built into every stage of development.
- AWS Certified Cloud Practitioner. Chancellor's Scholar (full-ride merit scholarship) and Honors Computer Science graduate of Texas Christian University (TCU).
- Bilingual: fluent in English and Turkish (both working languages).
- Website: https://mfirataksoy.com · LinkedIn: https://www.linkedin.com/in/mfirataksoy/ · GitHub: https://github.com/mfirataksoy · Email: mehmetfirataksoy@gmail.com
- Resume (PDF): https://mfirataksoy.com/Mehmet_Firat_Aksoy_Resume.pdf
- Role pages on the site: https://mfirataksoy.com/customersuccess, /fullstack, /backend, /frontend

## What he is looking for (availability)
- His role at İzibiz ended in October 2026. He is not employed anywhere right now; he is looking for his next role.
- Open to work now and available to start immediately.
- Roles: customer success (where technical depth helps customers get more out of the product), full-stack, backend/platform, frontend/mobile, and cloud roles.
- Open to: office or hybrid work in Istanbul, remote work for companies anywhere in the world, and relocating abroad for the right role.

## Experience

### Software Engineer · İzibiz Bilişim Teknolojileri A.Ş. · Istanbul · May 2025 – Oct 2026
- Led end-to-end delivery of regulated e-document products (e-Ledger, e-SMM, e-Creditnote, expense vouchers), a tax calculation engine, an SMS microservice and partner integrations such as IdeaSoft.
- Shipped across Flutter mobile, Vue and JSP web, and Java Spring and PostgreSQL backends; containerized the stack with Docker and Nginx and used Graylog and Zabbix to monitor logs and infrastructure in production.
- Built Claude Code into every stage of development, from design and coding to code review, testing, documentation and releases, to deliver more with a lean team.

### IT Leadership Associate · Credit One Bank · Las Vegas, NV · Aug 2023 – Aug 2024
- Selected for the Information Management Leadership Program (IMLP), a two-year IT rotation; partnered with senior IT leadership on planning and delivery.
- Cloud: onboarded new applications onto the bank's hybrid cloud platform, provisioning infrastructure with Terraform and deploying to AWS EKS clusters on Kubernetes; monitored cluster and application health across EKS environments for production banking services.
- Development: built features for the bank's internal React support-agent platform, used daily by customer support staff (hooks, global state management, React Router, REST APIs). Built a customer-handling timer whose state persisted across route changes as agents moved between screens.

### Customer Success Manager (Contract) · US local-delivery platform (name confidential) · Remote · Sep 2022 – Apr 2023
- Managed a US client's delivery app for local shops through development, translating client needs into technical requirements.
- Bridged a Turkey-based dev team and the US client team across time zones, aligning scope and timelines.

### Software Engineer Intern · H-E-B Innovation & Technology · San Antonio, TX · May 2022 – Aug 2022
- Led a smart-home grocery device from pitch to working prototype; oversaw a computer-vision specialist.
- Trained CNN product and barcode recognition models with TensorFlow and Keras, deployed on an NVIDIA Jetson Nano with CUDA and OpenCV for real-time edge inference.
- Built the companion app flow: Wi-Fi provisioning, Firebase Authentication and H-E-B account linking, with scanned and depleted items synced to the customer's account automatically.
- Designed 3D-printed enclosures for in-home testing and pitched integration into H-E-B's iOS and Android apps.

### Software Engineer Intern · Anlaş Otomasyon · Istanbul · Sep 2019 – Jan 2020
- Rebuilt the licensing server (React, Node, Express, TypeScript) that authenticated purchases for all customers, from Fortune 1000 firms to small businesses.
- Replaced cryptic UI errors with actionable handling and reporting, reducing total errors by 15%.

### Alumni Relations & Front Desk Specialist · D.J. Kelly Alumni Center, TCU · Fort Worth, TX · 2019 – 2023
- Staffed the front desk for four years while studying full time, welcoming guests and setting up 300+ attendee events; recognized by management in 2023 for handling an emergency.

## Education and certifications
- B.S. Computer Science, Minor in Mathematics · Texas Christian University · Fort Worth, TX · 2018 – 2023. Chancellor's Scholar (full-ride merit scholarship), Honors graduate, Dean's List.
- Certifications: AWS Certified Cloud Practitioner; MS SQL From A to Z; Professional IT Support Certificate.

## Skills
- Languages: Java, Dart, TypeScript, JavaScript, Python, SQL
- Frameworks: Spring, Flutter, Vue.js, React, Node.js, Express, JSP, Tailwind
- Databases and BaaS: PostgreSQL, MS SQL, MongoDB, Firebase
- Cloud and DevOps: AWS (EKS), Kubernetes, Terraform, Docker, Portainer, Nginx, Graylog, Zabbix, CI/CD
- AI and tools: Claude Code (AI-assisted development), TensorFlow, OpenCV, CUDA, NVIDIA Jetson, Git, Jira
- Customer work: client relationships, turning customer needs into requirements, scope and timelines, stakeholder alignment, working across time zones, clear and actionable messaging, documentation.

## How he describes himself (from his website)
- "I build bridges": between customers and the teams that serve them, and between a product idea and the code that ships it.
- A customer success manager with a software engineer's background, so he can go deep on the technical side of every conversation.
- Likes owning a product end to end: the Flutter app, the Vue dashboard, the Spring service behind them and the cluster they run on.
- As a backend engineer he likes systems that are correct before they are clever.
- His best engineering started with a conversation: what the client actually needs, what the support team fights with every day, which error message makes a user give up.
- Side projects are where he tries new stacks before he needs them at work, and they keep his hands on the code.
`
