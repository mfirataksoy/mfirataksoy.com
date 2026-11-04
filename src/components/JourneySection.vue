<script setup lang="ts">
import { chapters, nowChapter } from '../content'
import { track, pick } from '../useLens'
</script>

<template>
  <section id="journey" class="journey">
    <div class="wrap">
      <header class="journey__head" data-reveal>
        <p class="kicker">01 · Experience</p>
        <h2 class="section-title">Work and <em>education</em>.</h2>
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
              <h3 :key="track" class="chapter__title">{{ pick(c.title) }}</h3>
            </Transition>
            <p class="chapter__org">{{ c.org }} — {{ c.role }}</p>
            <div class="chapter__text">
              <div v-if="c.logo" class="chapter__logo">
                <img :src="c.logo.src" :alt="c.logo.alt" loading="lazy" />
              </div>
              <Transition name="swap" mode="out-in">
                <p :key="track" class="chapter__body">{{ pick(c.body) }}</p>
              </Transition>
            </div>
            <ul class="chapter__tags">
              <li v-for="t in (track === 'cs' && c.csTags) || c.tags" :key="t" class="tag">{{ t }}</li>
            </ul>
          </article>
        </li>
        <li class="chapter chapter--now" data-chapter="now">
          <span class="chapter__node" aria-hidden="true" />
          <article class="chapter__card" data-reveal>
            <p class="chapter__meta"><span>{{ nowChapter.years }}</span><span aria-hidden="true">·</span><span>Istanbul</span></p>
            <Transition name="swap" mode="out-in">
              <h3 :key="track" class="chapter__title">{{ pick(nowChapter.title) }}</h3>
            </Transition>
            <Transition name="swap" mode="out-in">
              <p :key="track" class="chapter__body">{{ pick(nowChapter.body) }}</p>
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
  background: linear-gradient(var(--gold), var(--gold-soft));
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
  border-color: var(--gold);
  background: var(--gold);
  box-shadow: 0 0 0 6px rgba(200, 164, 93, 0.15);
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
  border-color: rgba(200, 164, 93, 0.35);
}
.chapter--bridge .chapter__title {
  font-style: italic;
  color: var(--gold);
}
/* The school or employer logo sits in the description, on a light tile so its own
   colours read on the dark card, and the text wraps around it. */
.chapter__text {
  display: flow-root;
}
.chapter__logo {
  float: right;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 168px;
  height: 92px;
  margin: 4px 0 10px 20px;
  padding: 14px 18px;
  border-radius: 12px;
  background: #f7f4ee;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}
.chapter__logo img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.chapter__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  font: 600 12px/1.4 var(--sans);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--gold);
}
.chapter__title {
  margin: 14px 0 0;
  font: 600 clamp(24px, 2.6vw, 30px) / 1.12 var(--sans);
  letter-spacing: -0.025em;
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
  .chapter__logo {
    width: 104px;
    height: 60px;
    margin: 4px 0 8px 14px;
    padding: 9px 11px;
  }
  .journey__list {
    padding-left: 32px;
  }
  .journey__rail {
    left: 6px;
  }
  .chapter__node {
    left: -33px;
    top: calc(6svh + 30px);
  }
  /* The globe holds the top band on phones; cards scroll up under it, one chapter at a time. */
  .journey__list {
    margin-top: 40px;
  }
  .chapter,
  .chapter--now {
    min-height: 0;
    align-items: flex-start;
    padding: 6svh 0 14svh;
  }
  .chapter--now {
    padding-bottom: 30svh;
  }
  .chapter__card {
    padding: 20px 18px;
    background: rgba(12, 23, 45, 0.9);
  }
  .chapter__title {
    font-size: 23px;
  }
  .chapter__body {
    font-size: 15.5px;
    line-height: 1.55;
  }
}
</style>
