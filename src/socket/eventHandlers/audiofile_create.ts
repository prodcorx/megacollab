import { defineSocketHandler } from '@/socket/socket'
import { audiofiles } from '@/state'
import { ingestNewAudioFileMetadata } from '@/utils/preProcessAudio'
import { useToast } from '@/composables/useToast'
import { makeAudioFileHash } from '~/utils'

const { addToast } = useToast()

export default defineSocketHandler({
	event: 'audiofile:create',
	handler: async (data) => {
		try {
			audiofiles.set(data.id, {
				...data,
				hash: makeAudioFileHash({
					creator_user_id: data.creator_user_id,
					file_name: data.file_name,
					duration: data.duration,
				}),
			})

			await ingestNewAudioFileMetadata(data)
		} catch (err) {
			addToast({
				type: 'notification',
				title: 'Audio file creation failed',
				message: `File: ${data.file_name}`,
				icon: 'warning',
				priority: 'high',
			})

			console.error(`Failed to create audio file: ${data.file_name}`, err)
		}
	},
})
