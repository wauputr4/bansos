<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import BansosCard from '$lib/components/BansosCard.svelte';
	import SearchBox from '$lib/components/SearchBox.svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	import { bansosList } from '$lib/data/bansos';

	let selectedTags: string[] = $state([]);
	let selectedStatuses: string[] = $state([]);
	let selectedValidities: string[] = $state([]);
	let sortOrder: 'newest' | 'oldest' | 'popular' = $state('popular');
	let filterExpanded = $state(false);
	let currentPage = $state(1);
	let searchQuery = $state('');

	const pageSize = 6;

	let popularityData: Record<string, number> = $state({});
	let discussionStats: Record<string, { comments: number; reactions: number }> = $state({});

	onMount(async () => {
		// Hydrate search query from URL parameter if present (e.g. from Google SearchAction)
		const urlParams = new URLSearchParams(window.location.search);
		const q = urlParams.get('q');
		if (q) {
			searchQuery = q;
		}

		try {
			const res = await fetch('/api/popularity');
			if (res.ok) {
				popularityData = await res.json();
			} else {
				const errorDetails = await res.json().catch(() => ({}));
				console.error('Failed to load popularity data:', res.status, errorDetails.error || '');
			}
		} catch (e) {
			console.error('Failed to load popularity data:', e);
		}

		try {
			const res = await fetch('/api/discussion-stats');
			if (res.ok) {
				discussionStats = await res.json();
			}
		} catch (e) {
			console.error('Failed to load discussion stats:', e);
		}
	});

	const dynamicTags = $derived(
		Array.from(new Set(bansosList.flatMap((item) => item.tags))).sort((a, b) => a.localeCompare(b))
	);

	const filteredBansos = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		return bansosList
			.map((item, index) => {
				let score = 0;
				if (query) {
					if (item.title.toLowerCase() === query) score += 20;
					else if (item.title.toLowerCase().includes(query)) score += 10;
					if (item.provider.toLowerCase() === query) score += 15;
					else if (item.provider.toLowerCase().includes(query)) score += 8;
					if (item.tags.some((t) => t.toLowerCase() === query)) score += 12;
					else if (item.tags.some((t) => t.toLowerCase().includes(query))) score += 5;
					if (item.description.toLowerCase().includes(query)) score += 2;

					const searchable = [
						item.title,
						item.provider,
						item.description,
						item.promoCode || '',
						item.validity.description || '',
						item.contributor?.name || '',
						item.tags.join(' '),
						item.benefits.join(' '),
						item.requirements.join(' ')
					]
						.join(' ')
						.toLowerCase();

					if (searchable.includes(query)) score += 1;
				} else {
					score = 1;
				}
				return { item, index, score };
			})
			.filter(({ item, score }) => {
				if (searchQuery.trim() && score === 0) return false;
				const tagMatch =
					selectedTags.length === 0 || item.tags.some((tag) => selectedTags.includes(tag));
				const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
				const validityMatch =
					selectedValidities.length === 0 || selectedValidities.includes(item.validity.type);
				return tagMatch && statusMatch && validityMatch;
			})
			.sort((a, b) => {
				// Only force featured first on default view (no filters, no search, default sort)
				const isDefaultView =
					selectedTags.length === 0 &&
					selectedStatuses.length === 0 &&
					selectedValidities.length === 0 &&
					!searchQuery.trim() &&
					sortOrder === 'popular';
				if (isDefaultView) {
					const aFeatured = a.item.featured && a.item.status !== 'expired' ? 0 : 1;
					const bFeatured = b.item.featured && b.item.status !== 'expired' ? 0 : 1;
					if (aFeatured !== bFeatured) return aFeatured - bFeatured;
				}

				if (searchQuery.trim() && a.score !== b.score) {
					return b.score - a.score;
				}
				if (sortOrder === 'popular') {
					const scoreA =
						(popularityData[a.item.id] || 0) +
						(discussionStats[a.item.id]?.comments || 0) +
						(discussionStats[a.item.id]?.reactions || 0);
					const scoreB =
						(popularityData[b.item.id] || 0) +
						(discussionStats[b.item.id]?.comments || 0) +
						(discussionStats[b.item.id]?.reactions || 0);
					if (scoreA !== scoreB) return scoreB - scoreA;
				}
				return sortOrder === 'oldest' ? a.index - b.index : b.index - a.index;
			})
			.map(({ item }) => item);
	});
	const totalPages = $derived(Math.max(1, Math.ceil(filteredBansos.length / pageSize)));
	const paginatedBansos = $derived(
		filteredBansos.slice((currentPage - 1) * pageSize, currentPage * pageSize)
	);
	const pageStart = $derived(filteredBansos.length === 0 ? 0 : (currentPage - 1) * pageSize + 1);
	const pageEnd = $derived(Math.min(currentPage * pageSize, filteredBansos.length));

	$effect(() => {
		if (
			selectedTags ||
			selectedStatuses ||
			selectedValidities ||
			sortOrder ||
			searchQuery !== undefined
		) {
			currentPage = 1;
		}
	});

	$effect(() => {
		if (currentPage > totalPages) {
			currentPage = totalPages;
		}
	});
