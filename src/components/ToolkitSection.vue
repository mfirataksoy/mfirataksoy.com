<script setup lang="ts">
import { toolkit } from '../content'
import { track, pickList } from '../useLens'
</script>

<template>
  <section id="toolkit" class="toolkit" data-globe="dim">
    <div class="wrap">
      <header data-reveal>
        <p class="kicker">04 · Toolkit</p>
        <h2 class="section-title">What I bring <em>across</em>.</h2>
      </header>
      <div data-reveal>
      <Transition name="swap" mode="out-in">
        <div :key="track" class="toolkit__grid">
          <div v-for="g in pickList(toolkit)" :key="g.group" class="toolkit__group">
            <h3>{{ g.group }}</h3>
            <ul>
              <li v-for="item in g.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </Transition>
      </div>
    </div>
  </section>
</template>

<style scoped>
.toolkit {
  position: relative;
  padding: 140px 0 100px;
}
.toolkit__grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  margin-top: 56px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
}
.toolkit__group {
  flex: 1 1 200px;
  background: rgba(8, 17, 34, 0.88);
  padding: 26px 24px 28px;
  transition: background 0.3s;
}
.toolkit__group:hover {
  background: rgba(19, 33, 62, 0.92);
}
.toolkit__group h3 {
  margin: 0 0 16px;
  font: 500 12px/1 var(--mono);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gold);
}
.toolkit__group ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}
.toolkit__group li {
  color: var(--ink);
  font-size: 16px;
}
</style>
