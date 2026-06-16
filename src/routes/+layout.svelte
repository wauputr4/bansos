<script lang="ts">
	import SiteShell from '$lib/components/SiteShell.svelte';
	import Analytics from '$lib/components/Analytics.svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Analytics />

<SiteShell>
	{@render children()}
</SiteShell>
