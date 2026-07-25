import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app/App.vue'
import { router } from './router'
import './styles/main.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: (count, error) => error instanceof Error && error.name === 'TransientHttpError' && count < 2, refetchOnWindowFocus: false } },
})

createApp(App).use(createPinia()).use(router).use(VueQueryPlugin, { queryClient }).mount('#app')
