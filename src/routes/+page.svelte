<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import BansosHighlights from '$lib/components/BansosHighlights.svelte';
	import {
		bansosList,
		latestBansos,
		featuredBansos,
		getCommitContributorStats
	} from '$lib/data/bansos';

	type GithubContributor = {
		login: string;
		avatar_url: string;
		html_url: string;
		contributions: number;
	};

	const repo = 'wauputr4/bansos';
	const repoUrl = `https://github.com/${repo}`;

	// SEO metadata
	const metaTitle = 'Bansos Developer - Bantuan Sosial untuk Developer Jelata';
	const metaDescription =
		'Kumpulan promo gratisan, diskon, dan bantuan sosial (bansos) khusus untuk developer jelata di Indonesia. Domain gratis, cloud gratis, no credit card! fr fr 🚀';
	const siteUrl = 'https://bansos.dev';
	const latestBansosList = latestBansos(10);
	const featuredBansosList = featuredBansos(10);
	const totalBansos = bansosList.length;
	const activeBansos = bansosList.filter((item) => item.status === 'active').length;
	const upcomingBansos = bansosList.filter((item) => item.status === 'upcoming').length;
	const expiredBansos = bansosList.filter((item) => item.status === 'expired').length;
	const commitContributors = getCommitContributorStats().slice(0, 8);
	let githubStars: number | string = $state('-');
	let githubPrs: number | string = $state('-');
	let githubContributors: GithubContributor[] = $state([]);
	let popularityData: Record<string, number> = $state({});
	let discussionStats: Record<string, { comments: number; reactions: number }> = $state({});

	function formatNumber(num: number | string) {
		if (typeof num !== 'number') return num;
		if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
		return num;
	}

	onMount(() => {
		const CACHE_KEY = `bansos_home_repo_v1_${repo}`;
		const cached = localStorage.getItem(CACHE_KEY);

		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				githubStars = parsed.stars ?? githubStars;
				githubPrs = parsed.prs ?? githubPrs;
				githubContributors = parsed.contributors ?? githubContributors;
			} catch {
				// Ignore stale cache.
			}
		}

		Promise.all([
			fetch(`https://api.github.com/repos/${repo}`).then((res) => (res.ok ? res.json() : null)),
			fetch(`https://api.github.com/repos/${repo}/contributors?per_page=10`).then((res) =>
				res.ok ? res.json() : null
			),
			fetch(`https://api.github.com/search/issues?q=repo:${repo}+type:pr`).then((res) =>
				res.ok ? res.json() : null
			)
		])
			.then(([repoData, contributorsData, prData]) => {
				if (repoData) githubStars = repoData.stargazers_count;
				if (Array.isArray(contributorsData)) {
					githubContributors = contributorsData.slice(0, 8);
				}
				if (prData) githubPrs = prData.total_count;

				localStorage.setItem(
					CACHE_KEY,
					JSON.stringify({
						stars: githubStars,
						prs: githubPrs,
						contributors: githubContributors
					})
				);
			})
			.catch(() => {});

		fetch('/api/popularity')
			.then((res) => (res.ok ? res.json() : {}))
			.then((data) => {
				popularityData = data;
			})
			.catch(() => {});

		fetch('/api/discussion-stats')
			.then((res) => (res.ok ? res.json() : {}))
			.then((data) => {
				discussionStats = data;
			})
			.catch(() => {});
	});
</script>

