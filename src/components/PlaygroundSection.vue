<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { desk, projects, type DeskKey } from '../content'
import { lens, pick } from '../useLens'
import type { Desk } from '../desk/Desk'

const canvas = ref<HTMLCanvasElement>()
const selected = ref<DeskKey>(lens.value === 'cs' ? 'headset' : 'laptop')
const hover = ref<{ id: DeskKey; x: number; y: number } | null>(null)
const has3d = ref(true)
let scene: Desk | null = null

const item = computed(() => desk.find((d) => d.id === selected.value)!)
// Customer success readers meet the headset first.
const ordered = computed(() =>
  lens.value === 'cs' ? [...desk].sort((a, b) => Number(b.id === 'headset') - Number(a.id === 'headset')) : desk,
)
const itemProjects = computed(() => (item.value.projects ?? []).map((n) => projects.find((p) => p.name === n)!).filter(Boolean))
const hoverLabel = computed(() => desk.find((d) => d.id === hover.value?.id)?.object)

function choose(id: DeskKey) {
  selected.value = id
  scene?.select(id)
}

watch(lens, (l) => {
  if (l === 'cs' && selected.value === 'laptop') choose('headset')
})

onMounted(async () => {
  // Phones get the 2D picker only; the 3D desk is a desktop treat.
  if (window.matchMedia('(max-width: 760px)').matches) {
    has3d.value = false
    return
  }
  try {
    const { Desk } = await import('../desk/Desk')
    scene = new Desk(
      canvas.value!,
      (id) => choose(id),
      (id, x, y) => (hover.value = id ? { id, x, y } : null),
    )
    scene.select(selected.value)
    if (import.meta.env.DEV) Object.assign(window, { __desk: scene })
  } catch (err) {
    console.warn('Desk disabled:', err)
    has3d.value = false
  }
})

onBeforeUnmount(() => scene?.dispose())
</script>

