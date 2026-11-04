<script setup lang="ts">
import type { DeskKey } from '../content'

defineProps<{ id: DeskKey; size?: number }>()
</script>

<template>
  <svg viewBox="0 0 24 24" :width="size ?? 18" :height="size ?? 18" aria-hidden="true">
    <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
      <template v-if="id === 'laptop'"><rect x="4" y="5" width="16" height="10" rx="1.5" /><path d="M2 19h20" /></template>
      <template v-else-if="id === 'tv'"><rect x="2.5" y="7" width="19" height="12" rx="1.5" /><path d="M8 3l4 4 4-4M7 22h10M10.5 10.5v4l3.5-2z" /></template>
      <template v-else-if="id === 'calendar'"><rect x="4" y="5" width="16" height="15" rx="1.5" /><path d="M4 10h16M8 3v4M16 3v4" /></template>
      <template v-else-if="id === 'fridge'"><rect x="6" y="2.5" width="12" height="19" rx="1.5" /><path d="M6 9h12M9 5v2M9 12v4" /></template>
      <template v-else-if="id === 'phone'"><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></template>
      <template v-else><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" /></template>
    </g>
  </svg>
</template>
