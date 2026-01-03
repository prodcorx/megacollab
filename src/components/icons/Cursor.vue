<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		v-bind="$attrs"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		aria-hidden="true"
		role="img"
		width="1.9rem"
		height="1.9rem"
		preserveAspectRatio="xMidYMid meet"
		viewBox="0 0 24 24"
	>
		<path
			fill="currentColor"
			:stroke="props.stroke"
			:stroke-width="props.strokeWidth"
			d="M19.503 9.97c1.204.489 1.112 2.224-.137 2.583l-6.305 1.813l-2.88 5.895c-.571 1.168-2.296.957-2.569-.314L4.677 6.257A1.369 1.369 0 0 1 6.53 4.7z"
			clip-rule="evenodd"
		></path>
	</svg>
</template>
<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		stroke?: string
		strokeWidth?: number | string
	}>(),
	{
		stroke: 'none',
		strokeWidth: 1.5,
	},
)
</script>
