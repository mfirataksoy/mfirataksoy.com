<script setup lang="ts">
import { chapters, nowChapter } from '../content'
import { lens, pick } from '../useLens'
</script>

<template>
  <section id="journey" class="journey">
    <div class="wrap">
      <header class="journey__head" data-reveal>
        <p class="kicker">02 · The route</p>
        <h2 class="section-title">The route <em>so far</em>.</h2>
      </header>

      <ol class="journey__list">
        <span class="journey__rail" aria-hidden="true"><span class="journey__fill" /></span>
        <li
          v-for="c in chapters"
          :key="c.id"
          class="chapter"
          :data-chapter="c.id"
          :class="{ 'chapter--bridge': c.id === 'csm' }"
        >
          <span class="chapter__node" aria-hidden="true" />
          <article class="chapter__card" data-reveal>
            <p class="chapter__meta">
              <span>{{ c.years }}</span><span aria-hidden="true">·</span><span>{{ c.place }}</span>
            </p>
            <Transition name="swap" mode="out-in">
              <h3 :key="lens" class="chapter__title">{{ pick(c.title) }}</h3>
            </Transition>
            <p class="chapter__org">{{ c.org }} — {{ c.role }}</p>
            <Transition name="swap" mode="out-in">
              <p :key="lens" class="chapter__body">{{ pick(c.body) }}</p>
            </Transition>
            <ul class="chapter__tags">
              <li v-for="t in (lens === 'cs' && c.csTags) || c.tags" :key="t" class="tag">{{ t }}</li>
            </ul>
          </article>
        </li>
        <li class="chapter chapter--now" data-chapter="now">
          <span class="chapter__node" aria-hidden="true" />
          <article class="chapter__card" data-reveal>
            <p class="chapter__meta"><span>{{ nowChapter.years }}</span><span aria-hidden="true">·</span><span>Istanbul</span></p>
            <Transition name="swap" mode="out-in">
              <h3 :key="lens" class="chapter__title">{{ pick(nowChapter.title) }}</h3>
            </Transition>
            <Transition name="swap" mode="out-in">
              <p :key="lens" class="chapter__body">{{ pick(nowChapter.body) }}</p>
            </Transition>
          </article>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.journey {
  position: relative;
  padding: 120px 0 80px;
}
.journey__head {
  max-width: 560px;
}
.journey__list {
  position: relative;
  list-style: none;
  margin: 72px 0 0;
  padding: 0 0 0 44px;
  max-width: 540px;
}
.journey__rail {
  position: absolute;
  left: 11px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--line);
  border-radius: 2px;
  overflow: hidden;
}
.journey__fill {
  position: absolute;
  inset: 0;
  background: linear-gradient(var(--amber), var(--coral));
  transform-origin: top;
  transform: scaleY(var(--progress, 0));
}
.chapter {
  position: relative;
  min-height: 78vh;
  display: flex;
  align-items: center;
}
.chapter__node {
  position: absolute;
  left: -40px;
  top: 50%;
  width: 16px;
  height: 16px;
  margin-top: -8px;
  border-radius: 50%;
  background: var(--bg);
  border: 2px solid var(--line-strong);
  transition: border-color 0.4s, background 0.4s, box-shadow 0.4s;
}
.chapter.is-active .chapter__node {
  border-color: var(--amber);
  background: var(--amber);
  box-shadow: 0 0 0 6px rgba(255, 181, 71, 0.15);
}
.chapter__card {
  width: 100%;
  padding: 28px 28px 26px;
  border-radius: var(--radius);
  background: var(--bg-raise);
  border: 1px solid var(--line);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: border-color 0.4s;
}
.chapter.is-active .chapter__card {
  border-color: rgba(255, 181, 71, 0.35);
}
.chapter--bridge .chapter__title {
  font-style: italic;
  color: var(--amber);
}
.chapter__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  font: 500 12px/1.4 var(--mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--amber);
}
.chapter__title {
  margin: 14px 0 0;
  font: 400 clamp(30px, 3.4vw, 40px) / 1.05 var(--serif);
  letter-spacing: -0.005em;
}
.chapter__org {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--muted);
}
.chapter__body {
  margin: 14px 0 0;
  color: var(--ink-soft);
}
.chapter__tags {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chapter--now {
  min-height: 70vh;
}
@media (max-width: 760px) {
  .journey__list {
    padding-left: 32px;
  }
  .journey__rail {
    left: 6px;
  }
  .chapter__node {
    left: -33px;
  }
  .chapter {
    min-height: 92vh;
    align-items: flex-end;
    padding-bottom: 8vh;
  }
  .chapter__card {
    padding: 22px 20px;
    background: rgba(10, 15, 34, 0.86);
  }
}
</style>
