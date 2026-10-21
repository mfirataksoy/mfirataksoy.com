import { shallowRef } from 'vue'
import type { Globe } from './Globe'

// Sections steer the globe through this shared handle; it stays null when WebGL is unavailable.
export const globe = shallowRef<Globe | null>(null)
