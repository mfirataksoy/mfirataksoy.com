<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Globe } from '../globe/Globe'
import { globe, globeBand } from '../globe/store'
import { logInteractiveFallback } from '../posthog-logs'

const canvas = ref<HTMLCanvasElement>()
const labels = ref<HTMLDivElement>()
const failed = ref(false)

onMounted(() => {
  try {
    globe.value = new Globe(canvas.value!, labels.value!)
    globe.value.focus('hero')
    globe.value.setLayout(window.matchMedia('(max-width: 760px)').matches ? 'top' : 'side')
    if (import.meta.env.DEV) Object.assign(window, { __globe: globe.value })
  } catch (err) {
    console.warn('Globe disabled:', err)
    logInteractiveFallback('globe')
    failed.value = true
  }
})

onBeforeUnmount(() => {
  globe.value?.dispose()
  globe.value = null
})
</script>

<template>
  <div class="stage" :class="{ 'stage--fallback': failed, 'stage--band': globeBand }" aria-hidden="true">
    <canvas ref="canvas" class="stage__canvas" />
    <div ref="labels" class="stage__labels" />
  </div>
</template>

<style scoped>
@property --band {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 130%;
}
.stage {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  /* Where the map band fades out; past the bottom edge it hides nothing. */
  --band: 130%;
  -webkit-mask-image: linear-gradient(#000 calc(var(--band) - 12%), transparent var(--band));
  mask-image: linear-gradient(#000 calc(var(--band) - 12%), transparent var(--band));
  transition: --band 0.7s cubic-bezier(0.3, 0.7, 0.2, 1), background-color 0.5s;
}
/* Phones, during the route: the globe sits above the page in a top band and the cards scroll under it. */
.stage--band {
  z-index: 2;
  --band: 47%;
  background-color: var(--bg);
}
.stage::after {
  /* Soft vignette keeps text readable where it overlaps the globe. */
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(8, 17, 34, 0.75) 100%);
}
.stage__canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.stage__labels {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.stage--fallback {
  background: radial-gradient(40vmin 40vmin at 70% 45%, rgba(75, 108, 255, 0.25), transparent 70%);
}
</style>
