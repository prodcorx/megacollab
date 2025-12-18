import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/views/Index.vue'
import useClerkHelper from '@/composables/useClerkHelper'

declare module 'vue-router' {
	interface RouteMeta {
		auth: 'auth' | 'none' | 'admin'
	}
}

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: Index,
			meta: { auth: 'auth' },
		},
		{
			path: '/login',
			name: 'login',
			component: () => import('@/views/Login.vue'),
			meta: { auth: 'none' },
		},
	],
})

router.beforeEach(async (to, from, next) => {
	const inDev = import.meta.env.MODE === 'development'

	if (inDev) return next()

	const { getUserId, getAuthToken } = useClerkHelper()
	const userId = await getUserId()
	const token = await getAuthToken()

	const isAuthenticated = !!userId && !!token

	if ((to.meta.auth === 'auth' || to.meta.auth === 'admin') && !isAuthenticated) {
		return next({ name: 'login' })
	}

	if (to.name === 'login' && isAuthenticated) {
		return next({ name: 'home' })
	}

	return next()
})

export default router
