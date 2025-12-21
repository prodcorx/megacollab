<template>
	<div class="custom-grid" style="justify-items: center; align-items: center; padding-bottom: 4rem">
		<div style="display: grid; justify-items: center; gap: 1rem">
			<p>Connecting to server...</p>
			<Loader2 class="spin" :size="18" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
</script>
