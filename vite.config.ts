import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const buildDate = new Date();
const formattedDate = `v${buildDate.getFullYear()}.${String(buildDate.getMonth() + 1).padStart(2, '0')}.${String(buildDate.getDate()).padStart(2, '0')}`;

export default defineConfig(({ command }) => ({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: {
				...adapter({
					routes: { include: ['/*'], exclude: ['/_app/*', '/images/*', '/favicon.ico'] }
				}),
				// This adapter version does not provide D1 bindings in Vite dev.
				...(command === 'serve'
					? {
							emulate: async () => {
								const { getPlatformProxy } = await import('wrangler');
								const proxy = await getPlatformProxy();
								return { platform: () => proxy as unknown as App.Platform };
							}
						}
					: {})
			}
		})
	],
	define: {
		__BUILD_DATE__: JSON.stringify(formattedDate)
	}
}));
