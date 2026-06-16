<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	const GA_ID = import.meta.env.VITE_GA_ID;

	let initialized = false;

	function initGA() {
		if (!GA_ID || !browser || initialized) return;

		// Load Google Analytics script
		const script = document.createElement('script');
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
		document.head.appendChild(script);

		// Initialize gtag
		window.dataLayer = window.dataLayer || [];
		window.gtag = function gtag(...args: unknown[]) {
			window.dataLayer.push(args);
		};
		window.gtag('js', new Date());
		window.gtag('config', GA_ID, {
			page_path: $page.url.pathname
		});

		initialized = true;
	}

	// Track page views on route change
	$effect(() => {
		if (browser && initialized && $page.url.pathname) {
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
