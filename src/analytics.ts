import posthog from 'posthog-js'
import { watch } from 'vue'
import { track } from './useLens'

// Visiting any page with ?notrack turns analytics off in that browser for good
// (for my own visits); ?track turns it back on.
const OPT_OUT_KEY = 'mfa-notrack'

type Props = Record<string, string | number | boolean | undefined>

const seen = new Set<string>()

function optedOut() {
  try {
    const params = new URLSearchParams(location.search)
    if (params.has('notrack')) localStorage.setItem(OPT_OUT_KEY, '1')
    if (params.has('track')) localStorage.removeItem(OPT_OUT_KEY)
    return localStorage.getItem(OPT_OUT_KEY) === '1'
  } catch {
    return false
  }
}

// Only production builds report, so local dev visits stay out of the data.
export const analyticsEnabled =
  import.meta.env.PROD && !!import.meta.env.VITE_POSTHOG_PROJECT_TOKEN && !!import.meta.env.VITE_POSTHOG_HOST && !optedOut()

export function capture(event: string, props: Props = {}) {
  if (import.meta.env.DEV) console.debug('[analytics]', event, props)
  if (!analyticsEnabled) return
  posthog.capture(event, props)
}

/** Like capture, but only the first time for a given id on this page load. */
export function captureOnce(event: string, id: string, props: Props = {}) {
  const key = `${event}:${id}`
  if (seen.has(key)) return
  seen.add(key)
  capture(event, props)
}

// Links and buttons opt in with data-event="name"; their other data-* values
// become the event's properties, e.g. <a data-event="resume_download" data-where="hero">.
function onClick(e: MouseEvent) {
  const el = (e.target as Element | null)?.closest<HTMLElement>('[data-event]')
  if (!el) return
  const { event, ...data } = el.dataset
  // Skip Vue's scoped-style markers (data-v-1a2b3c4d).
  const props = Object.fromEntries(Object.entries(data).filter(([k]) => !/^v[-A-Z0-9]/.test(k)))
  capture(event!, props)
}

// One event per section the visitor actually reaches, to see how far people read.
function watchSections() {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) captureOnce('section_viewed', entry.target.id, { section: entry.target.id })
      }
    },
    // Counts once a section reaches the upper half of the screen, however tall it is.
    { rootMargin: '0px 0px -50% 0px' },
  )
  document.querySelectorAll('main section[id]').forEach((s) => observer.observe(s))
}

export function startAnalytics() {
  document.addEventListener('click', onClick, { capture: true })
  watchSections()
  if (!analyticsEnabled) return
  posthog.register({ role: track.value, entry_path: location.pathname })
  watch(track, (role) => posthog.register({ role }))
}
