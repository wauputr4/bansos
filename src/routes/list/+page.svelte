<script lang="ts">
	import BansosCard from '$lib/components/BansosCard.svelte';
	import {
		bansosState,
		initBansosStore,
		fetchLatestBansos,
		COOLDOWN_MS
	} from '$lib/stores/bansos.svelte';
	import { onMount, onDestroy } from 'svelte';

	let remainingTime = $state(0);
	let timerInterval: ReturnType<typeof setInterval>;

	function startCountdown() {
		clearInterval(timerInterval);
		const updateTimer = () => {
			const now = Date.now();
			const passed = now - bansosState.lastFetched;
			if (passed < COOLDOWN_MS) {
				remainingTime = COOLDOWN_MS - passed;
			} else {
				remainingTime = 0;
				clearInterval(timerInterval);
			}
		};
		updateTimer();
		timerInterval = setInterval(updateTimer, 1000);
	}

	onMount(() => {
		initBansosStore();
		if (bansosState.lastFetched > 0) {
			startCountdown();
		}
	});

	onDestroy(() => {
		clearInterval(timerInterval);
	});

	let selectedTags: string[] = $state([]);
	let selectedStatuses: string[] = $state([]);
	let sortOrder: 'newest' | 'oldest' = $state('newest');
	let filterExpanded = $state(false);
	let floatingEmojis: { id: number; x: number; y: number; icon: string; color?: string }[] = $state(
		[]
	);

	const dynamicTags = $derived(
		Array.from(new Set(bansosState.data.flatMap((item) => item.tags))).sort((a, b) =>
			a.localeCompare(b)
		)
	);

	const filteredBansos = $derived(
		bansosState.data
			.map((item, index) => ({ item, index }))
			.filter(({ item }) => {
				const tagMatch =
					selectedTags.length === 0 || item.tags.some((tag) => selectedTags.includes(tag));
				const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(item.status);
				return tagMatch && statusMatch;
			})
			.sort((a, b) => (sortOrder === 'newest' ? b.index - a.index : a.index - b.index))
			.map(({ item }) => item)
	);

	const totalSeconds = $derived(Math.ceil(remainingTime / 1000));
	const timerM = $derived(Math.floor(totalSeconds / 60));
	const timerS = $derived(totalSeconds % 60);
	const formattedTime = $derived(
		remainingTime <= 0 ? '' : timerM > 0 ? `(${timerM}m ${timerS}s)` : `(${timerS}s)`
	);

	async function handleRefresh() {
		if (remainingTime > 0) return;
		await fetchLatestBansos();
		startCountdown();
	}
</script>

<svelte:head>
	<title>Daftar Bantuan Sosial Developer - bansos.dev</title>
	<meta
		name="description"
		content="Temukan berbagai program bantuan sosial (bansos), diskon, dan gratisan tools khusus untuk developer dan programmer Indonesia."
	/>
</svelte:head>

