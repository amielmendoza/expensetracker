import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Global error handler to catch unhandled promise rejections
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error handler:', err, info)
  // Prevent the error from crashing the app
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  event.preventDefault() // Prevent the error from being logged to console
})

app.use(createPinia())
app.use(router)

app.mount('#app')
