<template>
	<div class="no-select timeline-header-wrap">
		<div class="timeline-header" ref="timelineHeaderRef">
			<div class="timeline-header" ref="timelineHeaderRef">
				<div class="timeline-markers">
					<div
						v-for="i in TOTAL_BEATS"
						:key="i"
						class="timeline-segment"
						:style="{ width: `${pxPerBeat}px` }"
					>
						<p v-if="i % 4 === 1" class="small dim mono timeline-marker">
							{{ i }}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div v-if="!isPressed" class="resting-playhead" :style="restingPlayheadStyle" />
	<div class="playhead" :style="playheadStyle" :class="{ 'is-playing': isPlaying }" />
</template>

<script setup lang="ts">
import { currentTime, isPlaying, restingPositionSec, seek } from '@/audioEngine'
import {
	beats_to_px,
	beats_to_sec,
	px_to_beats,
	quantize_beats,
	sec_to_beats,
} from '@/utils/mathUtils'
import { computed, shallowRef, useTemplateRef, watch, type CSSProperties } from 'vue'
import { altKeyPressed, pxPerBeat, TOTAL_BEATS } from '@/state'
import { useMouseInElement, useMousePressed, watchThrottled } from '@vueuse/core'

const timelineHeaderEl = useTemplateRef('timelineHeaderRef')
const { elementX: mouseX } = useMouseInElement(timelineHeaderEl, { handleOutside: true })
const { pressed: isPressed } = useMousePressed({ target: timelineHeaderEl })

const playheadStyle = computed((): CSSProperties => {
	return {
		transform: `translateX(${playHeadPosPx.value}px)`,
	}
})

const restingPlayheadStyle = computed((): CSSProperties => {
	return {
		transform: `translateX(${restingPosPx.value}px) translateX(-50%)`,
	}
})

const restingPosPx = computed(() => {
	return beats_to_px(sec_to_beats(restingPositionSec.value))
})

const localPlayheadBeat = shallowRef<number | null>(null)

const playHeadPosPx = computed(() => {
	if (localPlayheadBeat.value != null) return beats_to_px(localPlayheadBeat.value)
	return beats_to_px(sec_to_beats(currentTime.value))
})

watch([isPressed, mouseX], ([pressed, newMouseX]) => {
	if (!timelineHeaderEl.value) return

	if (!pressed) {
		// released
		localPlayheadBeat.value = null
		return
	}

	const beat = altKeyPressed.value ? px_to_beats(newMouseX) : quantize_beats(px_to_beats(newMouseX))
	localPlayheadBeat.value = Math.max(0, beat)
})

watchThrottled(
	localPlayheadBeat,
	(newBeat) => {
		if (newBeat == null) return
		seek(beats_to_sec(newBeat), { setAsRest: true })
	},
	{ throttle: 100, trailing: true },
)
</script>

<style scoped>
.timeline-header-wrap {
	height: 2rem;
	width: 100%;
	position: sticky;
	top: 0;
	z-index: 20;
	background-color: var(--bg-color);
	border-bottom: 1px solid var(--border-primary);
}

.timeline-header {
	display: flex;
	height: 100%;
	background-color: color-mix(in lch, var(--bg-color), white 15%);
}

.timeline-markers {
	display: flex;
}

/* base */
.timeline-segment {
	padding-left: 0.6rem;
	border-left: 1px solid var(--border-primary);
}

.timeline-segment:nth-child(8n + 5),
.timeline-segment:nth-child(8n + 6),
.timeline-segment:nth-child(8n + 7),
.timeline-segment:nth-child(8n + 8) {
	background-color: color-mix(in lch, var(--bg-color), white 8%);
}

.playhead {
	position: absolute;
	top: 0px;
	bottom: 1px;
	width: 1px;
	background-color: hsl(0, 0%, 51%);
	pointer-events: none;
	z-index: 30;
	will-change: transform;

	transition: transform 15ms linear;
}

.playhead.is-playing {
	background-color: var(--active-playing-color);
}

.playhead.is-playing::before {
	content: '';
	position: absolute;
	top: 0;
	left: -2rem;
	width: 2rem;
	height: 100%;
	background: linear-gradient(
		90deg,
		transparent 5%,
		hsla(125, 100%, 50%, 0.05) 60%,
		rgba(0, 255, 21, 0.2) 100%
	);
}

.playhead::after {
	content: '';
	position: absolute;
	top: 0;
	--_size: 1.8rem;
	height: calc((var(--_size) * 0.6) + 1px);
	width: calc(var(--_size) + 1px);
	background-color: var(--active-playing-color);
	transform: translate(-50%);
	left: 50%;

	clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.resting-playhead {
	position: absolute;
	top: -0px;
	--_size: 1.8rem;

	height: calc((var(--_size) * 0.6) + 1px);
	width: calc(var(--_size) + 1px);
	background-color: color-mix(in lch, var(--active-playing-color), black 50%);
	/* orange for contrast */
	pointer-events: none;
	z-index: 30;
	opacity: 1;

	clip-path: polygon(0 0, 100% 0, 50% 100%);
}
</style>
