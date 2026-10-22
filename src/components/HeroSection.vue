<script setup lang="ts">
import { about, hero, profile } from '../content'
import { lens, pick } from '../useLens'
import LensSwitch from './LensSwitch.vue'
</script>

<template>
  <section id="top" class="hero" data-globe="hero">
    <div class="wrap hero__inner">
      <p class="kicker hero__kicker" data-hero>
        <span class="hero__dot" aria-hidden="true" /> {{ pick(hero.kicker) }}
      </p>
      <h1 class="hero__title">
        <span class="hero__name" data-hero>
          <img class="hero__avatar" :src="about.photo" alt="" width="40" height="40" />
          {{ profile.name }}
        </span>
        <span class="hero__headline" data-hero>
          I build
          <em class="hero__bridges">
            bridges
            <svg class="hero__arc" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true">
              <path d="M4 36 Q150 -18 296 36" pathLength="1" />
            </svg>
          </em>
        </span>
      </h1>
      <Transition name="swap" mode="out-in">
        <p :key="lens" class="hero__sub" data-hero>{{ pick(hero.sub) }}</p>
      </Transition>
      <div class="hero__lens" data-hero><LensSwitch /></div>
      <div class="hero__actions" data-hero>
        <a class="btn btn--primary" :href="profile.resume" download>
          Download resume
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 4v12m0 0 5-5m-5 5-5-5M5 20h14" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </a>
        <a class="btn" href="#contact">Get in touch</a>
      </div>
    </div>
    <a href="#journey" class="hero__scroll" aria-label="Scroll to journey">
      <span>Follow the route</span>
      <i aria-hidden="true" />
    </a>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding: 110px 0 120px;
}
.hero__inner {
  position: relative;
}
.hero__kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}
.hero__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.6);
  animation: ping 2.2s infinite;
}
@keyframes ping {
  70% { box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
}
.hero__title {
  margin: 22px 0 0;
  font-weight: 400;
}
.hero__name {
  display: flex;
  align-items: center;
  gap: 12px;
  font: 500 clamp(15px, 1.4vw, 18px) / 1.2 var(--sans);
  color: var(--ink-soft);
  letter-spacing: 0.01em;
}
.hero__avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 181, 71, 0.5);
}
.hero__headline {
  display: block;
  margin-top: 10px;
  font-family: var(--serif);
  font-size: clamp(64px, 11vw, 168px);
  line-height: 0.92;
  letter-spacing: -0.02em;
}
.hero__bridges {
  position: relative;
  display: inline-block;
  font-style: italic;
  color: var(--amber);
}
.hero__arc {
  position: absolute;
  left: -2%;
  bottom: -0.12em;
  width: 104%;
  height: 0.32em;
  overflow: visible;
}
.hero__arc path {
  fill: none;
  stroke: var(--coral);
  stroke-width: 3;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: draw 1.6s 0.9s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
.hero__sub {
  max-width: 560px;
  margin: 28px 0 0;
  font-size: clamp(17px, 1.6vw, 20px);
  line-height: 1.55;
  color: var(--ink-soft);
  min-height: 3.1em;
}
.hero__lens {
  margin-top: 32px;
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}
.hero__scroll {
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font: 500 11px/1 var(--mono);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}
.hero__scroll i {
  width: 1px;
  height: 40px;
  background: linear-gradient(var(--amber), transparent);
  animation: drip 2s infinite;
  transform-origin: top;
}
@keyframes drip {
  0% { transform: scaleY(0); }
  50% { transform: scaleY(1); }
  100% { transform: scaleY(1); opacity: 0; }
}
@media (max-width: 760px) {
  .hero__sub {
    text-shadow: 0 1px 16px rgba(7, 11, 22, 0.95);
  }
  .hero {
    align-items: flex-end;
    padding-top: 46vh;
  }
  .hero__scroll {
    display: none;
  }
}
</style>
