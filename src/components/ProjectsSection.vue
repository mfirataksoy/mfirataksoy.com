<script setup lang="ts">
import { projects } from '../content'

// Cards tilt slightly toward the pointer.
function tilt(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width - 0.5
  const y = (e.clientY - r.top) / r.height - 0.5
  el.style.setProperty('--rx', `${-y * 5}deg`)
  el.style.setProperty('--ry', `${x * 7}deg`)
  el.style.setProperty('--mx', `${(x + 0.5) * 100}%`)
  el.style.setProperty('--my', `${(y + 0.5) * 100}%`)
}
function reset(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  el.style.setProperty('--rx', '0deg')
  el.style.setProperty('--ry', '0deg')
}
</script>

<template>
  <section id="projects" class="projects" data-globe="dim">
    <div class="wrap">
      <header data-reveal>
        <p class="kicker">04 · Projects</p>
        <h2 class="section-title">Things I <em>shipped</em> on the side.</h2>
      </header>
      <div class="projects__grid">
        <article
          v-for="p in projects"
          :key="p.name"
          class="project"
          data-reveal
          @pointermove="tilt"
          @pointerleave="reset"
        >
          <div class="project__top">
            <span class="project__kind">{{ p.kind }} · {{ p.year }}</span>
            <span v-if="p.status" class="project__status">{{ p.status }}</span>
          </div>
          <h3 class="project__name">{{ p.name }}</h3>
          <p class="project__body">{{ p.body }}</p>
          <ul class="project__stack">
            <li v-for="s in p.stack" :key="s" class="tag">{{ s }}</li>
          </ul>
          <a v-if="p.link" :href="p.link.href" class="project__link" target="_blank" rel="noopener">
            {{ p.link.label }} <span aria-hidden="true">↗</span>
          </a>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects {
  position: relative;
  padding: 100px 0;
}
.projects__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
  gap: 18px;
  margin-top: 56px;
  perspective: 1200px;
}
.project {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 28px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background:
    radial-gradient(400px circle at var(--mx, 50%) var(--my, 0%), rgba(255, 181, 71, 0.09), transparent 60%),
    rgba(10, 15, 34, 0.9);
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform 0.25s ease-out, border-color 0.3s;
}
.project:hover {
  border-color: var(--line-strong);
}
.project__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font: 500 12px/1.4 var(--mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.project__status {
  color: var(--amber);
}
.project__name {
  margin: 18px 0 0;
  font: 400 34px/1.05 var(--serif);
}
.project__body {
  margin: 12px 0 0;
  color: var(--ink-soft);
  flex: 1;
}
.project__stack {
  list-style: none;
  padding: 0;
  margin: 20px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.project__link {
  margin-top: 22px;
  align-self: flex-start;
  font-size: 15px;
  font-weight: 500;
  color: var(--amber);
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 181, 71, 0.4);
  padding-bottom: 2px;
}
@media (hover: none) {
  .project {
    transform: none;
  }
}
</style>
