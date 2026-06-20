<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import FloatingEmoji from '$lib/components/FloatingEmoji.svelte';
	import BansosCard from '$lib/components/BansosCard.svelte';
	import {
		getCommitContributorsForItem,
		getItemSource,
		getProviderBySlug,
		recommendedBansosFor,
		slugifyProvider,
		bansosList
	} from '$lib/data/bansos';

	const GISCUS_REPO = import.meta.env.VITE_GISCUS_REPO || 'wauputr4/bansos';
	const GISCUS_REPO_ID = import.meta.env.VITE_GISCUS_REPO_ID || 'R_kgDOS3nyxQ';
	const GISCUS_CATEGORY = import.meta.env.VITE_GISCUS_CATEGORY || 'General';
	const GISCUS_CATEGORY_ID = import.meta.env.VITE_GISCUS_CATEGORY_ID || '';

	let giscusContainer: HTMLDivElement | null = $state(null);

	let { data } = $props();

	let popularityData: Record<string, number> = $state({});
	const item = $derived(bansosList.find((i) => i.id === data.id) || data.item);
	const views = $derived(item ? popularityData[item.id] || 0 : 0);

	let commentCount = $state(0);

	onMount(async () => {
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
	});

	if (browser) {
		const handleMessage = (event: MessageEvent) => {
			if (event.origin !== 'https://giscus.app') return;
			if (!(event.data && event.data.giscus)) return;

			const giscusData = event.data.giscus;
			if (giscusData.discussion && giscusData.discussion.totalCommentCount !== undefined) {
				commentCount = giscusData.discussion.totalCommentCount;
			}
		};

		onMount(() => {
			window.addEventListener('message', handleMessage);
			return () => {
				window.removeEventListener('message', handleMessage);
			};
		});
	}
	const provider = $derived(item ? getProviderBySlug(slugifyProvider(item.provider)) : null);
	const source = $derived(item ? getItemSource(item) : undefined);
	const sourceIsUrl = $derived(source ? /^https?:\/\//.test(source) : false);
	const commitContributors = $derived(item ? getCommitContributorsForItem(item.id) : []);
	const status = $derived(item?.status || 'unknown');

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
	const pageUrl = $derived(item ? `https://bansos.dev/list/${item.id}/` : '');

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
		return recommendedBansosFor(item, bansosList, 3);
	});

	$effect(() => {
		if (browser && item && giscusContainer && GISCUS_REPO && GISCUS_REPO_ID && GISCUS_CATEGORY_ID) {
			// eslint-disable-next-line svelte/no-dom-manipulating
			giscusContainer.innerHTML = '';
			const script = document.createElement('script');
			script.src = 'https://giscus.app/client.js';
			script.setAttribute('data-repo', GISCUS_REPO);
			script.setAttribute('data-repo-id', GISCUS_REPO_ID);
			script.setAttribute('data-category', GISCUS_CATEGORY);
			script.setAttribute('data-category-id', GISCUS_CATEGORY_ID);
			script.setAttribute('data-mapping', 'pathname');
			script.setAttribute('data-strict', '0');
			script.setAttribute('data-reactions-enabled', '1');
			script.setAttribute('data-emit-metadata', '1');
			script.setAttribute('data-input-position', 'bottom');
			script.setAttribute('data-theme', 'preferred_color_scheme');
			script.setAttribute('data-lang', 'id');
			script.setAttribute('crossorigin', 'anonymous');
			script.async = true;
			// eslint-disable-next-line svelte/no-dom-manipulating
			giscusContainer.appendChild(script);
		}
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
		<link rel="canonical" href={pageUrl} />

		<meta property="og:type" content="article" />
		<meta property="og:url" content={pageUrl} />
		<meta property="og:title" content={seoTitle} />
		<meta property="og:description" content={seoDesc} />
		<meta property="og:image" content="{pageUrl}og.png" />

		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:url" content={pageUrl} />
		<meta property="twitter:title" content={seoTitle} />
		<meta property="twitter:description" content={seoDesc} />
		<meta property="twitter:image" content="{pageUrl}og.png" />

		<svelte:element this={schemaScriptTag} type="application/ld+json">{schemaJson}</svelte:element>
	{/if}
</svelte:head>

{#if !item}
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
{:else}
	<main class="page-wrapper">
		<div class="glow-orb detail-glow"></div>

		<!-- Main Layout Grid on Desktop -->
		<div class="detail-layout-grid container">
			<!-- Left Column: Main Detail & Comments -->
			<div class="detail-main-col">
				<article class="glass-card detail-card">
					<header class="detail-header">
						<div class="header-top-row">
							<div class="tags-scroll-container">
								{#each item.tags as tag (tag)}
									<span class="tag-badge">{tag}</span>
								{/each}
								<span
									class="tag-badge views-badge"
									style="gap: 0.25rem; display: inline-flex; align-items: center; color: var(--color-accent); border-color: var(--color-accent-glow);"
								>
									<i class="fa-regular fa-eye" style="font-size: 0.7rem;"></i>
									{views}
								</span>
								{#if commentCount > 0}
									<span
										class="tag-badge comments-badge"
										style="gap: 0.25rem; display: inline-flex; align-items: center; color: var(--color-success); border-color: var(--color-success-glow);"
									>
										<i class="fa-regular fa-comment" style="font-size: 0.7rem;"></i>
										{commentCount}
									</span>
								{/if}
							</div>
							<div class="status-container">
								<span class="status-badge status-{status}"
									><i class="fa-solid fa-circle"></i> {status.toUpperCase()}</span
								>
							</div>
						</div>
						<h1 class="detail-title text-gradient text-pretty">{item.title}</h1>
						<div class="provider-meta">
							{#if provider?.faviconUrl}
								<img src={provider.faviconUrl} alt="" loading="lazy" class="provider-logo" />
							{/if}
							<p class="detail-subtitle">
								Disponsori oleh
								{#if provider}
									<a href={resolve(`/providers/${slugifyProvider(item.provider)}`)}
										>{item.provider}</a
									>
								{:else}
									<strong>{item.provider}</strong>
								{/if}
								<span aria-hidden="true">·</span>
								<span
									>Diterbitkan pada {new Date(item.publishedAt || '2026-06-11').toLocaleDateString(
										'id-ID',
										{ day: 'numeric', month: 'long', year: 'numeric' }
									)}</span
								>
							</p>
						</div>
					</header>

					<div class="detail-meta-grid">
						{#if source}
							<div class="meta-card">
								<span class="meta-label"><i class="fa-solid fa-link"></i> Sumber Resmi</span>
								{#if sourceIsUrl}
									<a href={source} target="_blank" rel="noopener noreferrer">{source}</a>
								{:else}
									<strong>{source}</strong>
								{/if}
							</div>
						{/if}
						{#if item.contributor || commitContributors.length > 0}
							<div class="meta-card">
								<span class="meta-label"
									><i class="fa-solid fa-code-branch"></i> Kontributor Proyek</span
								>
								{#if item.contributor}
									<div
										class="original-contributor"
										style="margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);"
									>
										Dikontribusikan oleh:
										<a
											href={item.contributor.url}
											target="_blank"
											rel="noopener noreferrer"
											style="color: var(--color-accent); font-weight: 700;"
										>
											{item.contributor.name}
										</a>
									</div>
								{/if}
								{#if commitContributors.length > 0}
									<div class="commit-list">
										{#each commitContributors as contributor (contributor.login)}
											<a
												href={contributor.commitUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="commit-person"
												title={`Commit oleh ${contributor.login}`}
											>
												<img src={contributor.avatarUrl} alt={contributor.login} loading="lazy" />
												<span>@{contributor.login}</span>
											</a>
										{/each}
									</div>
								{/if}
							</div>
						{/if}
					</div>

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
									Sayang sekali promo bansos ini sudah tidak aktif alias expired. Kamu tetep bisa
									baca panduannya buat referensi ya!
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
				</article>

				<!-- Giscus Comments Section -->
				{#if GISCUS_REPO && GISCUS_REPO_ID && GISCUS_CATEGORY_ID}
					<div class="glass-card comments-card">
						<h2
							style="font-size: 1.25rem; font-weight: 700; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);"
						>
							<i class="fa-regular fa-comments"></i> Diskusi & Komentar
						</h2>
						<div bind:this={giscusContainer}></div>
					</div>
				{/if}
			</div>

			<!-- Right Column: Sidebar (Recommendations) -->
			<aside class="detail-sidebar-col">
				<div class="sidebar-recommendations-header">
					<h3 class="sidebar-recommendations-title">
						<i class="fa-solid fa-sparkles text-emerald"></i> Rekomendasi Lainnya
					</h3>
					<a href={resolve('/list')} class="btn-lihat-semua-sidebar"
						>Lihat Semua <i class="fa-solid fa-arrow-right"></i></a
					>
				</div>
				{#if recommendedBansos.length > 0}
					<div class="sidebar-recommendations-list">
						{#each recommendedBansos as recommend (recommend.id)}
							<BansosCard
								item={recommend}
								compact={true}
								views={popularityData[recommend.id] || 0}
							/>
						{/each}
					</div>
				{:else}
					<p class="empty-recommendation text-pretty">Belum ada rekomendasi saat ini.</p>
				{/if}
			</aside>
		</div>

		<!-- CTA Tentang bansos.dev & Ajakan Kontribusi (Bottom of the page) -->
		<section class="bottom-cta-section container">
			<div class="glass-card bottom-cta-card">
				<div class="bottom-cta-info">
					<h2><i class="fa-solid fa-circle-info text-emerald"></i> Tentang bansos.dev</h2>
					<p>
						Katalog kurasi promo & diskonan developer gratisan. Dikelola 100% transparan oleh
						komunitas di GitHub. Yuk bantu sesama developer jelata bertahan hidup dengan ikutan
						kontribusi!
					</p>
				</div>
				<div class="bottom-cta-actions">
					<a href={resolve('/contribute')} class="btn-primary">
						<i class="fa-solid fa-code-pull-request"></i> Ajukan Bansos Baru
					</a>
					<a
						href="https://github.com/wauputr4/bansos"
						target="_blank"
						rel="noopener noreferrer"
						class="btn-secondary"
					>
						<i class="fa-solid fa-star"></i> Star di GitHub
					</a>
				</div>
			</div>
		</section>

		<!-- Floating Particles -->
		<FloatingEmoji emojis={floatingEmojis} />
	</main>
{/if}

<style>
	.page-wrapper {
		position: relative;
		padding-block: 1.25rem 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		z-index: 1;
	}

	.detail-glow {
		top: -20rem;
		left: 50%;
		transform: translateX(-50%);
		background: radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 60%);
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
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.95rem;
		color: var(--text-secondary);
	}

	.detail-subtitle a {
		color: var(--color-accent);
		font-weight: 800;
	}

	.provider-meta {
		display: flex;
		align-items: center;
		gap: 0.65rem;
	}

	.provider-logo {
		width: 2rem;
		height: 2rem;
		border: 1px solid var(--border-color);
		border-radius: 0.6rem;
		background: var(--bg-secondary);
		object-fit: contain;
		padding: 0.3rem;
		flex-shrink: 0;
	}
	.detail-meta-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	@media (min-width: 48rem) {
		.detail-meta-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.meta-card {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		min-width: 0;
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		padding: 0.8rem;
	}

	.meta-label {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		color: var(--text-muted);
		font-size: 0.75rem;
		font-weight: 850;
		text-transform: uppercase;
	}

	.meta-card a,
	.meta-card strong {
		color: var(--text-primary);
		font-size: 0.86rem;
		font-weight: 750;
		overflow-wrap: anywhere;
	}

	.commit-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
	}

	.commit-person {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		border: 1px solid var(--border-color);
		border-radius: 999px;
		background: var(--bg-secondary);
		padding: 0.25rem 0.55rem 0.25rem 0.25rem;
	}

	.commit-person img {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 999px;
		display: block;
	}

	.commit-person span {
		display: inline-block;
		transform: translateY(-1.5px);
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

	.sidebar-recommendations-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.sidebar-recommendations-title {
		font-size: 1.1rem;
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sidebar-recommendations-title i.text-emerald {
		color: var(--color-accent);
	}

	.btn-lihat-semua-sidebar {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--color-accent);
		font-size: 0.8rem;
		font-weight: 700;
		text-decoration: none;
		transition: transform 0.2s;
	}

	.btn-lihat-semua-sidebar:hover {
		transform: translateX(3px);
	}

	.sidebar-recommendations-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	.empty-recommendation {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.comments-card {
		margin-top: 1.5rem;
		padding: 2rem;
	}

	.bottom-cta-section {
		margin-top: 1.5rem;
	}

	.bottom-cta-card {
		padding: 2.25rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		text-align: center;
		align-items: center;
		background: radial-gradient(
			circle at 50% 50%,
			rgba(16, 185, 129, 0.03) 0%,
			var(--glass-bg) 100%
		);
		border-color: rgba(16, 185, 129, 0.15);
	}

	.bottom-cta-info h2 {
		font-size: var(--font-size-h2);
		font-weight: 800;
		color: var(--text-primary);
		margin: 0 0 0.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.bottom-cta-info h2 i.text-emerald {
		color: var(--color-accent);
	}

	.bottom-cta-info p {
		font-size: 0.95rem;
		color: var(--text-secondary);
		line-height: 1.5;
		margin: 0;
		max-width: 48rem;
	}

	.bottom-cta-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1rem;
		width: 100%;
	}

	.bottom-cta-actions :global(.btn-primary),
	.bottom-cta-actions :global(.btn-secondary) {
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-weight: 750;
		padding: 0.75rem 1.75rem;
		border-radius: 0.75rem;
		font-size: 0.9rem;
	}

	@media (min-width: 48rem) {
		.page-wrapper {
			padding-block: 1.5rem 2.5rem;
			gap: 1.5rem;
		}

		.sidebar-recommendations-list {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: 1.25rem;
		}

		.bottom-cta-card {
			padding: 3rem;
			gap: 2rem;
		}
	}

	.detail-layout-grid {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		width: 100%;
	}

	.detail-main-col {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		flex: 1;
		min-width: 0;
	}

	.detail-sidebar-col {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		width: 100%;
	}

	@media (min-width: 64rem) {
		.sidebar-recommendations-list {
			display: flex;
			flex-direction: column;
			gap: 1rem;
		}

		.bottom-cta-card {
			flex-direction: row;
			justify-content: space-between;
			text-align: left;
			align-items: center;
			gap: 3rem;
		}

		.bottom-cta-info {
			flex: 1;
		}

		.bottom-cta-info h2 {
			justify-content: flex-start;
		}

		.bottom-cta-actions {
			width: auto;
			flex-shrink: 0;
		}

		.detail-layout-grid {
			flex-direction: row;
			align-items: flex-start;
			gap: 2rem;
		}

		.detail-main-col {
			flex: 1;
		}

		.detail-sidebar-col {
			width: 20rem;
			flex-shrink: 0;
			position: sticky;
			top: 5.5rem;
		}
	}
</style>
