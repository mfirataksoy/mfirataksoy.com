<script setup lang="ts">
import { principles } from '../content'
</script>

<template>
  <section id="principles" class="principles">
    <div class="wrap">
      <header class="principles__head" data-reveal>
        <p class="kicker">03 · Principles</p>
        <h2 class="section-title">{{ principles.title }}</h2>
        <p class="principles__intro">{{ principles.intro }}</p>
      </header>
      <ol class="principles__list">
        <li v-for="p in principles.items" :key="p.n" class="principle" data-reveal>
          <span class="principle__n" aria-hidden="true">{{ p.n }}</span>
          <h3 class="principle__title">{{ p.title }}</h3>
          <p class="principle__body">{{ p.body }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.principles {
  position: relative;
  padding: 120px 0 60px;
}
.principles__head {
  max-width: 620px;
}
.principles__intro {
  margin: 18px 0 0;
  font-size: 18px;
  color: var(--ink-soft);
}
.principles__list {
  list-style: none;
  margin: 56px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
  border-top: 1px solid var(--line);
}
.principle {
  padding: 32px 32px 12px 0;
}
.principle + .principle {
  border-left: 1px solid var(--line);
  padding-left: 32px;
}
.principle__n {
  display: block;
  font: italic 400 22px/1 var(--serif);
  color: var(--gold);
}
.principle__title {
  margin: 18px 0 0;
  font: italic 400 clamp(28px, 2.6vw, 34px) / 1.1 var(--serif);
  letter-spacing: -0.005em;
}
.principle__body {
  margin: 14px 0 0;
  color: var(--ink-soft);
}
@media (max-width: 900px) {
  .principle,
  .principle + .principle {
    border-left: 0;
    padding: 28px 0 8px;
  }
  .principle + .principle {
    border-top: 1px solid var(--line);
  }
}
</style>
