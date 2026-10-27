<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { chapters } from './content'
import { globe } from './globe/store'
import GlobeStage from './components/GlobeStage.vue'
import NavBar from './components/NavBar.vue'
import RolePicker from './components/RolePicker.vue'
import HeroSection from './components/HeroSection.vue'
import AboutSection from './components/AboutSection.vue'
import JourneySection from './components/JourneySection.vue'
import ToolkitSection from './components/ToolkitSection.vue'
import PlaygroundSection from './components/PlaygroundSection.vue'
import ContactSection from './components/ContactSection.vue'

gsap.registerPlugin(ScrollTrigger)

const reduced =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  (import.meta.env.DEV && new URLSearchParams(location.search).has('instant'))
const mobile = window.matchMedia('(max-width: 760px)')
const sideOrTop = () => (mobile.matches ? 'top' : 'side')
let ctx: gsap.Context | undefined

onMounted(async () => {
  await nextTick()
  ctx = gsap.context(() => {
    if (!reduced) {
      gsap.from('[data-hero]', { y: 36, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.09, delay: 0.15 })
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 88%',
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08 }),
      })
    } else {
      gsap.set('[data-reveal]', { opacity: 1, y: 0 })
    }

    ScrollTrigger.create({
      trigger: '#top',
      start: 'top top',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (!self.isActive) return
        globe.value?.focus('hero')
        globe.value?.setLayout(sideOrTop(), 1)
      },
    })

    ScrollTrigger.create({
      trigger: '#about',
      start: 'top 60%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (!self.isActive) return
        globe.value?.focus('hero')
        globe.value?.setLayout('side', 0.25)
      },
    })

    const allChapters = [...chapters.map((c) => ({ id: c.id, focus: c.focus, arc: c.arc })), { id: 'now', focus: 'istanbul' as const, arc: undefined }]
    for (const c of allChapters) {
      const el = document.querySelector<HTMLElement>(`[data-chapter="${c.id}"]`)
      if (!el) continue
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          el.classList.toggle('is-active', self.isActive)
          if (!self.isActive) return
          globe.value?.focus(c.focus, c.arc)
          globe.value?.setLayout(sideOrTop(), mobile.matches ? 0.9 : 1)
        },
      })
    }

    const list = document.querySelector<HTMLElement>('.journey__list')
    if (list) {
      ScrollTrigger.create({
        trigger: list,
        start: 'top 55%',
        end: 'bottom 55%',
        onUpdate: (self) => list.style.setProperty('--progress', self.progress.toFixed(3)),
      })
    }

    ScrollTrigger.create({
      trigger: '#projects',
      start: 'top 60%',
      endTrigger: '#toolkit',
      end: 'bottom 40%',
      onToggle: (self) => {
        if (!self.isActive) return
        globe.value?.focus('bridge')
        globe.value?.setLayout('side', 0.22)
      },
    })

    ScrollTrigger.create({
      trigger: '#contact',
      start: 'top 45%',
      end: 'bottom bottom',
      onToggle: (self) => {
        if (!self.isActive) return
        globe.value?.focus('bridge')
        globe.value?.setLayout('center', 0.8)
      },
    })
  })

  // Fonts change line heights; recompute trigger positions once they land.
  document.fonts?.ready.then(() => ScrollTrigger.refresh())
})

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <GlobeStage />
  <NavBar />
  <RolePicker />
  <main class="page">
    <HeroSection />
    <AboutSection />
    <JourneySection />
    <PlaygroundSection />
    <ToolkitSection />
    <ContactSection />
  </main>
</template>

<style scoped>
.page {
  position: relative;
  z-index: 1;
}
</style>
