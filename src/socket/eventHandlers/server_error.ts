import { defineSocketHandler } from '@/socket/socket'

export default defineSocketHandler({
	event: 'server:error',
	handler: (data) => {
		console.dir(data, { depth: null })
	},
})
