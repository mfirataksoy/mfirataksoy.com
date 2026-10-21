<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Globe } from '../globe/Globe'
import { globe } from '../globe/store'

const canvas = ref<HTMLCanvasElement>()
const labels = ref<HTMLDivElement>()
const failed = ref(false)

onMounted(() => {
  try {
    globe.value = new Globe(canvas.value!, labels.value!)
    globe.value.focus('hero')
    globe.value.setLayout('side')
    if (import.meta.env.DEV) Object.assign(window, { __globe: globe.value })
  } catch (err) {
    console.warn('Globe disabled:', err)
    failed.value = true
  }
})

onBeforeUnmount(() => {
  globe.value?.dispose()
  globe.value = null
})
</script>

<template>
  <div class="stage" :class="{ 'stage--fallback': failed }" aria-hidden="true">
    <canvas ref="canvas" class="stage__canvas" />
    <div ref="labels" class="stage__labels" />
  </div>
</template>

<style scoped>
.stage {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.stage::after {
  /* Soft vignette keeps text readable where it overlaps the globe. */
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(7, 11, 22, 0.75) 100%);
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
