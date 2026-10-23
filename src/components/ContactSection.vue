<script setup lang="ts">
import { ref } from 'vue'
import { contact, profile } from '../content'
import { lens, pick } from '../useLens'

const copied = ref(false)
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    window.location.href = `mailto:${profile.email}`
  }
}
</script>

<template>
  <section id="contact" class="contact" data-globe="bridge">
    <div class="wrap contact__inner">
      <p class="kicker" data-reveal>06 · Contact</p>
      <h2 class="contact__title" data-reveal>{{ contact.headline }}</h2>
      <Transition name="swap" mode="out-in">
        <p :key="lens" class="contact__body">{{ pick(contact.body) }}</p>
      </Transition>
      <div class="contact__actions" data-reveal>
        <a class="btn btn--primary" :href="`mailto:${profile.email}`">Email me</a>
        <button type="button" class="btn" @click="copyEmail">{{ copied ? 'Copied' : 'Copy email' }}</button>
        <a class="btn" :href="profile.resume" download>Resume (PDF)</a>
      </div>
      <ul class="contact__links" data-reveal>
        <li><a :href="profile.linkedin" target="_blank" rel="noopener">LinkedIn ↗</a></li>
        <li><a :href="profile.github" target="_blank" rel="noopener">GitHub ↗</a></li>
        <li><span>{{ profile.location }}</span></li>
      </ul>
    </div>
    <footer class="footer wrap">
      <span>© 2026 {{ profile.name }} · Built with Vue, Three.js and Claude Code</span>
      <a :href="profile.classic" class="footer__classic">
        <span aria-hidden="true">↺</span> Visit the 2020 version of this site
      </a>
    </footer>
  </section>
</template>

<style scoped>
.contact {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 140px 0 0;
}
.contact__inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.contact__title {
  margin: 18px 0 0;
  font: 400 clamp(56px, 10vw, 140px) / 0.95 var(--serif);
  letter-spacing: -0.02em;
  text-shadow: 0 2px 40px rgba(8, 17, 34, 0.9);
}
.contact__body {
  max-width: 520px;
  margin: 24px auto 0;
  font-size: 19px;
  color: var(--ink-soft);
  text-shadow: 0 1px 20px rgba(8, 17, 34, 0.9);
}
.contact__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 36px;
}
.contact__actions .btn:not(.btn--primary) {
  background: rgba(8, 17, 34, 0.6);
  backdrop-filter: blur(8px);
}
.contact__links {
  list-style: none;
  padding: 0;
  margin: 32px 0 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  font: 500 13px/1 var(--mono);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.contact__links a {
  text-decoration: none;
  color: var(--ink-soft);
}
.contact__links a:hover {
  color: var(--gold);
}
.footer {
  margin-top: auto;
  padding-top: 120px;
  padding-bottom: 32px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
  color: var(--muted);
}
.footer__classic {
  color: var(--gold);
  text-decoration: none;
  font-family: var(--mono);
}
</style>
