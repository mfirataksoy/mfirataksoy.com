// Each role gets its own address, copy and resume. The root page asks which
// one the visitor is hiring for and sends them there.

export type Track = 'cs' | 'fullstack' | 'backend' | 'frontend'

export type TrackInfo = {
  path: string
  label: string
  title: string
  description: string
  // Tailored resumes are produced in the resume chat; until a file exists the
  // track falls back to the main resume.
  resume: string
}

const mainResume = '/Mehmet_Firat_Aksoy_Resume.pdf'

export const tracks: Record<Track, TrackInfo> = {
  cs: {
    path: '/customersuccess',
    label: 'Customer success',
    title: 'Firat Aksoy · Customer success with an engineer’s toolkit',
    description: 'Mehmet Firat Aksoy: customer success manager with a software engineering background, based in Istanbul. Fluent in English and Turkish.',
    resume: mainResume,
  },
  fullstack: {
    path: '/fullstack',
    label: 'Full-stack',
    title: 'Firat Aksoy · Full-stack engineer',
    description: 'Mehmet Firat Aksoy: full-stack engineer in Istanbul across Flutter, Vue, Java Spring and AWS. Previously İzibiz, Credit One Bank and H-E-B.',
    resume: mainResume,
  },
  backend: {
    path: '/backend',
    label: 'Backend',
    title: 'Firat Aksoy · Backend engineer',
    description: 'Mehmet Firat Aksoy: backend engineer in Istanbul. Java Spring and PostgreSQL services, Docker, AWS EKS and Terraform.',
    resume: mainResume,
  },
  frontend: {
    path: '/frontend',
    label: 'Frontend',
    title: 'Firat Aksoy · Frontend engineer',
    description: 'Mehmet Firat Aksoy: frontend engineer in Istanbul across Vue, React and Flutter.',
    resume: mainResume,
  },
}

export const trackOrder: Track[] = ['cs', 'fullstack', 'backend', 'frontend']

export function trackFromPath(pathname: string): Track | null {
  const clean = pathname.replace(/\/+$/, '') || '/'
  return trackOrder.find((t) => tracks[t].path === clean) ?? null
}
