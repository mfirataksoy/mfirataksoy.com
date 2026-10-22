<script setup lang="ts">
import { lens } from '../useLens'
import { lensLabels, type Lens } from '../content'

const options = Object.entries(lensLabels) as [Lens, string][]
</script>

<template>
  <div class="lens">
    <span class="lens__label" id="lens-label">I’m hiring for</span>
    <div class="lens__track" role="radiogroup" aria-labelledby="lens-label" :data-active="lens">
      <span class="lens__thumb" aria-hidden="true" />
      <button
        v-for="[value, label] in options"
        :key="value"
        type="button"
        role="radio"
        class="lens__option"
        :class="{ 'is-active': lens === value }"
        :aria-checked="lens === value"
        @click="lens = value"
      >
        {{ label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.lens {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.lens__label {
  font: 500 12px/1 var(--mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.lens__track {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: rgba(7, 11, 22, 0.6);
  backdrop-filter: blur(8px);
}
.lens__thumb {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 4px;
  width: calc(50% - 4px);
  border-radius: 999px;
  background: var(--ink);
  transition: transform 0.45s cubic-bezier(0.65, 0, 0.35, 1);
}
.lens__track[data-active='eng'] .lens__thumb {
  transform: translateX(100%);
}
.lens__option {
  position: relative;
  z-index: 1;
  border: 0;
  background: none;
  color: var(--ink-soft);
  font: 500 14px/1 var(--sans);
  padding: 11px 18px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.3s;
}
.lens__option.is-active {
  color: var(--bg);
}
</style>
