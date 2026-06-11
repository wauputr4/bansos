<script lang="ts">
	import { bansosList } from '$lib/data/bansos';

	let floatingEmojis = $state<{ id: number; x: number; y: number; text: string }[]>([]);

	function spawnEmoji(e: MouseEvent, text: string) {
		const emoji = {
			id: Math.random(),
			x: e.clientX,
			y: e.clientY,
			text
		};
		floatingEmojis = [...floatingEmojis, emoji];
		setTimeout(() => {
			floatingEmojis = floatingEmojis.filter((i) => i.id !== emoji.id);
		}, 1000);
	}

	// SEO metadata
	const metaTitle = 'Bansos Dev - Bantuan Sosial untuk Developer Jelata';
	const metaDescription = 'Kumpulan promo gratisan, diskon, dan bantuan sosial (bansos) khusus untuk developer jelata di Indonesia. Domain gratis, cloud gratis, no credit card! fr fr 🚀';
	const siteUrl = 'https://bansos.dev';
	const highlightedBansos = bansosList.slice(-3).reverse();
</script>

<svelte:head>
	<title>{metaTitle}</title>
	<meta name="title" content={metaTitle} />
	<meta name="description" content={metaDescription} />
	<meta name="keywords" content="bansos dev, bantuan sosial developer, domain gratis, name.com gratis, devweek26, developer jelata, promo developer, cloud gratis, coding gratisan" />
	
	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={metaTitle} />
	<meta property="og:description" content={metaDescription} />

	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={siteUrl} />
	<meta property="twitter:title" content={metaTitle} />
	<meta property="twitter:description" content={metaDescription} />
</svelte:head>