<svelte:head>
	<title>{metaTitle}</title>
	<meta name="title" content={metaTitle} />
	<meta name="description" content={metaDescription} />
	<meta
		name="keywords"
		content="bansos dev, bantuan sosial developer, domain gratis, name.com gratis, devweek26, developer jelata, promo developer, cloud gratis, coding gratisan"
	/>

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
			<span class="version-badge">{__BUILD_DATE__}</span>
			<a
				href="https://github.com/wauputr4/bansos"
				target="_blank"
				rel="noopener noreferrer"
				class="github-badge"
			>
				<svg class="icon" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
					/>
				</svg>
				<span>Open Source</span>
			</a>
		</div>

		<h1 class="main-title text-gradient text-balance">Bansos Developer</h1>
		<p class="tagline text-gradient">"Bantuan sosial untuk developer jelata"</p>
		<p class="community-tagline text-pretty">
			Gotong Royong dalam bantuin developer jelata lainnya untuk glow up pada projectnya
		</p>

		<!-- Anxious Sweating Computer SVG -->
		<div class="anxious-container">
			<svg
				class="anxious-icon"
				viewBox="0 0 100 100"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect
					x="15"
					y="15"
					width="70"
					height="50"
					rx="8"
					fill="var(--bg-secondary)"
					stroke="var(--color-accent)"
					stroke-width="4"
				/>
				<rect x="20" y="20" width="60" height="40" rx="4" fill="var(--bg-primary)" />
				<path
					d="M40 65 L35 80 L65 80 L60 65 Z"
					fill="var(--bg-secondary)"
					stroke="var(--color-accent)"
					stroke-width="4"
				/>
				<path
					d="M35 36 L43 39 M65 36 L57 39"
					stroke="var(--text-primary)"
					stroke-width="3"
					stroke-linecap="round"
				/>
				<circle cx="38" cy="44" r="3" fill="var(--text-primary)" />
				<circle cx="62" cy="44" r="3" fill="var(--text-primary)" />
				<path
					class="sweat-drop"
					d="M72 32 C72 35 70 37 68 37 C66 37 66 35 68 32 C69 30 71 28 72 26 C72 28 72 30 72 32 Z"
					fill="#38bdf8"
				/>
				<path
					d="M44 51 Q48 48 52 51 T60 51"
					stroke="var(--text-primary)"
					stroke-width="3"
					stroke-linecap="round"
					fill="none"
				/>
			</svg>
		</div>

		<p class="intro-text text-pretty">
			Tempat ngumpulnya info bagi-bagi berkah, promo gratisan, dan diskonan tools coding paling
			legit. Dibuat khusus untuk kita-kita yang butuh portofolio menyala tapi dompet lagi sekarat.
			<strong>100% Gratisan, No Clickbait, No Ribet.</strong>
		</p>

		<div class="stats-strip" aria-label="Statistik bansos.dev">
			<div class="stat-item">
				<span class="stat-value">{totalBansos}</span>
				<span class="stat-label">Total bansos</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{activeBansos}</span>
				<span class="stat-label">Masih aktif</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{upcomingBansos}</span>
				<span class="stat-label">Akan datang</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{expiredBansos}</span>
				<span class="stat-label">Arsip expired</span>
			</div>
		</div>

		<!-- Bansos Sections -->
		<div class="bansos-sections">
			{#if featuredBansosList.length > 0}
				<BansosHighlights
					items={featuredBansosList}
					title="Rekomendasi Utama"
					icon="fa-solid fa-fire"
					{popularityData}
					{discussionStats}
				/>
			{/if}
			{#if latestBansosList.length > 0}
				<BansosHighlights
					items={latestBansosList}
					title="Bansos Terbaru"
					icon="fa-solid fa-bolt"
					{popularityData}
					{discussionStats}
				/>
			{/if}
		</div>

		<!-- Large Glowing CTA -->
		<div class="cta-container">
			<a href={resolve('/list')} class="btn-primary main-cta">
				<i class="fa-solid fa-magnifying-glass"></i> Lihat Semua Bansos
			</a>
		</div>
	</header>

	<!-- Quotes Section -->
	<section class="quotes-section container">
		<div class="glass-card quote-card">
			<span class="quote-mark">“</span>
			<blockquote class="main-quote text-gradient">Developer butuh dollar!</blockquote>
			<cite class="quote-author">— Suara Hati Dev Jelata</cite>
			<p class="quote-sub">
				Kerja rodi fix bug seharian, dibayarnya pake ucapan terima kasih dan 'exposure'. Kami butuh
				dollar riil buat bayar internet sama kopi, bos! 💸
			</p>
		</div>
	</section>

	<!-- Contribution & GitHub Section -->
	<section class="github-section container">
		<div class="glass-card github-card">
			<h2><i class="fa-solid fa-handshake"></i> Proyek Ini Open Source!</h2>
			<p class="text-pretty">
				Punya info bansos developer lainnya? Domain gratis, hosting free-tier, API credits gratisan,
				atau program bagi-bagi cloud? Jangan dipendam sendiri, abangku! Kirim Pull Request dan bantu
				sesama developer jelata bertahan hidup.
			</p>
			<div class="repo-live-panel" aria-label="Statistik repository GitHub bansos.dev">
				<div class="commit-contributor-panel">
					<span class="repo-panel-label">Commit kontributor</span>
					<div class="contributors-stack" aria-label="Commit kontributor bansos data">
						{#each commitContributors as contributor (contributor.login)}
							<a
								href={`https://github.com/${contributor.login}`}
								target="_blank"
								rel="noopener noreferrer"
								class="contributor-avatar"
								aria-label={`${contributor.login}, ${contributor.count} commit kontribusi`}
							>
								<img src={contributor.avatarUrl} alt={contributor.login} loading="lazy" />
							</a>
						{/each}
					</div>
				</div>
				<div class="repo-live-stats">
					<a href={repoUrl} target="_blank" rel="noopener noreferrer" class="repo-stat">
						<i class="fa-solid fa-star" aria-hidden="true"></i>
						<span>{formatNumber(githubStars)}</span>
						Stars
					</a>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={`${repoUrl}/pulls`} target="_blank" rel="noopener noreferrer" class="repo-stat">
						<i class="fa-solid fa-code-pull-request" aria-hidden="true"></i>
						<span>{formatNumber(githubPrs)}</span>
						PR
					</a>
				</div>
			</div>
			<div class="github-actions">
				<a href={resolve('/contribute')} class="btn-secondary">
					<i class="fa-solid fa-code-pull-request btn-icon" aria-hidden="true"></i>
					Kontribusi
				</a>
			</div>
		</div>
	</section>
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

	.bansos-sections {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
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

	.community-tagline {
		max-width: 36rem;
		color: var(--text-secondary);
		font-size: clamp(0.95rem, 0.9rem + 0.25vw, 1.1rem);
		font-weight: 650;
		line-height: 1.6;
		margin: -0.5rem 0 0;
	}

	.intro-text {
		max-width: 42rem;
		color: var(--text-secondary);
		margin-top: 0.5rem;
	}

	.stats-strip {
		width: min(100%, 42rem);
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		margin-top: 0.25rem;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		padding: 0.8rem 0.75rem;
	}

	.stat-value {
		color: var(--color-accent);
		font-size: clamp(1.45rem, 4vw, 2rem);
		font-weight: 850;
		line-height: 1;
	}

	.stat-label {
		color: var(--text-secondary);
		font-size: 0.78rem;
		font-weight: 750;
	}

	.cta-container {
		margin-top: 0.5rem;
	}

	.main-cta {
		font-size: 1.25rem;
		padding: 1rem 2.5rem;
		border-radius: 1rem;
		box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35);
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.main-title:hover {
		animation: wobble-text 0.6s ease-in-out;
	}

	@keyframes wobble-text {
		0%,
		100% {
			transform: scale(1) rotate(0);
		}
		15% {
			transform: scale(1.08) rotate(-2deg);
		}
		30% {
			transform: scale(1.08) rotate(2deg);
		}
		45% {
			transform: scale(1.04) rotate(-1deg);
		}
		60% {
			transform: scale(1.04) rotate(1deg);
		}
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
		.stats-strip {
			grid-template-columns: repeat(4, 1fr);
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
		background: radial-gradient(
			circle at 50% 50%,
			rgba(16, 185, 129, 0.04) 0%,
			var(--glass-bg) 100%
		);
	}

	.github-card h2 {
		font-size: var(--font-size-h3);
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.github-card h2 i {
		color: var(--color-accent);
	}

	.github-card p {
		max-width: 40rem;
		color: var(--text-secondary);
	}

	.github-actions {
		display: flex;
		gap: 1rem;
	}

	.repo-live-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.85rem;
	}

	.commit-contributor-panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
	}

	.repo-panel-label {
		color: var(--text-muted);
		font-size: 0.75rem;
		font-weight: 850;
		text-transform: uppercase;
	}

	.contributors-stack {
		display: flex;
		justify-content: center;
		padding-left: 0.75rem;
	}

	.contributor-avatar {
		width: 2.35rem;
		height: 2.35rem;
		margin-left: -0.75rem;
		border: 2px solid var(--bg-primary);
		border-radius: 999px;
		background: color-mix(in srgb, var(--text-primary) 8%, transparent);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
	}

	.contributor-avatar {
		overflow: hidden;
		transition:
			transform 0.2s ease,
			border-color 0.2s ease;
	}

	.contributor-avatar:hover {
		transform: translateY(-2px);
		border-color: rgba(16, 185, 129, 0.8);
	}

	.contributor-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.repo-live-stats {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.65rem;
	}

	.repo-stat {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid var(--border-color);
		border-radius: 999px;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		color: var(--text-secondary);
		padding: 0.4rem 0.75rem;
		font-size: 0.85rem;
		font-weight: 750;
	}

	.repo-stat:hover {
		color: var(--text-primary);
		background: color-mix(in srgb, var(--text-primary) 8%, transparent);
	}

	.repo-stat i,
	.repo-stat span {
		color: var(--color-accent);
	}

	.btn-icon {
		width: 1.25rem;
		height: 1.25rem;
		margin-right: 0.5rem;
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
</style>
