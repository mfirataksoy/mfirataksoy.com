<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { chooseTrack, needsChoice } from '../useLens'
import { trackOrder, tracks, type Track } from '../tracks'

const first = ref<HTMLButtonElement[]>([])

// Keep the page underneath still while the question is open.
watchEffect(() => {
  document.documentElement.style.overflow = needsChoice.value ? 'hidden' : ''
})

function pick(t: Track) {
  chooseTrack(t)
}

// "Just looking" keeps the visitor on the home page with the default story.
function browse() {
  chooseTrack('cs', false)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && needsChoice.value) browse()
}

onMounted(async () => {
  window.addEventListener('keydown', onKey)
  await nextTick()
  first.value[0]?.focus({ preventScroll: true })
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <Transition name="picker">
    <div v-if="needsChoice" class="picker" role="dialog" aria-modal="true" aria-labelledby="picker-title">
      <div class="picker__card">
        <h2 id="picker-title" class="picker__title">What brings you <em>here</em>?</h2>
        <div class="picker__options">
          <button
            v-for="t in trackOrder"
            :key="t"
            ref="first"
            type="button"
            class="picker__option"
            @click="pick(t)"
          >
            <span class="picker__label">{{ tracks[t].label }}</span>
            <span class="picker__arrow" aria-hidden="true">→</span>
          </button>
        </div>
        <button type="button" class="picker__skip" @click="browse">Just looking around</button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.picker {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(8, 17, 34, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.picker__card {
  width: min(720px, 100%);
  max-height: calc(100svh - 32px);
  overflow-y: auto;
  padding: clamp(24px, 4vw, 40px);
  border-radius: 20px;
  border: 1px solid var(--line-strong);
  background: rgba(12, 23, 45, 0.96);
}
.picker__title {
  margin: 0;
  font: 400 clamp(40px, 6vw, 64px) / 1 var(--serif);
}
.picker__title em {
  color: var(--gold);
}
.picker__options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 32px;
}
@media (max-width: 560px) {
  .picker__options {
    grid-template-columns: 1fr;
  }
}
.picker__option {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 96px;
  text-align: left;
  padding: 24px 56px 24px 26px;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: rgba(8, 17, 34, 0.6);
  color: var(--ink);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.picker__option:hover,
.picker__option:focus-visible {
  border-color: rgba(200, 164, 93, 0.6);
  background: rgba(200, 164, 93, 0.08);
}
.picker__label {
  font: 400 clamp(26px, 3.4vw, 32px) / 1.1 var(--serif);
}
.picker__arrow {
  position: absolute;
  right: 24px;
  font-size: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gold);
  transition: transform 0.2s;
}
.picker__option:hover .picker__arrow {
  transform: translate(4px, -50%);
}
.picker__skip {
  margin-top: 22px;
  border: 0;
  background: none;
  padding: 6px 0;
  font: 500 13px/1 var(--mono);
  letter-spacing: 0.06em;
  color: var(--muted);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.picker__skip:hover {
  color: var(--ink-soft);
}
.picker-enter-active,
.picker-leave-active {
  transition: opacity 0.35s ease;
}
.picker-enter-active .picker__card,
.picker-leave-active .picker__card {
  transition: transform 0.35s ease;
}
.picker-enter-from,
.picker-leave-to {
  opacity: 0;
}
.picker-enter-from .picker__card,
.picker-leave-to .picker__card {
  transform: translateY(12px);
}
</style>