<main class="page-wrapper">
	<div class="glow-orb main-glow"></div>
	
	<!-- Header Section -->
	<header class="hero-section container">
		<div class="badge-container">
			<span class="version-badge">v2026.06.11-beta</span>
			<a href="https://github.com/wauputr4/bansos" target="_blank" rel="noopener noreferrer" class="github-badge">
				<svg class="icon" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
				</svg>
				<span>Open Source</span>
			</a>
		</div>
		
		<h1 class="main-title text-gradient text-balance" onclick={(e) => spawnEmoji(e, '😭')} style="cursor: pointer; user-select: none;">
			bansos.dev
		</h1>
		<p class="tagline text-gradient">"Bantuan sosial untuk developer jelata"</p>
		
		<!-- Anxious Sweating Computer SVG -->
		<div class="anxious-container">
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
		</div>

		<p class="intro-text text-pretty">
			Tempat ngumpulnya info bagi-bagi berkah, promo gratisan, dan diskonan tools coding paling legit. 
			Dibuat khusus untuk kita-kita yang butuh portofolio menyala tapi dompet lagi sekarat. 
			<strong>100% Gratisan, No Clickbait, No Ribet.</strong>
		</p>

		<!-- Highlight Bansos Terbaru -->
		<div class="highlight-container">
			{#each highlightedBansos as item, index (item.id)}
				<a href="/list/{item.id}" class="highlight-card glass-card" onclick={(e) => spawnEmoji(e, '💸')}>
					<div class="highlight-header">
						<span class="highlight-tag">
							{index === 0 ? '🔥 BANSOS TERBARU' : '✨ BANSOS PILIHAN'}
						</span>
					</div>
					<h3 class="highlight-title">{item.title}</h3>
					<p class="highlight-provider">{item.provider} · {item.validity}</p>
					<span class="highlight-cta">Lihat Cara Klaim Selengkapnya →</span>
				</a>
			{/each}
		</div>

		<!-- Large Glowing CTA -->
		<div class="cta-container">
			<a href="/list" class="btn-primary main-cta" onclick={(e) => spawnEmoji(e, '💸')}>
				Lihat Semua List Bansos 🔎
			</a>
		</div>
	</header>

	<!-- Quotes Section -->
	<section class="quotes-section container">
		<div class="glass-card quote-card" onclick={(e) => spawnEmoji(e, '💸')}>
			<span class="quote-mark">“</span>
			<blockquote class="main-quote text-gradient">
				Developer butuh dollar!
			</blockquote>
			<cite class="quote-author">— Suara Hati Dev Jelata</cite>
			<p class="quote-sub">Kerja rodi fix bug seharian, dibayarnya pake ucapan terima kasih dan 'exposure'. Kami butuh dollar riil buat bayar internet sama kopi, bos! 💸</p>
		</div>
	</section>

	<!-- Contribution & GitHub Section -->
	<section class="github-section container">
		<div class="glass-card github-card">
			<h2>🤝 Proyek Ini Open Source!</h2>
			<p class="text-pretty">
				Punya info bansos developer lainnya? Domain gratis, hosting free-tier, API credits gratisan, atau program bagi-bagi cloud? 
				Jangan dipendam sendiri, abangku! Kirim Pull Request dan bantu sesama developer jelata bertahan hidup.
			</p>
			<div class="github-actions">
				<a href="https://github.com/wauputr4/bansos" target="_blank" rel="noopener noreferrer" class="btn-secondary">
					<svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
					</svg>
					Kontribusi di GitHub
				</a>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="footer container">
		<p>© 2026 <a href="/">bansos.dev</a>. Dipersembahkan dengan ❤️ oleh developer jelata untuk developer jelata.</p>
	</footer>

	<!-- Floating Emojis -->
	{#each floatingEmojis as emoji (emoji.id)}
		<span class="floating-emoji" style="left: {emoji.x}px; top: {emoji.y}px;">
			{emoji.text}
		</span>
	{/each}
</main>

<style>
	.page-wrapper {
		position: relative;
		padding-block: 4rem;
		display: flex;
		flex-direction: column;
		gap: 5rem;
		z-index: 1;
	}

	.glow-orb {
		position: absolute;
		width: 40rem;
		height: 40rem;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
		pointer-events: none;
		z-index: -1;
	}

	.main-glow {
		top: -10rem;
		left: 50%;
		transform: translateX(-50%);
	}

	.hero-section {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.badge-container {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.version-badge {
		font-size: 0.75rem;
		font-weight: 600;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border-color);
		padding: 0.25rem 0.75rem;
		border-radius: 2rem;
		color: var(--text-secondary);
	}

	.github-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.75rem;
		font-weight: 600;
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 2rem;
		color: var(--color-accent) !important;
	}

	.github-badge:hover {
		background: rgba(16, 185, 129, 0.15);
	}

	.github-badge .icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	.main-title {
		font-size: var(--font-size-h1);
		font-weight: 800;
		letter-spacing: -0.05em;
		line-height: 1.1;
		margin: 0;
	}

	.tagline {
		font-size: var(--font-size-h3);
		font-weight: 600;
		letter-spacing: -0.01em;
		margin: 0;
		opacity: 0.95;
	}

	.intro-text {
		max-width: 42rem;
		color: var(--text-secondary);
		margin-top: 0.5rem;
	}

	/* Highlight Card Home */
	.highlight-container {
		width: 100%;
		max-width: 58rem;
		margin-block: 1.5rem;
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.highlight-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		text-align: left;
		padding: 1.5rem;
		border: 1px dashed var(--color-accent);
		transition: border-style 0.2s, transform 0.2s;
	}

	.highlight-card:hover {
		border-style: solid;
		transform: scale(1.02);
	}

	.highlight-tag {
		font-size: 0.75rem;
		font-weight: 800;
		background: rgba(16, 185, 129, 0.15);
		color: var(--color-accent);
		padding: 0.25rem 0.5rem;
		border-radius: 0.35rem;
		letter-spacing: 0.05em;
		width: fit-content;
	}

	.highlight-title {
		font-size: 1.15rem;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1.4;
	}

	.highlight-provider {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-muted);
		line-height: 1.5;
	}

	.highlight-cta {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-accent);
	}

	.cta-container {
		margin-top: 0.5rem;
	}

	.main-cta {
		font-size: 1.25rem;
		padding: 1rem 2.5rem;
		border-radius: 1rem;
		box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
	}

	.main-title:hover {
		animation: wobble-text 0.6s ease-in-out;
	}

	@keyframes wobble-text {
		0%, 100% { transform: scale(1) rotate(0); }
		15% { transform: scale(1.08) rotate(-2deg); }
		30% { transform: scale(1.08) rotate(2deg); }
		45% { transform: scale(1.04) rotate(-1deg); }
		60% { transform: scale(1.04) rotate(1deg); }
	}

	.anxious-container {
		display: flex;
		justify-content: center;
		margin-block: 1rem;
	}

	.anxious-icon {
		width: 5rem;
		height: 5rem;
		transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
	}

	.anxious-icon:hover {
		animation: shake 0.4s infinite alternate;
		cursor: help;
	}

	.sweat-drop {
		animation: drip 1.8s infinite ease-in;
		transform-origin: center;
	}

	@keyframes drip {
		0% { transform: translateY(-4px); opacity: 0; }
		20% { opacity: 1; }
		80% { opacity: 0.8; }
		100% { transform: translateY(12px); opacity: 0; }
	}

	.floating-emoji {
		position: fixed;
		pointer-events: none;
		z-index: 9999;
		font-size: 2.5rem;
		animation: float-up-fade 0.8s forwards cubic-bezier(0.1, 0.8, 0.3, 1);
		transform: translate(-50%, -50%);
	}

	@keyframes float-up-fade {
		0% {
			transform: translate(-50%, -50%) scale(0.6) rotate(0deg);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -50%) scale(1.4) translateY(-100px) rotate(15deg);
			opacity: 0;
		}
	}

	.quotes-section {
		display: flex;
		justify-content: center;
	}

	.quote-card {
		width: 100%;
		text-align: center;
		padding: 3rem 2rem;
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		cursor: pointer;
	}

	.quote-mark {
		font-size: 6rem;
		line-height: 1;
		font-family: serif;
		color: var(--color-accent);
		opacity: 0.15;
		position: absolute;
		top: -0.5rem;
		left: 2rem;
	}

	.main-quote {
		font-size: clamp(1.75rem, 1.2rem + 2vw, 2.75rem);
		font-weight: 800;
		line-height: 1.2;
		font-style: italic;
		letter-spacing: -0.02em;
	}

	.quote-author {
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-primary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.quote-sub {
		max-width: 38rem;
		font-size: 0.95rem;
		color: var(--text-secondary);
	}

	.github-card {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
		border-color: rgba(16, 185, 129, 0.2);
		background: radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.04) 0%, var(--glass-bg) 100%);
	}

	.github-card h2 {
		font-size: var(--font-size-h3);
		font-weight: 700;
	}

	.github-card p {
		max-width: 40rem;
		color: var(--text-secondary);
	}

	.github-actions {
		display: flex;
		gap: 1rem;
	}

	.btn-icon {
		width: 1.25rem;
		height: 1.25rem;
		margin-right: 0.5rem;
	}

	.footer {
		text-align: center;
		color: var(--text-muted);
		font-size: 0.85rem;
		border-top: 1px solid var(--border-color);
		padding-top: 2rem;
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

	@media (min-width: 48rem) {
		.highlight-container {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 64rem) {
		.highlight-container:has(.highlight-card:nth-child(3)) {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}
</style>
