<template>
	<RouterView />
	<DebugOverlay />
	<ToastOverlay />
</template>

<script setup lang="ts">
import DebugOverlay from '@/components/DebugOverlay.vue'
import ToastOverlay from '@/components/ToastOverlay.vue'
</script>

<style scoped></style>
