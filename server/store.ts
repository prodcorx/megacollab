import { S3Client } from 'bun'
import { join } from 'path'
import { fileTypeFromBuffer } from 'file-type'
import { print } from './utils'
import { DEV_FILE_FOLDER, MAX_UPLOAD_FILE_SIZE_BYTES, DEV_FILE_SERVE_URL } from './constants'
import { audioMimeTypes, BACKEND_PORT } from '~/constants'

const CLOUDFLARE_S3_ID = Bun.env['CLOUDFLARE_S3_ID']
const CLOUDFLARE_S3_SECRET = Bun.env['CLOUDFLARE_S3_SECRET']

const IN_DEV_MODE = Bun.env['ENV'] === 'development'
// const BACKEND_PORT = Bun.env['VITE_APP_DEV_SERVER_PORT'] || '5000'

const PROD_PUBLIC_BUCKET = Bun.env['PROD_PUBLIC_BUCKET']
const PROD_R2_ENDPOINT = Bun.env['PROD_R2_ENDPOINT']
const PROD_PUBLIC_ENDPOINT = Bun.env['PROD_PUBLIC_ENDPOINT']

type VerificationResult = { status: number; error: string }

type StorageProvider = {
	/**
	 * Generates a URL that the client can PUT the file content to.
	 * @param key The destination path (e.g. "audio/123.mp3")
	 * @param contentType The MIME type (e.g. "audio/mpeg")
	 */
	getUploadUrl(key: string): string

	/**
	 * Returns the public URL for viewing/downloading the file
	 */
	getPublicUrl(key: string): string

	/**
	 * Deletes the file
	 */
	deleteIfExists(key: string): Promise<void>

	getFileSize(key: string): Promise<number>

	/**
	 * Verifies the file in storage (headers, size, and magic bytes).
	 * Returns null if valid, or an error object if invalid.
	 */
	verifyAudioFile(key: string): Promise<VerificationResult | null>
}

class R2Storage implements StorageProvider {
	private client: S3Client

	constructor() {
		this.client = new S3Client({
			endpoint: PROD_R2_ENDPOINT,
			accessKeyId: CLOUDFLARE_S3_ID,
			secretAccessKey: CLOUDFLARE_S3_SECRET,
			acl: 'public-read',
			bucket: PROD_PUBLIC_BUCKET,
		})

		print.store('Using Cloudflare R2')
	}

	getUploadUrl(key: string) {
		return this.client.presign(key, {
			expiresIn: 3600, // 1 hour
			method: 'PUT',
		})
	}

	getPublicUrl(key: string) {
		return `${PROD_PUBLIC_ENDPOINT}/${key}`
	}

	async deleteIfExists(key: string) {
		const exists = await this.client.exists(key)
		if (exists) await this.client.delete(key)
	}

	async getFileSize(key: string) {
		return await this.client.size(key)
	}

	async verifyAudioFile(key: string) {
		try {
			const stats = await this.client.stat(key).catch(() => null)

			if (!stats) throw new Error('Empty metadata')

			if (!audioMimeTypes.includes(stats.type)) {
				await this.deleteIfExists(key)
				return { status: 422, error: 'File type mismatch in storage.' }
			}

			if (stats.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
				await this.deleteIfExists(key)
				return { status: 413, error: 'File exceeds size limit' }
			}

			if (stats.size === 0) {
				await this.deleteIfExists(key)
				return { status: 404, error: 'File had 0 bytes. Please try again.' }
			}

			// file is lazy
			const file = this.client.file(key)
			const chunk = file.slice(0, 4100)
			// triggers partial file get
			const buffer = await chunk.arrayBuffer()

			const type = await fileTypeFromBuffer(buffer)

			if (!type || !audioMimeTypes.includes(type.mime)) {
				await this.deleteIfExists(key)
				return { status: 422, error: 'File corrupted or disguised.' }
			}

			return null
		} catch (err) {
			this.deleteIfExists(key)
			return { status: 415, error: 'File verification failed. Please try again.' }
		}
	}
}

class LocalStorage implements StorageProvider {
	private baseUrl: string
	private basePath: string

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl
		this.basePath = join(import.meta.dir, '..', DEV_FILE_FOLDER)
		print.store('Using local dev storage')
	}

	getUploadUrl(key: string) {
		const url = new URL('/api/dev-upload', this.baseUrl)
		url.searchParams.set('key', key)
		return url.toString()
	}

	getPublicUrl(key: string) {
		return `${DEV_FILE_SERVE_URL}${key}`
	}

	async deleteIfExists(key: string) {
		const path = join(this.basePath, key)
		const file = Bun.file(path)

		if (await file.exists()) {
			const { unlink } = await import('node:fs/promises')
			await unlink(path)
		}
	}

	async getFileSize(key: string) {
		const path = join(this.basePath, key)
		const file = Bun.file(path)

		if (await file.exists()) {
			return file.size
		}

		return 0
	}

	async verifyAudioFile(key: string) {
		try {
			const path = join(this.basePath, key)
			const file = Bun.file(path)

			if (!(await file.exists())) throw new Error('Empty body')

			const contentType = file.type

			if (!audioMimeTypes.includes(contentType)) {
				await this.deleteIfExists(key)
				return { status: 422, error: 'File type mismatch in storage.' }
			}

			if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
				await this.deleteIfExists(key)
				return { status: 413, error: 'File exceeds size limit.' }
			}

			if (file.size === 0) {
				await this.deleteIfExists(key)
				return { status: 404, error: 'File had 0 bytes. Please try again.' }
			}

			// should work the same as with s3 type file
			const chunk = file.slice(0, 4100)
			const buffer = await chunk.arrayBuffer()
			const type = await fileTypeFromBuffer(buffer)

			if (!type || !audioMimeTypes.includes(type.mime)) {
				await this.deleteIfExists(key)
				return {
					status: 422,
					error: 'File corrupted or disguised.',
				}
			}

			return null
		} catch (err) {
			console.error(err)

			await this.deleteIfExists(key)
			return {
				status: 415,
				error: 'File verification failed. Please try again.',
			}
		}
	}
}

export const store: StorageProvider = IN_DEV_MODE
	? new LocalStorage(`http://localhost:${BACKEND_PORT}`)
	: new R2Storage()
