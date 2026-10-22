import { createApp } from 'vue'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './styles/main.css'
import App from './App.vue'

createApp(App).mount('#app')

// Scroll triggers and the WebGL scene don't survive hot module swaps, so a
// code change in dev reloads the page instead of patching it in place.
if (import.meta.hot) import.meta.hot.on('vite:beforeUpdate', () => location.reload())
