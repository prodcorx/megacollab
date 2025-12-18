<template>
	<div v-bind="$attrs" class="track-instance">
		<div class="track" ref="track" :style="trackStyle" :data-track-id="props.track.id">
			<ClipInstance
				v-for="clip in trackClips"
				:key="clip.id"
				:clip="clip"
				:audiofile="audiofiles.get(clip.audio_file_id)!"
				:style="{
					position: 'absolute',
					height: '100%',
				}"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ServerTrack } from '~/schema'
import ClipInstance from '@/components/ClipInstance.vue'
import { computed, onMounted, onUnmounted } from 'vue'
import { clips, pxPerBeat, audiofiles, pxTrackHeight } from '@/state'
import { registerTrack, unregisterTrack } from '@/audioEngine'

const props = defineProps<{
	track: ServerTrack
}>()

onMounted(() => {
	registerTrack(props.track.id)
})

onUnmounted(() => {
	unregisterTrack(props.track.id)
})

const trackStyle = computed(() => {
	const lineColor = 'var(--_minor-line-color)'
	return {
		height: `${pxTrackHeight}px`,
		background: `
            repeating-linear-gradient(
                90deg,
                ${lineColor} 0px 1px,
                transparent 1px,
                transparent ${pxPerBeat.value}px
            )`,
	}
})

const trackClips = computed(() => {
	return [...clips.values()].filter((clip) => clip.track_id === props.track.id)
})
</script>

<style scoped>
.track-instance {
	--_line-color: hsl(0, 0%, 28%);
	--_minor-line-color: hsl(0, 0%, 13%);

	border-bottom: 1px solid var(--_line-color);
	position: relative;
	display: grid;
	grid-template-columns: 1fr;
	height: 7rem;
}

.track-instance:last-child {
	border-bottom: none;
}

.track {
	width: 100%;
	height: inherit;
}
</style>
