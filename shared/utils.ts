export function sanitizeFileName(name: string): string {
	return name.replace(/[^a-zA-Z0-9._-]/g, '_')
}

/**
 * calls santize on file_name just incase :D
 *
 *
 * in most places double sanitization but worth it for consistency
 */
export function makeAudioFileHash(opts: {
	creator_user_id: string
	file_name: string
	duration: number
}) {
	return btoa(`${opts.creator_user_id}:${sanitizeFileName(opts.file_name)}:${opts.duration}`)
}