<template>
  <section id="projects" class="play" data-globe="dim">
    <div class="wrap">
      <header data-reveal>
        <p class="kicker">04 · Playground</p>
        <h2 class="section-title">The work, <em>up close</em>.</h2>
        <p class="play__hint">{{ has3d ? 'Select an object on the desk' : 'Select an object to read its story' }}</p>
      </header>

      <div class="play__grid" :class="{ 'play__grid--flat': !has3d }">
        <div v-show="has3d" class="play__stage" data-reveal>
          <canvas ref="canvas" class="play__canvas" aria-hidden="true" />
          <span
            v-if="hover"
            class="play__tip"
            :style="{ transform: `translate(${hover.x}px, ${hover.y}px)` }"
          >{{ hoverLabel }}</span>
        </div>

        <div class="play__side">
          <div class="play__picker" role="tablist" aria-label="Objects on the desk">
            <button
              v-for="d in ordered"
              :key="d.id"
              type="button"
              role="tab"
              class="play__chip"
              :class="{ 'is-on': d.id === selected }"
              :aria-selected="d.id === selected"
              aria-controls="desk-panel"
              @click="choose(d.id)"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <template v-if="d.id === 'laptop'"><rect x="4" y="5" width="16" height="10" rx="1.5" /><path d="M2 19h20" /></template>
                  <template v-else-if="d.id === 'calendar'"><rect x="4" y="5" width="16" height="15" rx="1.5" /><path d="M4 10h16M8 3v4M16 3v4" /></template>
                  <template v-else-if="d.id === 'jetson'"><rect x="4" y="9" width="16" height="9" rx="1" /><path d="M8 9V6h8v3M8 13h8" /></template>
                  <template v-else-if="d.id === 'phone'"><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></template>
                  <template v-else-if="d.id === 'headset'"><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="14" width="4" height="6" rx="1.5" /><rect x="17" y="14" width="4" height="6" rx="1.5" /></template>
                  <template v-else><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M8 8h3M8 12h3M8 16h3" /><circle cx="15.5" cy="8" r=".6" /></template>
                </g>
              </svg>
              {{ d.object }}
            </button>
          </div>

          <Transition name="swap" mode="out-in">
            <article :key="`${selected}-${lens}`" id="desk-panel" class="play__panel" role="tabpanel">
              <p class="play__object">{{ item.object }}</p>
              <h3 class="play__title">{{ pick(item.title) }}</h3>
              <p class="play__body">{{ pick(item.body) }}</p>

              <ul v-if="item.points && !itemProjects.length" class="play__points" :class="{ 'play__points--tags': item.id === 'server' }">
                <li v-for="p in item.points" :key="p">{{ p }}</li>
              </ul>

              <div v-for="p in itemProjects" :key="p.name" class="play__project">
                <div class="play__project-top">
                  <span>{{ p.kind }} · {{ p.year }}</span>
                  <span v-if="p.status" class="play__status">{{ p.status }}</span>
                </div>
                <h4>{{ p.name }}</h4>
                <p>{{ p.body }}</p>
                <ul class="play__stack">
                  <li v-for="s in p.stack" :key="s" class="tag">{{ s }}</li>
                </ul>
                <div v-if="p.link || p.code" class="play__links">
                  <a v-if="p.link" :href="p.link.href" target="_blank" rel="noopener" class="play__link">
                    {{ p.link.label }} <span aria-hidden="true">↗</span>
                  </a>
                  <a v-if="p.code" :href="p.code" target="_blank" rel="noopener" class="play__link play__link--quiet">
                    Code <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </article>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.play {
  position: relative;
  padding: 120px 0 100px;
}
.play__hint {
  margin: 14px 0 0;
  font: 500 12px/1 var(--mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.play__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 28px;
  margin-top: 40px;
  align-items: start;
}
.play__grid--flat {
  grid-template-columns: 1fr;
}
.play__stage {
  position: relative;
  aspect-ratio: 4 / 3.1;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background:
    radial-gradient(70% 60% at 45% 40%, rgba(200, 164, 93, 0.08), transparent 70%),
    rgba(12, 23, 45, 0.75);
  overflow: hidden;
}
.play__canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.play__tip {
  position: absolute;
  top: 0;
  left: 0;
  margin: -42px 0 0 14px;
  padding: 7px 11px;
  border-radius: 999px;
  font: 500 12px/1 var(--mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bg);
  background: var(--gold);
  pointer-events: none;
  white-space: nowrap;
}
.play__picker {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.play__chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: rgba(8, 17, 34, 0.6);
  color: var(--ink-soft);
  font: 500 14px/1 var(--sans);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.play__chip:hover {
  color: var(--ink);
  border-color: var(--ink-soft);
}
.play__chip.is-on {
  background: var(--gold);
  border-color: var(--gold);
  color: #0b1426;
}
.play__panel {
  margin-top: 18px;
  padding: 26px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: rgba(12, 23, 45, 0.88);
}
.play__object {
  margin: 0;
  font: 500 12px/1 var(--mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
}
.play__title {
  margin: 12px 0 0;
  font: 400 clamp(28px, 3vw, 36px) / 1.05 var(--serif);
}
.play__body {
  margin: 12px 0 0;
  color: var(--ink-soft);
}
.play__points {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}
.play__points li {
  position: relative;
  padding-left: 20px;
  color: var(--ink);
}
.play__points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.62em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid var(--gold);
}
.play__points--tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.play__points--tags li {
  padding: 7px 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  font: 500 12px/1 var(--mono);
  color: var(--ink-soft);
}
.play__points--tags li::before {
  display: none;
}
.play__project {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}
.play__project-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font: 500 11px/1.4 var(--mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.play__status {
  color: var(--gold);
}
.play__project h4 {
  margin: 8px 0 0;
  font: 400 26px/1.1 var(--serif);
}
.play__project p {
  margin: 8px 0 0;
  color: var(--ink-soft);
  font-size: 16px;
}
.play__stack {
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.play__links {
  display: flex;
  gap: 18px;
  margin-top: 14px;
}
.play__link {
  display: inline-block;
  color: var(--gold);
  font-weight: 500;
  font-size: 15px;
  text-decoration: none;
  border-bottom: 1px solid rgba(200, 164, 93, 0.4);
}
.play__link--quiet {
  color: var(--ink-soft);
  border-bottom-color: var(--line-strong);
}
@media (max-width: 1000px) {
  .play__grid {
    grid-template-columns: 1fr;
  }
}
</style>