<main class="page-wrapper">
	<div class="glow-orb list-glow"></div>

	<!-- Header -->
	<header class="feed-header container">
		<div
			style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;"
		>
			<h1 class="section-title">
				<span><i class="fa-solid fa-box-open"></i> Semua Info Bansos</span>
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
			<button
				class="btn-secondary"
				style="gap: 0.5rem; font-size: 0.9rem; padding: 0.5rem 1rem; min-width: 10.5rem;"
				onclick={handleRefresh}
				disabled={bansosState.isFetching || remainingTime > 0}
			>
				<i class="fa-solid fa-rotate-right" class:fa-spin={bansosState.isFetching}></i>
				{#if bansosState.isFetching}
					Memperbarui...
				{:else if remainingTime > 0}
					Tunggu {formattedTime}
				{:else}
					Refresh Data
				{/if}
			</button>
		</div>
		<p class="subtitle-text text-pretty">
			Klik kartu bansos untuk melihat langkah-langkah detail dan cara klaim kodenya, fr fr! 🚀
		</p>
	</header>

	<section class="filter-section container" aria-label="Filter tag bansos">
		<div class="filter-card">
			<button
				class="filter-header"
				onclick={() => (filterExpanded = !filterExpanded)}
				aria-expanded={filterExpanded}
			>
				<div class="filter-title">
					<i class="fa-solid fa-filter"></i> Filter Kategori
					{#if selectedTags.length > 0 || selectedStatuses.length > 0}
						<span class="active-count">{selectedTags.length + selectedStatuses.length}</span>
					{/if}
				</div>
				<i class="fa-solid fa-chevron-{filterExpanded ? 'up' : 'down'}"></i>
			</button>
			{#if filterExpanded}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="dropdown-backdrop" onclick={() => (filterExpanded = false)}></div>

				<div class="filter-dropdown">
					<div class="filter-group">
						<h3 class="filter-group-title">Urutan</h3>
						<div class="tag-grid">
							<button
								class="tag-btn"
								class:active={sortOrder === 'newest'}
								onclick={() => (sortOrder = 'newest')}
							>
								Terbaru
							</button>
							<button
								class="tag-btn"
								class:active={sortOrder === 'oldest'}
								onclick={() => (sortOrder = 'oldest')}
							>
								Terlama
							</button>
						</div>
					</div>

					<div class="filter-group">
						<h3 class="filter-group-title">Status</h3>
						<div class="tag-grid">
							<button
								class="tag-btn"
								class:active={selectedStatuses.length === 0}
								onclick={() => (selectedStatuses = [])}
							>
								Semua Status
							</button>
							{#each ['active', 'upcoming', 'expired'] as status}
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
										? 'Aktif'
										: status === 'upcoming'
											? 'Akan datang'
											: 'Expired'}
								</button>
							{/each}
						</div>
					</div>

					<div class="filter-group">
						<h3 class="filter-group-title">Kategori</h3>
						<div class="tag-grid">
							<button
								class="tag-btn"
								class:active={selectedTags.length === 0}
								onclick={() => (selectedTags = [])}
							>
								Semua Kategori
							</button>
							{#each dynamicTags as tag (tag)}
								<button
									class="tag-btn"
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
				</div>
			{/if}
		</div>
	</section>

	<!-- Grid List -->
	<section class="feed-section container">
		{#if filteredBansos.length === 0}
			<div class="empty-state glass-card">
				<div class="empty-icon"><i class="fa-solid fa-ghost"></i></div>
				<h2>Wah, Bansos Kosong!</h2>
				<p>Tidak ada bansos yang sesuai dengan filter yang kamu pilih.</p>
				<button
					class="btn-primary"
					onclick={() => {
						selectedTags = [];
						selectedStatuses = [];
						sortOrder = 'newest';
					}}
				>
					Reset Filter
				</button>
			</div>
		{:else}
			<div class="bansos-grid">
				{#each filteredBansos as item (item.id)}
					<BansosCard {item} />
				{/each}
			</div>
		{/if}
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

	.section-title {
		font-size: var(--font-size-h2);
		font-weight: 800;
		letter-spacing: -0.02em;
		display: flex;
		align-items: center;
	}

	.subtitle-text {
		color: var(--text-secondary);
		font-size: 1rem;
	}

	.filter-section {
		margin-bottom: -1.5rem;
	}

	.filter-card {
		background: linear-gradient(var(--glass-bg), var(--glass-bg)) var(--bg-primary);
		border: 1px solid var(--glass-border);
		padding: 1rem 1.5rem;
		border-radius: 1rem;
		position: relative;
		z-index: 45;
	}

	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		background: transparent;
		border: none;
		color: var(--text-primary);
		font-family: inherit;
		font-size: 1.1rem;
		font-weight: 750;
		cursor: pointer;
		padding: 0;
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
		left: 0;
		right: 0;
		padding: 1.25rem 1.5rem;
		z-index: 50;
		border-radius: 1rem;
		background: linear-gradient(var(--glass-bg), var(--glass-bg)) var(--bg-primary);
		border: 1px solid var(--glass-border);
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
		max-height: 60vh;
		overflow-y: auto;
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

	@media (min-width: 48rem) {
		.bansos-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
