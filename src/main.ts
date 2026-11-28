import { inject } from '@vercel/analytics'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).use(createPinia()).mount('#app')

if (import.meta.env.PROD) {
  inject()
}
