<script lang="ts">
	import FloatingEmoji from '$lib/components/FloatingEmoji.svelte';

	let { data } = $props();
	const item = $derived(data.item);

	let copied = $state(false);
	let floatingEmojis = $state<{ id: number; x: number; y: number; text: string }[]>([]);

	async function copyCode(text: string, e: MouseEvent) {
		try {
			await navigator.clipboard.writeText(text);
			copied = true;
			// Spawn emoji
			const emoji = {
				id: Math.random(),
				x: e.clientX,
				y: e.clientY,
				text: '💸'
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
	const seoTitle = $derived(`Cara Dapat ${item.title} - bansos.dev`);
	const seoDesc = $derived(`Panduan step-by-step paling lengkap buat klaim ${item.title} khusus developer jelata. 100% legal, no credit card required!`);
	const pageUrl = $derived(`https://bansos.dev/list/${item.id}`);

	// JSON-LD Specific Product / Guide Schema
	const schemaData = $derived({
		'@context': 'https://schema.org',
		'@type': 'HowTo',
		'name': `Cara Klaim ${item.title}`,
		'description': item.description,
		'totalTime': 'PT5M',
		'supply': [
			{
				'@type': 'HowToSupply',
				'name': 'Koneksi Internet'
			},
			{
				'@type': 'HowToSupply',
				'name': 'Akun Dev Aktif'
			}
		],
		'tool': [
			{
				'@type': 'HowToTool',
				'name': 'Web Browser'
			}
		],
		'step': item.requirements.map((req, index) => ({
			'@type': 'HowToStep',
			'position': index + 1,
			'name': `Langkah ${index + 1}`,
			'text': req
		}))
	});
</script>

<svelte:head>
	<title>{seoTitle}</title>
	<meta name="title" content={seoTitle} />
	<meta name="description" content={seoDesc} />
	<meta name="keywords" content="cara klaim bansos, {item.provider} gratisan, tutorial domain gratis, devweek26, domain gratisan, no credit card" />
	
	<meta property="og:type" content="article" />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:title" content={seoTitle} />
	<meta property="og:description" content={seoDesc} />
	
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={pageUrl} />
	<meta property="twitter:title" content={seoTitle} />
	<meta property="twitter:description" content={seoDesc} />

	<script type="application/ld+json">
		{JSON.stringify(schemaData)}
	</script>
</svelte:head>

<main class="page-wrapper">
	<div class="glow-orb detail-glow"></div>
	
	<!-- Top Navigation -->
	<nav class="top-nav container">
		<a href="/list" class="btn-back">
			<span class="arrow">←</span> Kembali ke List Bansos
		</a>
	</nav>

	<!-- Main Detail Card -->
	<article class="detail-container container">
		<div class="glass-card detail-card">
			<header class="detail-header">
				<div class="badge-row">
					{#each item.tags as tag}
						<span class="tag-badge">{tag}</span>
					{/each}
					<span class="status-badge status-{item.status}">● {item.status.toUpperCase()}</span>
				</div>
				<h1 class="detail-title text-gradient text-pretty">{item.title}</h1>
				<p class="detail-subtitle">Disponsori oleh <strong>{item.provider}</strong> — Diterbitkan pada Juni 2026</p>
				{#if item.contributor}
					<p class="detail-contributor">
						Dikontribusikan oleh
						<a href={item.contributor.url} target="_blank" rel="noopener noreferrer">
							{item.contributor.name}
						</a>
					</p>
				{/if}
			</header>

			<section class="section-block">
				<h2>🤔 Apa ini?</h2>
				<p class="description-text text-pretty">{item.description}</p>
			</section>

			<section class="section-block">
				<h2>🎁 Benefit yang Didapatkan:</h2>
				<ul class="benefit-list">
					{#each item.benefits as benefit}
						<li><span class="check-icon">✓</span> {benefit}</li>
					{/each}
				</ul>
			</section>

			{#if item.promoCode}
				<section class="section-block promo-section">
					<h2>🔑 Kode Promo Spesial:</h2>
					<p class="promo-subtitle">Salin kode ini dan masukkan saat checkout di {item.provider}:</p>
					<div class="promo-clipboard-box">
						<code>{item.promoCode}</code>
						<button class="btn-primary" onclick={(e) => copyCode(item.promoCode || '', e)}>
							{copied ? 'Copied! ✅' : 'Salin Kode 📋'}
						</button>
					</div>
				</section>
			{/if}

			<section class="section-block guide-section">
				<h2>🛠️ Step-by-Step Cara Dapetinnya (No Cap):</h2>
				<ol class="step-list">
					{#each item.requirements as req, idx}
						<li class="step-item">
							<span class="step-num">{idx + 1}</span>
							<p class="step-content text-pretty">{req}</p>
						</li>
					{/each}
				</ol>
			</section>

			{#if item.tips}
				<div class="tips-box">
					<span class="tips-icon">💡</span>
					<div class="tips-content">
						<h3>Tips Pro Jelata:</h3>
						<p>{item.tips}</p>
					</div>
				</div>
			{/if}

			<div class="action-footer">
				<a href={item.ctaLink} target="_blank" rel="noopener noreferrer" class="btn-primary cta-btn">
					Eksekusi ke Website Official 🚀
				</a>
			</div>
		</div>
	</article>

	<!-- Anxious Sweating Coffee & Sad Student SVGs side-by-side for fun -->
	<section class="fun-illustrations container">
		<div class="glass-card illustration-card">
			<svg class="anxious-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path d="M15 30 C15 25 19 21 24 21 H76 C81 21 85 25 85 30 V70 C85 75 81 79 76 79 H24 C19 79 15 75 15 70 Z" fill="var(--bg-secondary)" stroke="var(--color-warning)" stroke-width="4"/>
				<path d="M55 40 H78 C82 40 85 43 85 47 V57 C85 61 82 64 78 64 H55 Z" fill="#1b1d30" stroke="var(--color-warning)" stroke-width="4"/>
				<circle cx="70" cy="52" r="4" fill="var(--color-warning)"/>
				<path d="M28 42 Q33 38 38 42 M46 42 Q51 38 56 42" stroke="var(--text-primary)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
				<circle cx="33" cy="47" r="2.5" fill="var(--text-primary)"/>
				<circle cx="51" cy="47" r="2.5" fill="var(--text-primary)"/>
				<path class="sweat-drop" d="M33 53 C33 56 31.5 58 30 58 C28.5 58 28.5 56 30 53 C31 51 32.5 49 33 47 C33 49 33 51 33 53 Z" fill="#38bdf8"/>
				<path d="M38 59 Q42 55 46 59" stroke="var(--text-primary)" stroke-width="2.5" stroke-linecap="round" fill="none"/>
			</svg>
			<p>Dompet lagi kosong melompong...</p>
		</div>

		<div class="glass-card illustration-card">
			<svg class="anxious-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="15" y="15" width="70" height="50" rx="8" fill="var(--bg-secondary)" stroke="var(--color-accent)" stroke-width="4"/>
				<rect x="20" y="20" width="60" height="40" rx="4" fill="#0d0e15"/>
				<path d="M40 65 L35 80 L65 80 L60 65 Z" fill="var(--bg-secondary)" stroke="var(--color-accent)" stroke-width="4"/>
				<path d="M35 36 L43 39 M65 36 L57 39" stroke="var(--text-primary)" stroke-width="3" stroke-linecap="round"/>
				<circle cx="38" cy="44" r="3" fill="var(--text-primary)"/>
				<circle cx="62" cy="44" r="3" fill="var(--text-primary)"/>
				<path class="sweat-drop" d="M72 32 C72 35 70 37 68 37 C66 37 66 35 68 32 C69 30 71 28 72 26 C72 28 72 30 72 32 Z" fill="#38bdf8"/>
				<path d="M44 51 Q48 48 52 51 T60 51" stroke="var(--text-primary)" stroke-width="3" stroke-linecap="round" fill="none"/>
			</svg>
			<p>Server production mati, fr fr...</p>
		</div>
	</section>

	<!-- Floating Particles -->
	<FloatingEmoji emojis={floatingEmojis} />
</main>

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
		transition: background-color 0.2s, color 0.2s;
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
	}

	.detail-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 1.5rem;
	}

	.badge-row {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.tag-badge {
		font-size: 0.75rem;
		font-weight: 600;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border-color);
		padding: 0.2rem 0.6rem;
		border-radius: 0.5rem;
		color: var(--text-secondary);
	}

	.status-badge {
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.2rem 0.6rem;
		border-radius: 0.5rem;
		background: rgba(16, 185, 129, 0.1);
		color: var(--color-success);
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

	/* Step List */
	.step-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.step-item {
		display: flex;
		align-items: flex-start;
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
	}

	/* Illustrations Grid */
	.fun-illustrations {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
	}

	.illustration-card {
		text-align: center;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.illustration-card p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		font-style: italic;
	}

	.illustration-card:hover .anxious-icon {
		animation: shake 0.4s infinite alternate;
	}

	.sweat-drop {
		animation: drip 1.8s infinite ease-in;
		transform-origin: center;
	}

	@keyframes pulse {
		0% { transform: scale(1); }
		100% { transform: scale(1.15); }
	}

	@keyframes shake {
		0% { transform: translate(1px, 1px) rotate(0deg); }
		10% { transform: translate(-1px, -2px) rotate(-1deg); }
		20% { transform: translate(-3px, 0px) rotate(1deg); }
		30% { transform: translate(0px, 2px) rotate(0deg); }
		40% { transform: translate(1px, -1px) rotate(1deg); }
		50% { transform: translate(-1px, 2px) rotate(-1deg); }
		60% { transform: translate(-3px, 1px) rotate(0deg); }
		70% { transform: translate(2px, 1px) rotate(-1deg); }
		80% { transform: translate(-1px, -1px) rotate(1deg); }
		90% { transform: translate(2px, 2px) rotate(0deg); }
		100% { transform: translate(1px, -2px) rotate(-1deg); }
	}

	@keyframes drip {
		0% { transform: translateY(-4px); opacity: 0; }
		20% { opacity: 1; }
		80% { opacity: 0.8; }
		100% { transform: translateY(12px); opacity: 0; }
	}

	@media (min-width: 48rem) {
		.fun-illustrations {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
