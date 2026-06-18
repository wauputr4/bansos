<script lang="ts">
	import { page } from '$app/stores';
	import { browser, dev } from '$app/environment';

	const GA_ID = import.meta.env.VITE_GA_ID;

	const scriptTag =
		`<script>window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}', { send_page_view: false }); </` +
		'script>';

	// Track page views on route change
	$effect(() => {
		if (browser && !dev && GA_ID && $page.url.pathname) {
			window.gtag?.('event', 'page_view', {
				page_path: $page.url.pathname,
				page_location: $page.url.href,
				page_title: document.title
			});
		}
	});
</script>

<svelte:head>
	{#if GA_ID && !dev}
		<script async src="https://www.googletagmanager.com/gtag/js?id={GA_ID}"></script>
		{@html scriptTag}
	{/if}
</svelte:head>
