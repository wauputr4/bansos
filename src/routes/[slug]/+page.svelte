<script lang="ts">
	import ContributorPage from '../contributor/[slug]/+page.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<ContributorPage {data} />
