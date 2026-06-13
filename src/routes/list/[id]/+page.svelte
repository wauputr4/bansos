<script lang="ts">
	import { resolve } from '$app/paths';
	import FloatingEmoji from '$lib/components/FloatingEmoji.svelte';
	import BansosCard from '$lib/components/BansosCard.svelte';
	import { recommendedBansosFor } from '$lib/data/bansos';
	import { bansosState, initBansosStore, fetchLatestBansos } from '$lib/stores/bansos.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	const item = $derived(bansosState.data.find((i) => i.id === data.id) || data.item);

	onMount(() => {
		initBansosStore();
		if (!item) {
			fetchLatestBansos();
		}
	});

	let copied = $state(false);
	let floatingEmojis = $state<{ id: number; x: number; y: number; icon: string; color?: string }[]>(
		[]
	);

	async function copyCode(text: string, e: MouseEvent) {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			// Spawn emoji
			const emoji = {
				id: Math.random(),
				x: e.clientX,
				y: e.clientY,
				icon: 'fa-solid fa-money-bill-wave',
				color: '#10b981'
			};
			floatingEmojis = [...floatingEmojis, emoji];
			setTimeout(() => {
				floatingEmojis = floatingEmojis.filter((i) => i.id !== emoji.id);
			}, 1000);

			setTimeout(() => (copied = false), 2000);
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
	}

	// Dynamic SEO Meta definitions
	const seoTitle = $derived(
		item ? `Cara Dapat ${item.title} - bansos.dev` : 'Bansos Tidak Ditemukan'
	);
	const seoDesc = $derived(
		item
			? `Panduan step-by-step paling lengkap buat klaim ${item.title} khusus developer jelata. 100% legal, no credit card required!`
			: ''
	);
	const pageUrl = $derived(item ? `https://bansos.dev/list/${item.id}` : '');

	// JSON-LD Specific Product / Guide Schema
	const schemaData = $derived(
		item
			? {
					'@context': 'https://schema.org',
					'@type': 'HowTo',
					name: `Cara Klaim ${item.title}`,
					description: item.description,
					totalTime: 'PT5M',
					supply: [
						{
							'@type': 'HowToSupply',
							name: 'Koneksi Internet'
						},
						{
							'@type': 'HowToSupply',
							name: 'Akun Dev Aktif'
						}
					],
					tool: [
						{
							'@type': 'HowToTool',
							name: 'Web Browser'
						}
					],
					step: item.requirements.map((req: string, index: number) => ({
						'@type': 'HowToStep',
						position: index + 1,
						name: `Langkah ${index + 1}`,
						text: req
					}))
				}
			: null
	);
	const schemaJson = $derived(
		schemaData ? JSON.stringify(schemaData).replace(/</g, '\\u003c') : ''
	);
	const schemaScriptTag = 'script';

	const recommendedBansos = $derived.by(() => {
		if (!item) return [];
		return recommendedBansosFor(item, bansosState.data, 3);
	});
</script>

