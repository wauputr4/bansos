<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '$lib/i18n';
	import { getProviderStats, formatNumber } from '$lib/data/bansos';
	import {
		getCachedFavicon,
		setCachedFavicon,
		handleFaviconFallback
	} from '$lib/utils/faviconCache';

	import SearchBox from '$lib/components/SearchBox.svelte';
	import Pagination from '$lib/components/Pagination.svelte';
	import { onMount } from 'svelte';

	const providers = getProviderStats();
	let searchQuery = $state('');

	const filteredProviders = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		if (!query) return providers;
		return providers.filter(
			(p) =>
				p.name.toLowerCase().includes(query) ||
				p.slug.toLowerCase().includes(query) ||
				p.tags.some((t) => t.toLowerCase().includes(query))
		);
	});

	const totalProviders = $derived(filteredProviders.length);
	const totalActive = $derived(
		filteredProviders.reduce((sum, provider) => sum + provider.activeCount, 0)
	);
	let currentPage = $state(1);
	const pageSize = 6;
	const totalPages = $derived(Math.max(1, Math.ceil(filteredProviders.length / pageSize)));
	const paginatedProviders = $derived(
		filteredProviders.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);
	const pageStart = $derived(filteredProviders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1);
	const pageEnd = $derived(Math.min(currentPage * pageSize, filteredProviders.length));

	$effect(() => {
		if (searchQuery) currentPage = 1;
	});

	let popularityData: Record<string, number> = $state({});

	onMount(() => {
		fetch('/api/popularity')
			.then((res) => {
				if (!res.ok) throw new Error(`API error: ${res.status}`);
				return res.json();
			})
			.then((data) => {
				popularityData = data;
			})
			.catch((err) => {
				console.error('Failed to fetch popularity data:', err);
			});
	});
</script>

<svelte:head>
	<title>{$t('meta.provTitle')}</title>
	<meta name="description" content={$t('meta.provDesc')} />
	<link rel="canonical" href="https://bansos.dev/providers/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://bansos.dev/providers/" />
	<meta property="og:title" content={$t('meta.provTitle')} />
	<meta property="og:description" content={$t('meta.provDesc')} />
	<meta property="og:image" content="https://bansos.dev/og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://bansos.dev/providers/" />
	<meta name="twitter:title" content={$t('meta.provTitle')} />
	<meta name="twitter:description" content={$t('meta.provDesc')} />
	<meta name="twitter:image" content="https://bansos.dev/og.png" />
</svelte:head>

<main class="page-wrapper">
	<section class="container provider-hero">
		<p class="eyebrow">{$t('providers.eyebrow')}</p>
		<h1 class="text-gradient text-balance">{$t('providers.h1')}</h1>
		<p class="subtitle-text text-pretty">
			{$t('providers.subtitle')}
		</p>
		<div class="stats-grid" aria-label={$t('providers.statsAria')}>
			<div>
				<strong>{totalProviders}</strong>
				<span>{$t('providers.statTotal')}</span>
			</div>
			<div>
				<strong>{totalActive}</strong>
				<span>{$t('providers.statActive')}</span>
			</div>
		</div>
	</section>

	<section class="container provider-list" aria-label={$t('providers.listAria')}>
		<div class="controls-section">
			<SearchBox bind:searchQuery placeholder={$t('providers.searchPlaceholder')} />
		</div>
		<div class="result-summary">
			<span
				>{$t('providers.resultSummary', { values: { start: pageStart, end: pageEnd, total: filteredProviders.length } })}</span
			>
			<span>{$t('providers.resultPage', { values: { current: currentPage, total: totalPages } })}</span>
		</div>
		<div class="provider-grid">
			{#each paginatedProviders as provider (provider.slug)}
				{@const providerViews = provider.items.reduce(
					(sum, item) => sum + (popularityData[item.id] || 0),
					0
				)}
				<a href={resolve(`/providers/${provider.slug}`)} class="provider-card glass-card">
					<div class="provider-top">
						<img
							src={getCachedFavicon(provider.websiteUrl) || provider.faviconUrl}
							alt=""
							loading="lazy"
							class="provider-logo"
							onload={(e) => {
								const target = e.currentTarget as HTMLImageElement;
								setCachedFavicon(provider.websiteUrl, target.src);
							}}
							onerror={(e) => handleFaviconFallback(e, provider.websiteUrl)}
						/>
						<div class="provider-badges">
							{#if providerViews > 0}
								<span class="active-pill views-pill"
									><i class="fa-regular fa-eye"></i> {formatNumber(providerViews)}</span
								>
							{/if}
							<span class="active-pill"
								><i class="fa-solid fa-circle"></i>
								{provider.activeCount}
								{$t('providers.activeLabel')}</span
							>
						</div>
					</div>
					<div>
						<h2>{provider.name}</h2>
						<p>
							{$t('providers.countTemplate', { values: { count: provider.totalCount } })}
							{#if provider.expiredCount > 0}
								<span> · {$t('providers.expiredTemplate', { values: { count: provider.expiredCount } })}</span>
							{/if}
						</p>
					</div>
					<div class="tag-list">
						{#each provider.tags.slice(0, 4) as tag (tag)}
							<span>{tag}</span>
						{/each}
					</div>
				</a>
			{/each}
		</div>
		<Pagination bind:currentPage {totalPages} />
	</section>
</main>

<style>
	.page-wrapper {
		padding-block: 2.5rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.provider-hero {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.eyebrow {
		color: var(--color-accent);
		font-size: 0.8rem;
		font-weight: 850;
		text-transform: uppercase;
	}

	h1 {
		max-width: 46rem;
		font-size: clamp(2rem, 1.5rem + 2vw, 3.25rem);
		line-height: 1.08;
	}

	.subtitle-text {
		max-width: 46rem;
		color: var(--text-secondary);
		font-size: 1rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 12rem));
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.stats-grid div {
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		padding: 1rem;
	}

	.stats-grid strong {
		display: block;
		color: var(--color-accent);
		font-size: 1.7rem;
		line-height: 1;
	}

	.stats-grid span {
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 700;
	}

	.controls-section {
		margin-bottom: 0.5rem;
	}

	.provider-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.result-summary {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 750;
		margin-bottom: 0.5rem;
	}

	.provider-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
		gap: 1rem;
	}

	.provider-card {
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
		color: inherit;
		padding: 1.25rem;
		min-height: 13rem;
		transition:
			transform 0.2s,
			border-color 0.2s;
	}

	.provider-card:hover {
		transform: translateY(-2px);
		border-color: color-mix(in srgb, var(--color-accent) 50%, var(--border-color));
	}

	.provider-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.provider-logo {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 0.7rem;
		border: 1px solid var(--border-color);
		background: var(--bg-secondary);
		padding: 0.45rem;
		object-fit: contain;
	}

	.provider-badges {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.active-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border-radius: 999px;
		background: var(--color-success-glow);
		color: var(--color-success);
		font-size: 0.8rem;
		font-weight: 800;
		padding: 0.35rem 0.65rem;
	}

	.views-pill {
		background: transparent;
		border: 1px solid var(--border-color);
		color: var(--text-secondary);
	}

	h2 {
		font-size: 1.2rem;
		line-height: 1.25;
	}

	.provider-card p {
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 650;
		margin-top: 0.25rem;
	}

	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
		margin-top: auto;
	}

	.tag-list span {
		border: 1px solid var(--border-color);
		border-radius: 0.45rem;
		color: var(--text-secondary);
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.2rem 0.55rem;
	}

	@media (max-width: 48rem) {
		.page-wrapper {
			padding-block: 1.5rem 6rem;
		}

		.stats-grid {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
