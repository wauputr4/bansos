<script lang="ts">
	import SiteShell from '$lib/components/SiteShell.svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<SiteShell>
	{@render children()}
</SiteShell>
