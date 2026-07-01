<script lang="ts">
	import SiteShell from '$lib/components/SiteShell.svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/i18n';

	let { children } = $props();

	// ===== GEO: JSON-LD WebSite + Organization schema =====
	// AI crawlers (ChatGPT, Perplexity, Google AI Overviews) use this
	// for brand identity and citation context.
	const organizationSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'bansos.dev',
		url: 'https://bansos.dev',
		logo: 'https://bansos.dev/logo.png',
		description:
			'Direktori komunitas open-source untuk program bantuan sosial (bansos) developer Indonesia — free credits, domain gratis, cloud services, API free tier.',
		sameAs: ['https://gitlab.com/wauputr4/bansos', 'https://github.com/wauputr4/bansos']
	});

	const websiteSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'bansos.dev',
		url: 'https://bansos.dev',
		description:
			'Direktori komunitas program bantuan sosial untuk developer Indonesia. Temukan AI credits gratis, domain gratis, cloud services, dan API free tier.',
		potentialAction: {
			'@type': 'SearchAction',
			target: 'https://bansos.dev/list/?search={search_term_string}',
			'query-input': 'required name=search_term_string'
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />

	<!-- GEO: JSON-LD structured data -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' + organizationSchema + '</' + 'script>'}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' + websiteSchema + '</' + 'script>'}
</svelte:head>

<Analytics />

<SiteShell>
	{@render children()}
</SiteShell>
