import { ref, watch } from 'vue'
import { trackFromPath, tracks, type Track } from './tracks'
import type { ByTrack } from './content'

const STORAGE_KEY = 'mfa-track'

function remembered(): Track | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value && value in tracks ? (value as Track) : null
  } catch {
    return null
  }
}

// Old ?for= links from before the role pages existed.
function legacyParam(): Track | null {
  const param = new URLSearchParams(window.location.search).get('for')
  return param === 'eng' ? 'fullstack' : param === 'cs' ? 'cs' : null
}

const fromPath = trackFromPath(window.location.pathname)
const fromLegacy = legacyParam()

export const track = ref<Track>(fromPath ?? fromLegacy ?? remembered() ?? 'cs')

/** The root page asks once; role pages, old links and returning visitors skip it. */
export const needsChoice = ref(!fromPath && !fromLegacy && !remembered())

if (!fromPath && (fromLegacy || remembered())) {
  history.replaceState(null, '', tracks[track.value].path + window.location.hash)
}

export function chooseTrack(t: Track, navigate = true) {
  track.value = t
  needsChoice.value = false
  try {
    localStorage.setItem(STORAGE_KEY, t)
  } catch {
    // Private mode: the choice just isn't remembered.
  }
  if (navigate) history.replaceState(null, '', tracks[t].path + window.location.hash)
}

watch(
  track,
  (t) => {
    document.documentElement.dataset.track = t
    document.title = tracks[t].title
    document.querySelector('meta[name="description"]')?.setAttribute('content', tracks[t].description)
  },
  { immediate: true },
)

export const pick = (text: ByTrack) => text[track.value] ?? (track.value === 'cs' ? text.cs : text.eng)

export function pickList<T>(list: { cs: T; eng: T } & Partial<Record<Track, T>>): T {
  return list[track.value] ?? (track.value === 'cs' ? list.cs : list.eng)
}
