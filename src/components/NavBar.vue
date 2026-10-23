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
        <!-- The mark: a suspension bridge drawn as the Gemini glyph. -->
        <svg viewBox="0 0 52 44" width="30" height="26" aria-hidden="true">
          <g fill="none" stroke-linecap="round">
            <path d="M6 6 Q26 16 46 6 M6 38 Q26 28 46 38" stroke="var(--gold)" stroke-width="3" />
            <path d="M16 10 V34 M36 10 V34" stroke="var(--gold-soft)" stroke-width="3.6" />
          </g>
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
  background: rgba(8, 17, 34, 0.72);
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
  color: var(--ink-soft);
  padding: 9px 13px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  transition: color 0.2s, border-color 0.2s;
}
.nav__classic:hover {
  color: var(--gold-soft);
  border-color: rgba(200, 164, 93, 0.5);
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
