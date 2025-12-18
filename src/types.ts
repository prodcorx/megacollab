import type { AudioFileBase } from '~/schema'

export type ImageBitmapLODs = {
	[samplesPerPeak: number]: ImageBitmap
}

export type BitmapLODs = {
	audioFileId: string
	resolutions: ImageBitmapLODs
}

export type AudioFile = AudioFileBase & {
	hash: string
	sampleRate?: number
	waveforms?: ImageBitmapLODs
}
