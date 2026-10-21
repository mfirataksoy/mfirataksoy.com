import { ref, watch } from 'vue'
import type { ByLens, Lens } from './content'

// The lens lives in the URL (?for=cs) so a link can be sent per application.
function initialLens(): Lens {
  const param = new URLSearchParams(window.location.search).get('for')
  return param === 'cs' ? 'cs' : 'eng'
}

export const lens = ref<Lens>(initialLens())

watch(lens, (value) => {
  const url = new URL(window.location.href)
  if (value === 'eng') url.searchParams.delete('for')
  else url.searchParams.set('for', value)
  history.replaceState(null, '', url)
  document.documentElement.dataset.lens = value
}, { immediate: true })

export const pick = (text: ByLens) => text[lens.value]
