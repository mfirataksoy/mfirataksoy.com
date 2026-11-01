import { ref, shallowRef } from 'vue'
import type { Globe } from './Globe'

// Sections steer the globe through this shared handle; it stays null when WebGL is unavailable.
export const globe = shallowRef<Globe | null>(null)

// Phones: while the route is on screen the globe becomes a map band at the top that the chapter cards scroll under.
export const globeBand = ref(false)
