import { useAuth } from '@clerk/vue'
import { watch } from 'vue'

const _template = 'megacollab_session' as const

export default function useClerkHelper() {
	const { isLoaded, userId, getToken, signOut } = useAuth()

	function ensureLoaded(): Promise<void> {
		return new Promise((res) => {
			if (isLoaded.value) return res()

			const { stop } = watch(isLoaded, (loaded) => {
				if (!loaded) return

				stop()
				res()
			})
		})
	}

	async function getAuthToken() {
		await ensureLoaded()
		return await getToken.value({ template: _template })
	}

	async function getUserId() {
		await ensureLoaded()
		return userId.value
	}

	async function signOutUser() {
		await ensureLoaded()
		await signOut.value({ redirectUrl: '/login' })
	}

	return {
		getUserId,
		getAuthToken,
		signOutUser,
	}
}
