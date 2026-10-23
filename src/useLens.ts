import { ref, watch } from 'vue'
import type { ByLens, Lens } from './content'

// Customer success is the default; engineering readers get ?for=eng so a
// link can be sent per application.
function initialLens(): Lens {
  const param = new URLSearchParams(window.location.search).get('for')
  return param === 'eng' ? 'eng' : 'cs'
}

export const lens = ref<Lens>(initialLens())

watch(lens, (value) => {
  const url = new URL(window.location.href)
  if (value === 'cs') url.searchParams.delete('for')
  else url.searchParams.set('for', value)
  history.replaceState(null, '', url)
  document.documentElement.dataset.lens = value
}, { immediate: true })

export const pick = (text: ByLens) => text[lens.value]
