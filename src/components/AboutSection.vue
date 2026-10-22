<script setup lang="ts">
import { about } from '../content'
import { lens, pick } from '../useLens'
</script>

<template>
  <section id="about" class="about">
    <div class="wrap about__inner">
      <figure class="about__photo" data-reveal>
        <img :src="about.photo" alt="Portrait of Mehmet Firat Aksoy" width="612" height="612" loading="lazy" />
        <svg class="about__ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="48" pathLength="1" />
        </svg>
      </figure>
      <div class="about__text">
        <p class="kicker" data-reveal>01 · About</p>
        <h2 class="section-title" data-reveal>{{ about.greeting }}</h2>
        <div data-reveal>
          <Transition name="swap" mode="out-in">
            <p :key="lens" class="about__body">{{ pick(about.body) }}</p>
          </Transition>
        </div>
        <dl class="about__facts" data-reveal>
          <div v-for="f in about.facts" :key="f.label">
            <dt>{{ f.value }}</dt>
            <dd>{{ f.label }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  position: relative;
  padding: 120px 0 40px;
}
.about__inner {
  display: grid;
  grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
  gap: clamp(32px, 6vw, 88px);
  align-items: center;
}
.about__photo {
  position: relative;
  margin: 0;
  aspect-ratio: 1;
  border-radius: 50%;
  padding: 14px;
}
.about__photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  display: block;
  filter: saturate(0.9) contrast(1.02);
}
.about__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  animation: spin 40s linear infinite;
}
.about__ring circle {
  fill: none;
  stroke: var(--amber);
  stroke-width: 0.8;
  stroke-linecap: round;
  stroke-dasharray: 0.62 0.38;
}
@keyframes spin {
  to { transform: rotate(270deg); }
}
.about__body {
  max-width: 620px;
  margin: 24px 0 0;
  font-size: clamp(17px, 1.5vw, 19px);
  color: var(--ink-soft);
}
.about__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 24px;
  margin: 36px 0 0;
  padding-top: 28px;
  border-top: 1px solid var(--line);
}
.about__facts dt {
  font: 400 30px/1 var(--serif);
  color: var(--ink);
}
.about__facts dd {
  margin: 8px 0 0;
  font-size: 14px;
  color: var(--muted);
}
@media (max-width: 760px) {
  .about__inner {
    grid-template-columns: 1fr;
  }
  .about__photo {
    width: min(240px, 70vw);
  }
}
</style>
