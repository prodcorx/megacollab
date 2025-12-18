<template>
	<div class="track-controls-wrapper" :style="wrapperStyles">
		<div v-for="([id, track], index) in tracks" :key="id" class="track-controls">
			<p v-if="track.title" class="small">{{ track.title }}</p>
			<p v-else class="small dim track-title">Track {{ index + 1 }}</p>
			<div class="volumeSlider"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { tracks, pxTrackHeight } from '@/state'
import { computed, type CSSProperties } from 'vue'

const wrapperStyles = computed((): CSSProperties => {
	return {
		gridAutoRows: `${pxTrackHeight}px`,
	}
})
</script>

<style scoped>
.track-controls-wrapper {
	display: grid;
	grid-auto-rows: auto;
	position: sticky;
	left: 0;
	z-index: 40;

	padding-top: 2rem;
}

.track-title {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.track-controls {
	padding: 0.8rem 1rem;
	/* background-color: hsl(0, 0%, 9%); */

	color: var(--text-color-primary);

	z-index: 10;

	display: grid;
	grid-template-columns: 1fr auto;
	grid-template-areas: 'title vol' '. vol';

	width: 11rem;

	border-bottom: 1px solid var(--border-primary);

	box-shadow: 1px 0px 0px 0px var(--border-primary);

	background-color: var(--bg-color);
}

.track-controls:first-child {
	box-shadow: 1px -1px 0px 0px var(--border-primary);
}

.track-controls:last-child {
	border-bottom: none;
}

.volumeSlider {
	grid-area: vol;
	position: relative;
	height: 100%;
	width: 1.1rem;

	background-color: rgb(24, 24, 24);
}
</style>
