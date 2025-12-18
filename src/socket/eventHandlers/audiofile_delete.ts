import { defineSocketHandler } from '@/socket/socket'
import { audioBuffers, audiofiles, clips } from '@/state'
import { deleteAudioFile, deleteBitmaps } from '@/utils/workerPool'

export default defineSocketHandler({
	event: 'audiofile:delete',
	handler: async ({ id }) => {
		audiofiles.delete(id)
		audioBuffers.delete(id)

		for (const clip of clips.values()) {
			if (clip.audio_file_id === id) {
				clips.delete(clip.id)
			}
		}

		await Promise.allSettled([deleteAudioFile(id, id), deleteBitmaps(id, id)])
	},
})
