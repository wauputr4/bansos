<script lang="ts">
	import { page } from '$app/stores';
	import { dev } from '$app/environment';
	import { tick } from 'svelte';

	const GA_ID = (import.meta.env.VITE_GA_ID ?? '').trim();
	const HAS_VALID_GA_ID = /^G-[A-Z0-9]+$/.test(GA_ID);

	// Construct inline script with validation and safe serialization
	const scriptTag =
		`<script>
		window.dataLayer = window.dataLayer || [];
		window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);}
		gtag('js', new Date());
		gtag('config', ${JSON.stringify(GA_ID)}, { send_page_view: false });
	</` + 'script>';

	// Track page views on route change (runs only in browser)
	$effect(() => {
		if (!dev && HAS_VALID_GA_ID && $page.url.pathname) {
			const currentPath = $page.url.pathname;
			const currentHref = $page.url.href;

			// Wait for SvelteKit and <svelte:head> to fully update the document title
			tick().then(() => {
				window.gtag?.('event', 'page_view', {
					page_path: currentPath,
					page_location: currentHref,
					page_title: document.title
				});
			});
		}
	});
</script>

<svelte:head>
	{#if HAS_VALID_GA_ID && !dev}
		<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html scriptTag}
	{/if}
</svelte:head>
