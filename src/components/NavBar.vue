<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { profile } from '../content'

const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 40)
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const links = [
  { href: '#about', label: 'About' },
  { href: '#journey', label: 'Journey' },
  { href: '#projects', label: 'Playground' },
  { href: '#toolkit', label: 'Toolkit' },
  { href: '#contact', label: 'Contact' },
]
</script>

<template>
  <header class="nav" :class="{ 'is-scrolled': scrolled }">
    <div class="wrap nav__inner">
      <a href="#top" class="nav__mark" aria-label="Firat Aksoy, back to top">
        <svg viewBox="0 0 40 24" width="40" height="24" aria-hidden="true">
          <path d="M3 20 Q20 -4 37 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
          <circle cx="3" cy="20" r="3" fill="var(--amber)" />
          <circle cx="37" cy="20" r="3" fill="var(--coral)" />
        </svg>
        <span>firat aksoy</span>
      </a>
      <nav class="nav__links" aria-label="Sections">
        <a v-for="l in links" :key="l.href" :href="l.href">{{ l.label }}</a>
      </nav>
      <a :href="profile.classic" class="nav__classic" title="Open my 2020 website">
        <span aria-hidden="true">↺</span> 2020 site
      </a>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 20;
  transition: background 0.3s, border-color 0.3s, backdrop-filter 0.3s;
  border-bottom: 1px solid transparent;
}
.nav.is-scrolled {
  background: rgba(7, 11, 22, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom-color: var(--line);
}
.nav__inner {
  height: 68px;
  display: flex;
  align-items: center;
  gap: 24px;
}
.nav__mark {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font: 500 14px/1 var(--mono);
  letter-spacing: 0.04em;
  color: var(--ink);
}
.nav__links {
  margin-left: auto;
  display: flex;
  gap: 28px;
}
.nav__links a {
  text-decoration: none;
  font-size: 14px;
  color: var(--ink-soft);
  transition: color 0.2s;
}
.nav__links a:hover {
  color: var(--ink);
}
.nav__classic {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  font: 500 13px/1 var(--mono);
  color: var(--amber);
  padding: 9px 13px;
  border: 1px dashed rgba(255, 181, 71, 0.5);
  border-radius: 999px;
  transition: background 0.2s;
}
.nav__classic:hover {
  background: rgba(255, 181, 71, 0.1);
}
@media (max-width: 760px) {
  .nav__links {
    display: none;
  }
  .nav__classic {
    margin-left: auto;
  }
}
</style>
