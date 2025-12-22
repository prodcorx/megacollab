// i know its not necessary to have this custom written
// but i think its kinda cool :D

export class RateLimiter {
	private limits = new Map<string, { count: number; expiresAt: number }>()
	private cleanupInterval: Timer

	/**
	 * @param windowMs - Time window in milliseconds
	 * @param maxRequests - Max requests per window
	 * @param cleanupIntervalMs - Cleanup interval in milliseconds
	 */
	constructor(
		private windowMs: number,
		private maxRequests: number,
		cleanupIntervalMs = 60_000,
	) {
		this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs)
	}

	/**
	 * Checks if an ip is within the rate limit.
	 * Returns `true` if allowed, `false` if blocked.
	 *
	 * Also increments the count for that ip.
	 */
	allow(ip: string): [boolean, number, number] {
		const now = Date.now()
		const record = this.limits.get(ip)

		if (!record || now > record.expiresAt) {
			this.limits.set(ip, {
				count: 1,
				expiresAt: now + this.windowMs,
			})

			return [true, this.maxRequests - 1, now + this.windowMs]
		}

		if (record.count >= this.maxRequests) return [false, 0, record.expiresAt]
		record.count++
		return [true, Math.max(0, this.maxRequests - record.count), record.expiresAt]
	}

	getRemaining(key: string): number {
		const record = this.limits.get(key)
		if (!record || Date.now() > record.expiresAt) return this.maxRequests
		return Math.max(0, this.maxRequests - record.count)
	}

	private cleanup() {
		const now = Date.now()
		for (const [key, record] of this.limits) {
			if (now > record.expiresAt) {
				this.limits.delete(key)
			}
		}
	}

	dispose() {
		clearInterval(this.cleanupInterval)
		this.limits.clear()
	}
}

/**
 * Extracts the trustworthy IP address from the request headers, specifically handling
 * the `x-forwarded-for` header for environments like Heroku.
 *
 * Use this when the server is behind a proxy that appends the client IP to the end of the list.
 */
export function getSafeIp(headers: Headers, fallback: string): string {
	const forwardedFor = headers.get('x-forwarded-for')

	if (!forwardedFor) {
		return fallback
	}

	// The standard format is "client, proxy1, proxy2"
	// On Heroku, the last IP is the one that connected to the Heroku router (the real client or their proxy)
	const ips = forwardedFor.split(',').map((ip) => ip.trim())

	// We take the last one as it's the one appended by the trusted proxy (Heroku)
	const lastIp = ips[ips.length - 1]

	return lastIp || fallback
}
