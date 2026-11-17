import { ref, watch } from 'vue'
import { tracks, type Track } from './tracks'
import type { ByTrack } from './content'

// One flow for everyone: the site always reads as the full-stack page.
// The other role copy in content.ts is kept but no longer shown.
export const track = ref<Track>('fullstack')

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
