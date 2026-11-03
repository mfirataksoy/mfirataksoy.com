<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { desk, projects, type DeskKey, type Project } from '../content'
import { track, pick } from '../useLens'
import type { Track } from '../tracks'
import type { Desk, ScreenKey } from '../desk/Desk'
import { capture } from '../analytics'
import { logInteractiveFallback } from '../posthog-logs'
import DeskIcon from './DeskIcon.vue'

const canvas = ref<HTMLCanvasElement>()
// Each role meets the object that tells its story best first.
const leadObject: Record<Track, DeskKey> = { cs: 'headset', backend: 'server', fullstack: 'laptop', frontend: 'laptop' }
const selected = ref<DeskKey>(leadObject[track.value])
const hover = ref<{ id: DeskKey; x: number; y: number } | null>(null)
const has3d = ref(true)
const touch = window.matchMedia('(hover: none)').matches
let scene: Desk | null = null

const item = computed(() => desk.find((d) => d.id === selected.value)!)
const ordered = computed(() => {
  const lead = leadObject[track.value]
  return [...desk].sort((a, b) => Number(b.id === lead) - Number(a.id === lead))
})
// Every project on the desk, once, in one list in the order content.ts gives them.
const objectOf = new Map(desk.flatMap((d) => (d.projects ?? []).map((n) => [n, d.id] as const)))
const list = projects.filter((p) => objectOf.has(p.name))
const active = ref<Project | null>(null)
const rows = new Map<string, HTMLElement>()
const tools = ref<HTMLElement>()
const side = ref<HTMLElement>()
const firstSentence = (text: string) => text.split(/(?<=\.)\s/)[0]

// The open project also lights up its device on the desk when it has a screenshot.
function show(p: Project | null) {
  active.value = p
  for (const key of ['laptop', 'monitor', 'phone'] as ScreenKey[]) scene?.showScreen(key, null)
  if (p?.screen && p.preview) scene?.showScreen(p.screen, p.preview)
}

function firstOn(id: DeskKey) {
  const mine = list.filter((p) => objectOf.get(p.name) === id)
  return mine.find((p) => p.preview) ?? mine[0] ?? null
}

function choose(id: DeskKey, from?: 'desk' | 'tools') {
  if (from) capture('desk_object_open', { object: id, from })
  selected.value = id
  scene?.select(id)
  const first = firstOn(id)
  show(first)
  if (!from) return
  // Keep the chosen object's button in sight in the phone's swipeable toolbar.
  const tool = tools.value?.querySelector<HTMLElement>(`[data-object="${id}"]`)
  if (tool && tools.value!.scrollWidth > tools.value!.clientWidth) {
    tools.value!.scrollTo({ left: tool.offsetLeft - 16, behavior: 'smooth' })
  }
  // Side by side, bring the object's projects (or its story) into view; on phones the list sits below and the page stays put.
  if (window.matchMedia('(min-width: 1001px)').matches) {
    const target = first ? rows.get(first.name) : side.value
    target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }
}

function open(p: Project) {
  capture('project_preview', { project: p.name })
  const id = objectOf.get(p.name)!
  if (id !== selected.value) {
    selected.value = id
    scene?.select(id)
  }
  show(p)
}

show(firstOn(selected.value))
watch(track, (t) => choose(leadObject[t]))

const hoverLabel = computed(() => desk.find((d) => d.id === hover.value?.id)?.object)

onMounted(async () => {
  try {
    const { Desk } = await import('../desk/Desk')
    scene = new Desk(
      canvas.value!,
      (id) => choose(id, 'desk'),
      (id, x, y) => (hover.value = id && !touch ? { id, x, y } : null),
    )
    scene.select(selected.value)
    show(active.value)
    if (import.meta.env.DEV) Object.assign(window, { __desk: scene })
  } catch (err) {
    console.warn('Desk disabled:', err)
    logInteractiveFallback('desk')
    has3d.value = false
  }
})

onBeforeUnmount(() => scene?.dispose())
</script>

