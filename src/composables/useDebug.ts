import { nanoid } from 'nanoid'
import { tryOnUnmounted } from '@vueuse/core'
import { debugEntries } from '@/state'
import { watch, isRef, type WatchSource, type MultiWatchSources, type WatchOptions } from 'vue'

const inDev = import.meta.env.MODE === 'development'

export type DebugEntry = {
	id: string
	label?: string
	data: any
	timestamp: number
}

const activeInstances = new Map<string, symbol>()

export type DebugOptions = {
	label?: string
} & WatchOptions<true>

export function useDebug<T>(source: WatchSource<T>, options?: DebugOptions): void
export function useDebug<T extends Readonly<MultiWatchSources>>(
	source: [...T],
	options?: DebugOptions,
): void

export function useDebug(
	source: WatchSource<unknown> | Readonly<MultiWatchSources>,
	options?: DebugOptions,
): void {
	const opts = options ?? {}

	const id = opts.label ?? nanoid()

	const instanceId = Symbol()

	activeInstances.set(id, instanceId)

	function debug(data: any) {
		if (!inDev) return
		debugEntries.value.set(id, {
			id,
			label: opts?.label,
			data,
			timestamp: Date.now(),
		})
	}

	tryOnUnmounted(() => {
		if (activeInstances.get(id) !== instanceId) return

		if (activeInstances.get(id) === instanceId) {
			debugEntries.value.delete(id)
			activeInstances.delete(id)
		}
	})

	watch(
		source,
		(val: any) => {
			debug(val)
		},
		{ immediate: true },
	)
}
