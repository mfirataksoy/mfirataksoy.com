import { createApp } from 'vue'
import posthog from 'posthog-js'
import { analyticsEnabled } from './analytics'
import { logApplicationMounted } from './posthog-logs'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles/main.css'
import App from './App.vue'

const app = createApp(App)
// Off in dev and for browsers opted out with ?notrack (see analytics.ts).
if (analyticsEnabled) {
  posthog.init(import.meta.env.VITE_POSTHOG_PROJECT_TOKEN, {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    defaults: '2026-01-30',
    // Cookieless (KVKK): nothing is stored on the device and there is no
    // screen recording, so no consent banner is needed. PostHog identifies
    // visits with a server-side hash; the project must have cookieless mode
    // turned on in its settings, or these events are dropped.
    cookieless_mode: 'always',
    persistence: 'memory',
    disable_session_recording: true,
    logs: {
      serviceName: 'mfirataksoy.com-web',
      environment: import.meta.env.MODE,
    },
  })

  app.config.errorHandler = (error) => {
    posthog.captureException(error)
  }
}

app.mount('#app')
logApplicationMounted()

// Scroll triggers and the WebGL scene don't survive hot module swaps, so a
// code change in dev reloads the page instead of patching it in place.
if (import.meta.hot) import.meta.hot.on('vite:beforeUpdate', () => location.reload())
