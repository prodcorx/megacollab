import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import { clerkPlugin } from '@clerk/vue'
import '@/styles.css'

const inDev = import.meta.env.MODE === 'development'
const app = createApp(App)

if (!inDev) {
	app.use(clerkPlugin, {
		publishableKey: import.meta.env.VITE_APP_CLERK_PUBLISHABLE_KEY,
	})
}

app.use(router)
app.mount('#app')
