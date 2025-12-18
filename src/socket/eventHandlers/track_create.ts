import { defineSocketHandler } from '@/socket/socket'
import { tracks } from '@/state'

export default defineSocketHandler({
	event: 'track:create',
	handler: (track) => {
		const existing = tracks.get(track.id)

		if (existing) {
			tracks.set(track.id, {
				...existing,
				...track,
			})

			return
		}

		// todo: will prolly cause a reordering sometime in the future!
		// when implementing on server, dont foregt to change here too aaaaaaaa
		tracks.set(track.id, track)
	},
})
