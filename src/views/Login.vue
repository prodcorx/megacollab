<template>
	<!-- important, to not call any clerk injects which wont be available in dev mode -->
	<div v-if="inDev" style="padding: 3rem">
		<button @click="$router.push('/')">back to index</button>
		<p>no auth</p>
		<p class="small">in developer mode</p>
	</div>

	<div v-else class="custom-grid">
		<SignIn />
	</div>
</template>

<script setup lang="ts">
import { SignIn } from '@clerk/vue'
import { shallowRef } from 'vue'

const inDev = shallowRef<boolean>(import.meta.env.MODE === 'development')
</script>

<style scoped></style>
