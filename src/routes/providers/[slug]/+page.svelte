<script lang="ts">
	import { resolve } from '$app/paths';
	import BansosCard from '$lib/components/BansosCard.svelte';
	import SearchBox from '$lib/components/SearchBox.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import type { BansosItem } from '$lib/data/bansos';

	let { data } = $props();
	const provider = $derived(data.provider);
	const seoTitle = $derived(`${provider.name} bansos developer - bansos.dev`);
	const seoDescription = $derived(
		`Daftar bansos developer dari ${provider.name}: ${provider.totalCount} program, ${provider.activeCount} masih aktif, lengkap dengan cara klaim dan link resmi.`
	);

	let searchQuery = $state('');

	const filteredItems = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return provider.items;
		return provider.items.filter(
			(item: BansosItem) =>
				item.title.toLowerCase().includes(query) ||
				item.tags.some((t: string) => t.toLowerCase().includes(query))
		);
	});

	let currentPage = $state(1);
	const pageSize = 6;
	const totalPages = $derived(Math.max(1, Math.ceil(filteredItems.length / pageSize)));

	const paginatedItems = $derived(
		filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);

	$effect(() => {
		if (searchQuery) currentPage = 1;
	});
</script>

<svelte:head>
	<title>{seoTitle}</title>
	<meta name="description" content={seoDescription} />
	<link rel="canonical" href="https://bansos.dev/providers/{provider.slug}/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://bansos.dev/providers/{provider.slug}/" />
	<meta property="og:title" content={seoTitle} />
	<meta property="og:description" content={seoDescription} />
	<meta property="og:image" content={provider.faviconUrl || 'https://bansos.dev/og.png'} />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:url" content="https://bansos.dev/providers/{provider.slug}/" />
	<meta name="twitter:title" content={seoTitle} />
	<meta name="twitter:description" content={seoDescription} />
	<meta name="twitter:image" content={provider.faviconUrl || 'https://bansos.dev/og.png'} />
</svelte:head>

<main class="page-wrapper">
	<nav class="container top-nav">
		<a href={resolve('/providers')} class="btn-back">
			<i class="fa-solid fa-arrow-left"></i> Semua Provider
		</a>
	</nav>

	<header class="container provider-header">
		<div class="provider-identity">
			<img src={provider.faviconUrl} alt="" class="provider-logo" />
			<div>
				<p class="eyebrow">Provider</p>
				<h1 class="text-gradient text-balance">{provider.name}</h1>
			</div>
		</div>
		<p class="subtitle-text text-pretty">
			{provider.name} punya {provider.totalCount} bansos developer di katalog ini.
			{provider.activeCount} masih aktif dan bisa dicek cara klaimnya dari halaman detail.
		</p>
		<div class="meta-row">
			<a href={provider.websiteUrl} target="_blank" rel="noopener noreferrer" class="meta-link">
				<i class="fa-solid fa-arrow-up-right-from-square"></i> Website provider
			</a>
			<span><i class="fa-solid fa-circle"></i> {provider.activeCount} aktif</span>
			<span><i class="fa-solid fa-box-archive"></i> {provider.expiredCount} expired</span>
		</div>
		<div class="tag-list">
			{#each provider.tags as tag (tag)}
				<span>{tag}</span>
			{/each}
		</div>
	</header>

	<section class="container related-section">
		<div class="section-header">
			<h2>Bansos dari {provider.name}</h2>
			<span>{filteredItems.length} item</span>
		</div>
		<div class="controls-section">
			<SearchBox bind:searchQuery placeholder="Cari nama program atau tag..." />
		</div>
		{#if filteredItems.length === 0}
			<p class="empty-state">Tidak ada program yang sesuai pencarian.</p>
		{:else}
			<div class="bansos-grid">
				{#each paginatedItems as item (item.id)}
					<BansosCard {item} />
				{/each}
			</div>
			<Pagination bind:currentPage {totalPages} />
		{/if}
	</section>
</main>

<style>
	.page-wrapper {
		padding-block: 2.5rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.subtitle-text {
		color: var(--text-secondary);
	}

	.top-nav {
		display: flex;
	}

	.btn-back,
	.meta-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: 0.65rem;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		color: var(--text-secondary);
		font-weight: 750;
		padding: 0.55rem 0.85rem;
	}

	.provider-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.provider-identity {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.provider-logo {
		width: 4rem;
		height: 4rem;
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		background: var(--bg-secondary);
		object-fit: contain;
		padding: 0.6rem;
	}

	.eyebrow {
		color: var(--color-accent);
		font-size: 0.8rem;
		font-weight: 850;
		text-transform: uppercase;
	}

	h1 {
		font-size: clamp(2rem, 1.4rem + 2.4vw, 3.5rem);
		line-height: 1.08;
	}

	.subtitle-text {
		max-width: 48rem;
		font-size: 1rem;
	}

	.meta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	.meta-row span {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		border: 1px solid var(--border-color);
		border-radius: 999px;
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 750;
		padding: 0.45rem 0.75rem;
	}

	.meta-row i {
		color: var(--color-accent);
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}

	.tag-list span {
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		color: var(--text-secondary);
		font-size: 0.78rem;
		font-weight: 750;
		padding: 0.25rem 0.6rem;
	}

	.related-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.section-header h2 {
		font-size: 1.35rem;
	}

	.section-header span {
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 750;
	}

	.bansos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: 1rem;
	}

	.controls-section {
		margin-bottom: 0.5rem;
	}

	.empty-state {
		color: var(--text-secondary);
		padding: 2rem 0;
		text-align: center;
		font-style: italic;
	}

	@media (max-width: 48rem) {
		.page-wrapper {
			padding-block: 1.5rem 6rem;
		}

		.provider-identity {
			align-items: flex-start;
		}
	}
</style>