</script>

<svelte:head>
	<title>{$t('meta.listTitle')}</title>
	<meta name="description" content={$t('meta.listDesc')} />
	<link rel="canonical" href="https://bansos.dev/list/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://bansos.dev/list/" />
	<meta property="og:title" content={$t('meta.listTitle')} />
	<meta property="og:description" content={$t('meta.listDesc')} />
	<meta property="og:image" content="https://bansos.dev/og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://bansos.dev/list/" />
	<meta name="twitter:title" content={$t('meta.listTitle')} />
	<meta name="twitter:description" content={$t('meta.listDesc')} />
	<meta name="twitter:image" content="https://bansos.dev/og.png" />
</svelte:head>

<main class="page-wrapper">
	<div class="glow-orb list-glow"></div>

	<!-- Header -->
	<header class="feed-header container content-shell">
		<div
			style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1.5rem;"
		>
			<div style="flex: 1; min-width: 250px;">
				<p class="eyebrow">{$t('list.eyebrow')}</p>
				<h1 class="text-gradient" style="display: flex; align-items: center;">
					<span>{$t('list.h1')}</span>
					<svg
						class="anxious-icon inline-anxious"
						viewBox="0 0 100 100"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M25 25 H75 L70 75 C69 80 64 84 59 84 H41 C36 84 31 80 30 75 Z"
							fill="var(--bg-secondary)"
							stroke="var(--color-success)"
							stroke-width="4"
						/>
						<path
							d="M75 35 H85 C90 35 93 39 93 44 V56 C93 61 90 65 85 65 H73"
							stroke="var(--color-success)"
							stroke-width="4"
							stroke-linecap="round"
							fill="none"
						/>
						<path
							d="M40 10 Q43 14 40 18 M50 8 Q53 13 50 18 M60 10 Q63 14 60 18"
							stroke="var(--text-muted)"
							stroke-width="3"
							stroke-linecap="round"
							fill="none"
						/>
						<path
							d="M34 43 Q39 40 44 43 M52 43 Q57 40 62 43"
							stroke="var(--text-primary)"
							stroke-width="2.5"
							stroke-linecap="round"
							fill="none"
						/>
						<circle cx="39" cy="49" r="3" fill="var(--text-primary)" />
						<circle cx="57" cy="49" r="3" fill="var(--text-primary)" />
						<path
							d="M44 58 Q48 55 52 58 T56 58"
							stroke="var(--text-primary)"
							stroke-width="2.5"
							stroke-linecap="round"
							fill="none"
						/>
						<path
							class="sweat-drop"
							d="M68 44 C68 47 66.5 49 65 49 C63.5 49 63.5 47 65 44 C66 42 67.5 40 68 38 Z"
							fill="#38bdf8"
						/>
					</svg>
				</h1>
			</div>
			<div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-end;">
				<p class="subtitle-text text-pretty">
					{$t('list.subtitle', { values: { total: bansosList.length } })}
				</p>
			</div>
		</div>
	</header>

	<section class="controls-section container" aria-label={$t('list.controlsAria')}>
		<div class="controls-wrapper">
			<div class="search-box-wrapper">
				<SearchBox bind:searchQuery placeholder={$t('list.searchPlaceholder')} />
			</div>

			<div class="filter-card">
				<button
					class="filter-header"
					onclick={() => (filterExpanded = !filterExpanded)}
					aria-expanded={filterExpanded}
					aria-label="Toggle filter menu"
				>
					<div class="filter-title">
						<i class="fa-solid fa-filter"></i>
						<span class="filter-text-desktop"> {$t('list.filterTitle')}</span>
						{#if selectedTags.length > 0 || selectedStatuses.length > 0 || selectedValidities.length > 0}
							<span class="active-count"
								>{selectedTags.length + selectedStatuses.length + selectedValidities.length}</span
							>
						{/if}
					</div>
					<i class="fa-solid fa-chevron-{filterExpanded ? 'up' : 'down'} filter-chevron-desktop"
					></i>
				</button>
				{#if filterExpanded}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="dropdown-backdrop" onclick={() => (filterExpanded = false)}></div>

					<div class="filter-dropdown">
						<div class="filter-group">
							<h3 class="filter-group-title">{$t('list.filterSortLabel')}</h3>
							<div class="tag-grid">
								<button
									class="tag-btn"
									class:active={sortOrder === 'popular'}
									onclick={() => (sortOrder = 'popular')}
								>
									{$t('list.sortPopular')}
								</button>
								<button
									class="tag-btn"
									class:active={sortOrder === 'newest'}
									onclick={() => (sortOrder = 'newest')}
								>
									{$t('list.sortNewest')}
								</button>
								<button
									class="tag-btn"
									class:active={sortOrder === 'oldest'}
									onclick={() => (sortOrder = 'oldest')}
								>
									{$t('list.sortOldest')}
								</button>
							</div>
						</div>

						<div class="filter-group">
							<h3 class="filter-group-title">{$t('list.filterStatusLabel')}</h3>
							<div class="tag-grid">
								<button
									class="tag-btn"
									class:active={selectedStatuses.length === 0}
									onclick={() => (selectedStatuses = [])}
								>
									{$t('list.statusAll')}
								</button>
								{#each ['active', 'upcoming', 'expired'] as status (status)}
									<button
										class="tag-btn"
										class:active={selectedStatuses.includes(status)}
										onclick={() => {
											if (selectedStatuses.includes(status)) {
												selectedStatuses = selectedStatuses.filter((s) => s !== status);
											} else {
												selectedStatuses = [...selectedStatuses, status];
											}
										}}
									>
										{status === 'active'
											? $t('list.statusActive')
											: status === 'upcoming'
												? $t('list.statusUpcoming')
												: $t('list.statusExpired')}
									</button>
								{/each}
							</div>
						</div>

						<div class="filter-group">
							<h3 class="filter-group-title">{$t('list.filterValidityLabel')}</h3>
							<div class="tag-grid">
								<button
									class="tag-btn"
									class:active={selectedValidities.length === 0}
									onclick={() => (selectedValidities = [])}
								>
									{$t('list.validityAll')}
								</button>
								{#each ['forever', 'fixed', 'uncertain'] as validity (validity)}
									<button
										class="tag-btn"
										class:active={selectedValidities.includes(validity)}
										onclick={() => {
											if (selectedValidities.includes(validity)) {
												selectedValidities = selectedValidities.filter((v) => v !== validity);
											} else {
												selectedValidities = [...selectedValidities, validity];
											}
										}}
									>
										{validity === 'forever'
											? $t('list.validityForever')
											: validity === 'fixed'
												? $t('list.validityFixed')
												: $t('list.validityUncertain')}
									</button>
								{/each}
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Category Slider for Mobile/Tablet -->
		<div class="category-slider-wrapper mobile-only-categories">
			<div class="category-slider">
				<button
					class="category-slide-btn"
					class:active={selectedTags.length === 0}
					onclick={() => (selectedTags = [])}
				>
					{$t('list.categoryAll')}
				</button>
				{#each dynamicTags as tag (tag)}
					<button
						class="category-slide-btn"
						class:active={selectedTags.includes(tag)}
						onclick={() => {
							if (selectedTags.includes(tag)) {
								selectedTags = selectedTags.filter((t) => t !== tag);
							} else {
								selectedTags = [...selectedTags, tag];
							}
						}}
					>
						{tag}
					</button>
				{/each}
			</div>
		</div>
	</section>

	<!-- Grid List with Desktop Sidebar Layout -->
	<section class="feed-section container">
		<div class="list-layout-container">
			<!-- Sidebar for Desktop -->
			<aside class="desktop-sidebar">
				<div class="sidebar-filter-card">
					<h3 class="sidebar-title">{$t('list.sidebarTitle')}</h3>
					<div class="sidebar-tag-list">
						<button
							class="sidebar-tag-btn"
							class:active={selectedTags.length === 0}
							onclick={() => (selectedTags = [])}
						>
							{$t('list.categoryAll')}
						</button>
						{#each dynamicTags as tag (tag)}
							<button
								class="sidebar-tag-btn"
								class:active={selectedTags.includes(tag)}
								onclick={() => {
									if (selectedTags.includes(tag)) {
										selectedTags = selectedTags.filter((t) => t !== tag);
									} else {
										selectedTags = [...selectedTags, tag];
									}
								}}
							>
								{tag}
							</button>
						{/each}
					</div>
				</div>
			</aside>

			<!-- Main Content Area -->
			<div class="main-content-area">
				{#if filteredBansos.length === 0}
					<div class="empty-state glass-card">
						<div class="empty-icon"><i class="fa-solid fa-ghost"></i></div>
						<h2>{$t('list.emptyTitle')}</h2>
						<p>{$t('list.emptyDesc')}</p>
						<button
							class="btn-primary"
							onclick={() => {
								selectedTags = [];
								selectedStatuses = [];
								selectedValidities = [];
								sortOrder = 'popular';
								searchQuery = '';
								currentPage = 1;
							}}
						>
							{$t('list.emptyResetBtn')}
						</button>
					</div>
				{:else}
					<div class="result-summary">
						<span
							>{$t('list.resultSummary', {
								values: { start: pageStart, end: pageEnd, total: filteredBansos.length }
							})}</span
						>
						<span
							>{$t('list.resultPage', {
								values: { current: currentPage, total: totalPages }
							})}</span
						>
					</div>
					<div class="bansos-grid">
						{#each paginatedBansos as item (item.id)}
							<BansosCard
								{item}
								views={popularityData[item.id] || 0}
								comments={discussionStats[item.id]?.comments || 0}
								reactions={discussionStats[item.id]?.reactions || 0}
							/>
						{/each}
					</div>
					<Pagination bind:currentPage {totalPages} />
				{/if}
			</div>
		</div>
	</section>
</main>

<style>
	.page-wrapper {
		position: relative;
		padding-block: 3rem;
		display: flex;
		flex-direction: column;
		gap: 3.5rem;
		z-index: 1;
	}

	.list-glow {
		top: -15rem;
		left: 50%;
		transform: translateX(-50%);
		background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 60%);
	}

	.feed-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.eyebrow {
		color: var(--color-accent);
		font-size: 0.8rem;
		font-weight: 850;
		text-transform: uppercase;
		margin-bottom: 0.5rem;
	}

	h1 {
		font-size: var(--font-size-h1);
		line-height: 1.1;
		font-weight: 800;
		letter-spacing: -0.02em;
	}

	.subtitle-text {
		color: var(--text-secondary);
		font-size: 1rem;
	}

	.controls-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: -1rem;
	}

	.controls-wrapper {
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
		align-items: stretch;
	}

	.search-box-wrapper {
		flex: 1;
		min-width: 0;
	}

	@media (min-width: 48rem) {
		.filter-card {
			width: 20rem;
		}
		.filter-header {
			margin: 0;
		}
	}

	.filter-card {
		background: linear-gradient(var(--glass-bg), var(--glass-bg)) var(--bg-primary);
		border: 1px solid var(--glass-border);
		border-radius: 1rem;
		position: relative;
		z-index: 45;
		display: flex;
		align-items: center;
	}

	.filter-header {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		background: transparent;
		border: none;
		color: var(--text-primary);
		font-family: inherit;
		font-size: 1.05rem;
		font-weight: 650;
		cursor: pointer;
		padding: 1rem;
		gap: 0.5rem;
	}

	.filter-text-desktop {
		display: none;
	}

	.filter-chevron-desktop {
		display: none;
	}

	@media (min-width: 48rem) {
		.filter-header {
			justify-content: space-between;
			padding: 1rem 1.5rem;
			gap: 0.75rem;
		}

		.filter-text-desktop {
			display: inline;
		}

		.filter-chevron-desktop {
			display: inline-block;
		}
	}

	.filter-title {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.active-count {
		background: var(--color-accent);
		color: #ffffff;
		font-size: 0.75rem;
		font-weight: 800;
		padding: 0.1rem 0.6rem;
		border-radius: 1rem;
		margin-left: 0.25rem;
	}

	.dropdown-backdrop {
		position: fixed;
		inset: 0;
		z-index: 40;
		cursor: default;
	}

	.filter-dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		width: max-content;
		max-width: calc(100vw - 2rem);
		padding: 1.25rem 1.5rem;
		z-index: 50;
		border-radius: 1rem;
		background: linear-gradient(var(--glass-bg), var(--glass-bg)) var(--bg-primary);
		border: 1px solid var(--glass-border);
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
		max-height: 50vh;
		overflow-y: auto;
	}

	@media (min-width: 48rem) {
		.filter-dropdown {
			left: 0;
			width: auto;
			max-width: none;
			max-height: 60vh;
		}
	}

	.filter-dropdown::-webkit-scrollbar {
		width: 6px;
	}

	.filter-dropdown::-webkit-scrollbar-track {
		background: transparent;
	}

	.filter-dropdown::-webkit-scrollbar-thumb {
		background-color: var(--border-color);
		border-radius: 10px;
	}

	.filter-group + .filter-group {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--border-color);
	}

	.filter-group-title {
		font-size: 0.9rem;
		font-weight: 750;
		color: var(--text-primary);
		margin-bottom: 0.75rem;
	}

	.tag-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag-btn {
		border: 1px solid var(--border-color);
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.04);
		color: var(--text-secondary);
		font: inherit;
		font-size: 0.85rem;
		font-weight: 750;
		padding: 0.5rem 0.8rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.tag-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text-primary);
	}

	.tag-btn.active {
		border-color: rgba(16, 185, 129, 0.55);
		background: rgba(16, 185, 129, 0.14);
		color: var(--color-success);
	}

	.feed-section {
		min-height: 40vh;
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

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 1rem;
		padding: 4rem 2rem;
	}

	.empty-icon {
		font-size: 3.5rem;
		color: var(--text-muted);
		margin-bottom: 0.5rem;
		animation: float 3s ease-in-out infinite;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--text-primary);
	}

	.empty-state p {
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
	}

	.bansos-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}

	.inline-anxious {
		width: 2.25rem;
		height: 2.25rem;
		vertical-align: middle;
		margin-left: 0.5rem;
	}

	.anxious-icon:hover {
		animation: shake 0.4s infinite alternate;
	}

	.sweat-drop {
		animation: drip 1.8s infinite ease-in;
		transform-origin: center;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(1.1);
		}
	}

	@keyframes shake {
		0% {
			transform: translate(1px, 1px) rotate(0deg);
		}
		10% {
			transform: translate(-1px, -2px) rotate(-1deg);
		}
		20% {
			transform: translate(-3px, 0px) rotate(1deg);
		}
		30% {
			transform: translate(0px, 2px) rotate(0deg);
		}
		40% {
			transform: translate(1px, -1px) rotate(1deg);
		}
		50% {
			transform: translate(-1px, 2px) rotate(-1deg);
		}
		60% {
			transform: translate(-3px, 1px) rotate(0deg);
		}
		70% {
			transform: translate(2px, 1px) rotate(-1deg);
		}
		80% {
			transform: translate(-1px, -1px) rotate(1deg);
		}
		90% {
			transform: translate(2px, 2px) rotate(0deg);
		}
		100% {
			transform: translate(1px, -2px) rotate(-1deg);
		}
	}

	@keyframes drip {
		0% {
			transform: translateY(-4px);
			opacity: 0;
		}
		20% {
			opacity: 1;
		}
		80% {
			opacity: 0.8;
		}
		100% {
			transform: translateY(12px);
			opacity: 0;
		}
	}

	@media (max-width: 64rem) {
		.page-wrapper {
			padding-block: 0.75rem 2.5rem;
			gap: 1.5rem;
		}
	}

	@media (max-width: 48rem) {
		h1 {
			font-size: 2.5rem;
			height: auto;
			min-width: auto;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	@media (min-width: 48rem) {
		.bansos-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.category-slider {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		scroll-behavior: smooth;
		padding-block: 0.5rem;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none; /* Hide scrollbar */
	}

	.category-slider::-webkit-scrollbar {
		display: none;
	}

	.category-slide-btn {
		white-space: nowrap;
		padding: 0.5rem 1.15rem;
		border: 1px solid var(--border-color);
		border-radius: 999px;
		background: color-mix(in srgb, var(--text-primary) 3%, transparent);
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 750;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.category-slide-btn:hover {
		color: var(--text-primary);
		background: color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-color: var(--text-secondary);
	}

	.category-slide-btn.active {
		color: #fff;
		background: var(--color-accent);
		border-color: var(--color-accent);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
	}

	.list-layout-container {
		display: flex;
		gap: 2rem;
		width: 100%;
	}

	.desktop-sidebar {
		display: none;
		width: 16rem;
		flex-shrink: 0;
	}

	.sidebar-filter-card {
		background: color-mix(in srgb, var(--text-primary) 2%, var(--bg-secondary));
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		padding: 1.5rem;
		position: sticky;
		top: 5.5rem;
	}

	.sidebar-title {
		font-size: 0.95rem;
		font-weight: 850;
		color: var(--text-primary);
		margin-bottom: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.sidebar-tag-list {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.sidebar-tag-btn {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		border: 1px solid var(--border-color);
		border-radius: 999px;
		background: color-mix(in srgb, var(--text-primary) 3%, transparent);
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 750;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.sidebar-tag-btn:hover {
		color: var(--text-primary);
		background: color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-color: var(--text-secondary);
	}

	.sidebar-tag-btn.active {
		color: #fff;
		background: var(--color-accent);
		border-color: var(--color-accent);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
	}

	.main-content-area {
		flex: 1;
		min-width: 0;
	}

	.category-slider-wrapper {
		margin-top: 1rem;
		width: 100%;
	}

	@media (min-width: 64rem) {
		.desktop-sidebar {
			display: block;
		}
		.mobile-only-categories {
			display: none;
		}
	}
</style>
