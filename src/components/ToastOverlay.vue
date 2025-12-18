<template>
	<div class="toast-overlay">
		<ToastItem
			v-for="(toast, index) in visibleToasts.toasts"
			:key="toast.id"
			:toast="toast"
			:index="visibleToasts.length - 1 - index"
			:style="getTransform(index)"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toasts } from '@/state'
import ToastItem from './ToastItem.vue'

const visibleToasts = computed(() => {
	return { toasts: toasts.value.slice(0, 6), length: toasts.value.length }
})

function getTransform(index: number) {
	const y = index * -12
	const scale = index * -0.1
	return {
		transform: `translateY(${y}px) scale(${1 + scale})`,
	}
}
</script>

<style scoped>
.toast-overlay {
	position: fixed;
	bottom: 0px;
	left: 0px;
	z-index: 9999;
	display: grid;
	grid-template-areas: 'stack';
	pointer-events: none;
	padding-bottom: 2rem;

	height: max-content;
	width: max-content;
}
</style>