<template>
  <section id="projects" class="play" data-globe="dim">
    <div class="wrap">
      <header data-reveal>
        <p class="kicker">02 · Projects</p>
        <h2 class="section-title">Things I’ve <em>built</em>.</h2>
        <p class="play__hint">{{ has3d ? (touch ? 'Tap an object on the desk' : 'Select an object on the desk') : 'Select an object to read its story' }}</p>
      </header>

      <div class="play__grid" :class="{ 'play__grid--flat': !has3d }">
        <div class="play__desk" data-reveal>
          <div v-show="has3d" class="play__stage">
            <canvas ref="canvas" class="play__canvas" aria-hidden="true" />
            <span
              v-if="hover"
              class="play__tip"
              :style="{ transform: `translate(${hover.x}px, ${hover.y}px)` }"
            >{{ hoverLabel }}</span>
          </div>
          <div ref="tools" class="play__tools" role="toolbar" aria-label="Objects on the desk">
            <button
              v-for="d in ordered"
              :key="d.id"
              type="button"
              :data-object="d.id"
              class="play__tool"
              :class="{ 'is-on': d.id === selected }"
              :aria-pressed="d.id === selected"
              @click="choose(d.id, 'tools')"
            >
              <DeskIcon :id="d.id" :size="16" />
              <span>{{ d.object }}</span>
            </button>
          </div>
        </div>

        <div ref="side" class="play__side">
          <Transition name="swap" mode="out-in">
            <article :key="`${selected}-${track}`" class="play__note" aria-live="polite">
              <p class="play__object"><DeskIcon :id="item.id" :size="14" /> {{ item.object }}</p>
              <h3 class="play__title">{{ pick(item.title) }}</h3>
              <p class="play__body">{{ pick(item.body) }}</p>
              <ul v-if="item.points" class="play__points" :class="{ 'play__points--tags': item.id === 'server' }">
                <li v-for="p in item.points" :key="p">{{ p }}</li>
              </ul>
            </article>
          </Transition>

          <p class="play__count">All projects · {{ list.length }}</p>
          <ol class="work">
            <li
              v-for="p in list"
              :key="p.name"
              :ref="(el) => el && rows.set(p.name, el as HTMLElement)"
              class="work__row"
              :class="{ 'is-on': objectOf.get(p.name) === selected, 'is-open': active?.name === p.name }"
            >
              <button type="button" class="work__open" :aria-expanded="active?.name === p.name" @click="open(p)">
                <span class="work__thumb" :class="{ 'work__thumb--phone': p.screen === 'phone' }">
                  <img v-if="p.preview" :src="p.preview" alt="" loading="lazy" />
                  <DeskIcon v-else :id="objectOf.get(p.name)!" :size="22" />
                </span>
                <span class="work__text">
                  <span class="work__meta">
                    {{ p.kind }} · {{ p.year }}<span v-if="p.status" class="work__status"> · {{ p.status }}</span>
                  </span>
                  <span class="work__name">{{ p.name }}</span>
                  <span class="work__line">{{ active?.name === p.name ? p.body : firstSentence(p.body) }}</span>
                </span>
              </button>
              <ul v-if="active?.name === p.name" class="work__stack">
                <li v-for="s in p.stack" :key="s" class="tag">{{ s }}</li>
              </ul>
              <div v-if="p.link || p.code" class="work__links">
                <a v-if="p.link" :href="p.link.href" target="_blank" rel="noopener" class="play__link" data-event="project_link" :data-project="p.name" data-kind="site">
                  {{ p.link.label }} <span aria-hidden="true">↗</span>
                </a>
                <a v-if="p.code" :href="p.code" target="_blank" rel="noopener" class="play__link play__link--quiet" data-event="project_link" :data-project="p.name" data-kind="code">
                  Code <span aria-hidden="true">↗</span>
                </a>
              </div>
            </li>
          </ol>
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
  font: 600 12px/1 var(--sans);
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
/* The desk stays in view while the list beside it scrolls past. */
.play__desk {
  position: sticky;
  top: 92px;
}
.play__stage {
  position: relative;
  aspect-ratio: 1;
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
  font: 600 12px/1 var(--sans);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--bg);
  background: var(--gold);
  pointer-events: none;
  white-space: nowrap;
}
.play__tools {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}
.play__tool {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(8, 17, 34, 0.6);
  color: var(--muted);
  font: 500 12.5px/1 var(--sans);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.play__tool:hover {
  color: var(--ink);
  border-color: var(--line-strong);
}
.play__tool.is-on {
  background: var(--gold);
  border-color: var(--gold);
  color: #0b1426;
}
.play__side {
  scroll-margin-top: 96px;
}
.play__note {
  padding: 22px 24px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: rgba(12, 23, 45, 0.88);
}
.play__object {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font: 600 12px/1 var(--sans);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
}
.play__title {
  margin: 10px 0 0;
  font: 600 clamp(22px, 2.1vw, 26px) / 1.15 var(--sans);
  letter-spacing: -0.025em;
}
.play__body {
  margin: 10px 0 0;
  color: var(--ink-soft);
  font-size: 16px;
}
.play__points {
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}
.play__points li {
  position: relative;
  padding-left: 20px;
  color: var(--ink);
  font-size: 15px;
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
  font: 600 12px/1 var(--sans);
  color: var(--ink-soft);
}
.play__points--tags li::before {
  display: none;
}
.play__count {
  margin: 26px 0 10px;
  font: 600 11px/1 var(--sans);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}
.work {
  --indent: 96px;
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}
.work__row {
  /* Clear the fixed nav when the desk scrolls a row into view. */
  scroll-margin: 96px 0 24px;
  padding-bottom: 14px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: rgba(12, 23, 45, 0.82);
  transition: border-color 0.25s, background 0.25s;
}
.work__row.is-on {
  border-color: rgba(200, 164, 93, 0.45);
}
.work__row.is-open {
  border-color: var(--gold);
  background: rgba(15, 27, 52, 0.95);
}
.work__open {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  width: 100%;
  padding: 14px 14px 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.work__thumb {
  flex: none;
  display: grid;
  place-items: center;
  width: 68px;
  height: 46px;
  border-radius: 7px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: rgba(8, 17, 34, 0.7);
  color: var(--gold);
}
.work__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}
.work__thumb--phone img {
  object-position: center 15%;
}
.work__text {
  display: grid;
  gap: 3px;
  min-width: 0;
}
.work__meta {
  font: 600 10.5px/1.4 var(--sans);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.work__status {
  color: var(--gold);
}
.work__name {
  font: 600 18px/1.2 var(--sans);
  letter-spacing: -0.015em;
  color: var(--ink);
}
.work__row.is-on .work__name {
  color: var(--gold-soft);
}
.work__line {
  font-size: 14.5px;
  line-height: 1.45;
  color: var(--ink-soft);
}
.work__row:not(.is-open) .work__line {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.work__stack {
  list-style: none;
  margin: 12px 14px 0 var(--indent);
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.work__links {
  display: flex;
  gap: 18px;
  margin: 10px 14px 0 var(--indent);
}
.play__link {
  display: inline-block;
  color: var(--gold);
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  border-bottom: 1px solid rgba(200, 164, 93, 0.4);
}
.play__link--quiet {
  color: var(--ink-soft);
  border-bottom-color: var(--line-strong);
}
@media (max-width: 1000px) {
  .play__grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .play__desk {
    position: static;
  }
}
@media (max-width: 760px) {
  .play {
    padding-top: 90px;
  }
  .play__grid {
    gap: 18px;
    margin-top: 28px;
  }
  .play__stage {
    aspect-ratio: 1 / 0.92;
  }
  /* One swipeable row of objects under the desk. */
  .play__tools {
    flex-wrap: nowrap;
    overflow-x: auto;
    margin-right: -16px;
    padding-right: 16px;
    scrollbar-width: none;
  }
  .play__tools::-webkit-scrollbar {
    display: none;
  }
  .play__tool {
    flex: none;
  }
  .play__note {
    padding: 18px;
  }
  .work {
    --indent: 80px;
  }
  .work__open {
    gap: 12px;
    padding: 12px 12px 0;
  }
  .work__thumb {
    width: 56px;
    height: 40px;
  }
  .work__name {
    font-size: 17px;
  }
}
</style>
