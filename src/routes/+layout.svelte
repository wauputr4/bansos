<script lang="ts">
	import SiteShell from '$lib/components/SiteShell.svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/i18n';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<Analytics />

<SiteShell>
	{@render children()}
</SiteShell>
