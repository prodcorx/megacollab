// https://vite.dev/config/

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'
import chalk from 'chalk'
import { BACKEND_PORT } from './shared/constants'

export default defineConfig(() => {
	return {
		plugins: [
			vue(),
			// vueDevTools(), // I don't use them, but un-comment if you do :)
			{
				name: 'print-dev-url',
				configureServer(server) {
					server.httpServer?.once('listening', () => {
						const info = server?.httpServer?.address()
						if (typeof info === 'object' && info) {
							const port = info.port
							console.log(
								`${chalk.cyanBright.bold('[VITE]')} Dev server running on ${chalk.blueBright.underline(`http://localhost:${port}`)}`,
							)
						}
					})
				},
			},
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url)),
				'~': fileURLToPath(new URL('./shared', import.meta.url)),
			},
		},
		server: {
			host: true,
			allowedHosts: ['localhost'],
			cors: true,
			headers: {
				'Cross-Origin-Opener-Policy': 'same-origin',
				'Cross-Origin-Embedder-Policy': 'require-corp',
			},
			proxy: {
				'/api': {
					target: `http://localhost:${BACKEND_PORT}`,
					changeOrigin: true,
					secure: false,
				},
			},
		},
		build: {
			target: 'esnext',
		},
		css: {
			transformer: 'lightningcss' as const,
		},
		logLevel: 'error' as const,
	}
})
