import { defineSocketHandler } from '@/socket/socket'
import { clips } from '@/state'

export default defineSocketHandler({
	event: 'clip:update',
	handler: (clip) => {
		const existing = clips.get(clip.id)
		if (!existing) {
			clips.set(clip.id, clip)
			return
		}

		clips.set(clip.id, {
			...existing,
			...clip,
		})
	},
})