<svelte:head>
	<title>{seoTitle}</title>
	{#if item}
		<meta name="title" content={seoTitle} />
		<meta name="description" content={seoDesc} />
		<meta
			name="keywords"
			content="cara klaim bansos, {item.provider} gratisan, tutorial domain gratis, devweek26, domain gratisan, no credit card"
		/>

		<meta property="og:type" content="article" />
		<meta property="og:url" content={pageUrl} />
		<meta property="og:title" content={seoTitle} />
		<meta property="og:description" content={seoDesc} />

		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:url" content={pageUrl} />
		<meta property="twitter:title" content={seoTitle} />
		<meta property="twitter:description" content={seoDesc} />

		<svelte:element this={schemaScriptTag} type="application/ld+json">{schemaJson}</svelte:element>
	{/if}
</svelte:head>

{#if !item}
	{#if bansosState.isFetching}
		<main
			class="page-wrapper container"
			style="align-items: center; justify-content: center; min-height: 60vh;"
		>
			<div
				class="empty-state glass-card"
				style="margin-top: 4rem; max-width: 30rem; text-align: center; padding: 3rem 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;"
			>
				<div class="empty-icon" style="font-size: 4rem;">
					<i class="fa-solid fa-circle-notch fa-spin" style="color: var(--color-accent);"></i>
				</div>
				<h2>Mencari Data...</h2>
				<p style="color: var(--text-secondary);">
					Tunggu bentar ya, lagi nyari info terbaru dari repository...
				</p>
			</div>
		</main>
	{:else}
		<main
			class="page-wrapper container"
			style="align-items: center; justify-content: center; min-height: 60vh;"
		>
			<div
				class="empty-state glass-card"
				style="margin-top: 4rem; max-width: 30rem; text-align: center; padding: 3rem 2rem; display: flex; flex-direction: column; gap: 1rem; align-items: center;"
			>
				<div class="empty-icon" style="font-size: 4rem;">
					<i class="fa-solid fa-triangle-exclamation" style="color: var(--color-warning);"></i>
				</div>
				<h2>Waduh, Bansos ini gak ketemu!</h2>
				<p style="color: var(--text-secondary);">
					Sepertinya bansos ini udah digondol koruptor atau belum masuk ke sistem, fr fr 😭
				</p>
				<a
					href={resolve('/list')}
					class="btn-primary"
					style="margin-top: 1rem; gap: 0.5rem; text-decoration: none;"
				>
					<i class="fa-solid fa-arrow-left"></i> Kembali ke List
				</a>
			</div>
		</main>
	{/if}
{:else}
	<main class="page-wrapper">
		<div class="glow-orb detail-glow"></div>

		<!-- Top Navigation -->
		<nav class="top-nav container">
			<a href={resolve('/list')} class="btn-back">
				<span class="arrow">←</span> Kembali ke List Bansos
			</a>
		</nav>

		<!-- Main Detail Card -->
		<article class="detail-container container">
			<div class="glass-card detail-card">
				<header class="detail-header">
					<div class="header-top-row">
						<div class="tags-scroll-container">
							{#each item.tags as tag (tag)}
								<span class="tag-badge">{tag}</span>
							{/each}
						</div>
						<div class="status-container">
							<span class="status-badge status-{item.status}"
								><i class="fa-solid fa-circle"></i> {item.status.toUpperCase()}</span
							>
						</div>
					</div>
					<h1 class="detail-title text-gradient text-pretty">{item.title}</h1>
					<p class="detail-subtitle">
						Disponsori oleh <strong>{item.provider}</strong> — Diterbitkan pada Juni 2026
					</p>
					{#if item.contributor}
						<p class="detail-contributor">
							Dikontribusikan oleh
							<a href={item.contributor.url} target="_blank" rel="noopener noreferrer">
								{item.contributor.name}
							</a>
						</p>
					{/if}
				</header>

				{#if item.status === 'expired'}
					<div
						class="tips-box"
						style="background: rgba(239, 68, 68, 0.08); border-left-color: #ef4444;"
					>
						<span class="tips-icon" style="color: #ef4444;"
							><i class="fa-solid fa-triangle-exclamation"></i></span
						>
						<div class="tips-content">
							<h3 style="color: #ef4444;">Yah, Promo Sudah Berakhir!</h3>
							<p>
								Sayang sekali promo bansos ini sudah tidak aktif alias expired. Kamu tetep bisa baca
								panduannya buat referensi ya!
							</p>
						</div>
					</div>
				{/if}

				{#if item.tips}
					<div class="tips-box">
						<span class="tips-icon"><i class="fa-solid fa-lightbulb"></i></span>
						<div class="tips-content">
							<h3>Tips Pro Jelata:</h3>
							<p>{item.tips}</p>
						</div>
					</div>
				{/if}

				<section class="section-block">
					<h2><i class="fa-solid fa-circle-question"></i> Apa ini?</h2>
					<p class="description-text text-pretty">{item.description}</p>
				</section>

				<section class="section-block">
					<h2><i class="fa-solid fa-gift"></i> Benefit yang Didapatkan:</h2>
					<ul class="benefit-list">
						{#each item.benefits as benefit (benefit)}
							<li><span class="check-icon">✓</span> {benefit}</li>
						{/each}
					</ul>
				</section>

				{#if item.promoCode}
					<section class="section-block promo-section">
						<h2><i class="fa-solid fa-key"></i> Kode Promo Spesial:</h2>
						<p class="promo-subtitle">
							Salin kode ini dan masukkan saat checkout di {item.provider}:
						</p>
						<div class="promo-clipboard-box">
							<code>{item.promoCode}</code>
							<button
								class="btn-primary copy-btn"
								onclick={(e) => copyCode(item.promoCode || '', e)}
							>
								{#if copied}
									<i class="fa-solid fa-check"></i> Copied!
								{:else}
									<i class="fa-solid fa-copy"></i> Salin
								{/if}
							</button>
						</div>
					</section>
				{/if}

				<section class="section-block guide-section">
					<h2>
						<i class="fa-solid fa-screwdriver-wrench"></i> Step-by-Step Cara Dapetinnya (No Cap):
					</h2>
					<ol class="step-list">
						{#each item.requirements as req, idx (req)}
							<li class="step-item">
								<span class="step-num">{idx + 1}</span>
								<p class="step-content text-pretty">{req}</p>
							</li>
						{/each}
					</ol>
				</section>

				<div class="action-footer">
					<a
						href={item.ctaLink}
						target="_blank"
						rel="noopener noreferrer"
						class="btn-primary cta-btn"
					>
						<i class="fa-solid fa-rocket"></i> Eksekusi ke Website Official
					</a>
				</div>
			</div>
		</article>

		<!-- Rekomendasi Bansos Lainnya -->
		<section class="recommendation-section container">
			<h2 class="recommendation-title">
				<i class="fa-solid fa-sparkles"></i> Rekomendasi Lain yang Mungkin Lo Butuhin
			</h2>
			{#if recommendedBansos.length > 0}
				<div class="recommendation-grid">
					{#each recommendedBansos as recommend (recommend.id)}
						<BansosCard item={recommend} compact={true} />
					{/each}
				</div>
			{:else}
				<p class="empty-recommendation text-pretty">
					Belum ada rekomendasi lain saat ini, balik ke list ya.
				</p>
			{/if}
		</section>

		<!-- Floating Particles -->
		<FloatingEmoji emojis={floatingEmojis} />
	</main>
{/if}

<style>
	.page-wrapper {
		position: relative;
		padding-block: 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 3.5rem;
		z-index: 1;
	}

	.detail-glow {
		top: -20rem;
		left: 50%;
		transform: translateX(-50%);
		background: radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 60%);
	}

	.top-nav {
		display: flex;
	}

	.btn-back {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: var(--text-secondary);
		border: 1px solid var(--border-color);
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		background: var(--glass-bg);
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	.btn-back:hover {
		color: var(--text-primary);
		background-color: rgba(255, 255, 255, 0.05);
	}

	.detail-container {
		max-width: 52rem;
	}

	.detail-card {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		padding: clamp(1.5rem, 4vw, 3rem);
		min-width: 0;
	}

	.detail-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 1.5rem;
	}

	.header-top-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		min-width: 0;
	}

	.tags-scroll-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		overflow-x: auto;
		scrollbar-width: none;
		min-width: 0;
	}

	.tags-scroll-container::-webkit-scrollbar {
		display: none;
	}

	.status-container {
		flex-shrink: 0;
	}

	.tag-badge {
		font-size: 0.75rem;
		font-weight: 600;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border-color);
		padding: 0.2rem 0.6rem;
		border-radius: 0.5rem;
		color: var(--text-secondary);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.status-badge {
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.2rem 0.6rem;
		border-radius: 0.5rem;
	}

	.status-active {
		background: rgba(16, 185, 129, 0.1);
		color: var(--color-success);
	}

	.status-upcoming {
		background: rgba(245, 158, 11, 0.1);
		color: var(--color-warning);
	}

	.status-expired {
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
	}

	.detail-title {
		font-size: clamp(1.75rem, 1.2rem + 2vw, 2.75rem);
		font-weight: 800;
		line-height: 1.2;
		letter-spacing: -0.02em;
	}

	.detail-subtitle {
		font-size: 0.95rem;
		color: var(--text-secondary);
	}

	.detail-contributor {
		font-size: 0.9rem;
		color: var(--text-muted);
	}

	.detail-contributor a {
		color: var(--color-accent);
		font-weight: 700;
	}

	.section-block {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.section-block h2 {
		font-size: var(--font-size-h3);
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: -0.01em;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.description-text {
		color: var(--text-secondary);
		line-height: 1.7;
	}

	.benefit-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.benefit-list li {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		color: var(--text-secondary);
	}

	.check-icon {
		color: var(--color-success);
		font-weight: bold;
	}

	/* Promo Section */
	.promo-section {
		background: rgba(99, 102, 241, 0.04);
		border: 1px dashed rgba(99, 102, 241, 0.3);
		padding: 1.5rem;
		border-radius: 1rem;
	}

	.promo-subtitle {
		font-size: 0.9rem;
		color: var(--text-secondary);
	}

	.promo-clipboard-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid var(--border-color);
		padding: 0.75rem 1.25rem;
		border-radius: 0.75rem;
		gap: 1.5rem;
	}

	.promo-clipboard-box code {
		font-family: monospace;
		font-size: 1.35rem;
		font-weight: 700;
		color: var(--text-primary);
		letter-spacing: 0.05em;
	}

	.copy-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* Step List */
	.step-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.step-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: rgba(255, 255, 255, 0.02);
		padding: 1rem;
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
	}

	.step-num {
		background: var(--color-accent);
		color: #ffffff;
		font-size: 0.85rem;
		font-weight: 700;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.step-content {
		color: var(--text-secondary);
		font-size: 0.95rem;
	}

	/* Tips Box */
	.tips-box {
		display: flex;
		gap: 1rem;
		background: rgba(245, 158, 11, 0.08);
		border-left: 4px solid var(--color-warning);
		padding: 1.5rem;
		border-radius: 0.25rem 0.75rem 0.75rem 0.25rem;
	}

	.tips-icon {
		font-size: 1.5rem;
	}

	.tips-content h3 {
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-warning);
		margin-bottom: 0.35rem;
	}

	.tips-content p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.action-footer {
		margin-top: 1rem;
		border-top: 1px solid var(--border-color);
		padding-top: 2rem;
	}

	.cta-btn {
		width: 100%;
		font-size: 1.1rem;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
	}

	.recommendation-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.recommendation-title {
		color: var(--text-primary);
		font-size: 1.1rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.recommendation-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.empty-recommendation {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	@media (min-width: 48rem) {
		.recommendation-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
