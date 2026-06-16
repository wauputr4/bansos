<script lang="ts">
	import { page } from '$app/stores';
	import { browser, dev } from '$app/environment';

	const GA_ID = import.meta.env.VITE_GA_ID;

	let initialized = $state(false);
	let scriptLoaded = $state(false);

	function initGA() {
		if (!GA_ID || !browser || dev || initialized) return;

		// Initialize gtag function first
		window.dataLayer = window.dataLayer || [];
		window.gtag = function gtag(...args: unknown[]) {
			window.dataLayer.push(args);
		};
		window.gtag('js', new Date());
		// Don't send initial page view - let $effect handle it
		window.gtag('config', GA_ID, { send_page_view: false });

		// Load Google Analytics script
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
		script.onload = () => {
			scriptLoaded = true;
		};
		document.head.appendChild(script);

		initialized = true;
	}

	// Track page views on route change
	$effect(() => {
		if (browser && !dev && initialized && scriptLoaded && $page.url.pathname) {
			window.gtag?.('config', GA_ID, {
				page_path: $page.url.pathname
			});
		}
	});

	// Initialize on mount
	if (browser) {
		initGA();
	}
</script>
