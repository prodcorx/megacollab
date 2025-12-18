import { defineSocketHandler } from '@/socket/socket'

export default defineSocketHandler({
	event: 'server:refresh',
	handler: () => {
		window.location.reload()
	},
})
