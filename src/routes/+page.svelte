<script lang="ts">
	import { onMount } from 'svelte';
	import { t } from '$lib/i18n';
	import { resolve } from '$app/paths';
	import BansosHighlights from '$lib/components/BansosHighlights.svelte';
	import {
		bansosList,
		latestBansos,
		featuredBansos,
		getCommitContributorStats,
		getContributorStats,
		formatNumber
	} from '$lib/data/bansos';

	type GithubContributor = {
		login: string;
		avatar_url: string;
		html_url: string;
		contributions: number;
	};

	const repo = 'wauputr4/bansos';
	const repoUrl = `https://gitlab.com/${repo}`;
	const gitlabOwner = {
		login: 'wauputr4',
		avatarUrl:
			'https://secure.gravatar.com/avatar/75568dc4829eea5b99d420799b54b4f848f5f6ebc02470e22ad138e0f1083832?s=80&d=identicon',
		url: 'https://gitlab.com/wauputr4'
	};

	// SEO metadata
	const metaTitle = 'Bansos Developer & AI - Bantuan Sosial untuk Programmer Jelata';
	const metaDescription =
		'Kumpulan promo gratisan, diskon, credit API AI gratis, dan bantuan sosial (bansos) khusus untuk developer dan programmer di Indonesia. Domain gratis, cloud server, credit AI, no credit card! fr fr 🚀';
	const siteUrl = 'https://bansos.dev/';
	const websiteSchema = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Bansos Developer',
		url: 'https://bansos.dev/',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: 'https://bansos.dev/list/?q={search_term_string}'
			},
			'query-input': 'required name=search_term_string'
		}
	});
	const latestBansosList = latestBansos(10);
	const featuredBansosList = featuredBansos(10);
	const totalBansos = bansosList.length;
	const activeBansos = bansosList.filter((item) => item.status === 'active').length;
	const upcomingBansos = bansosList.filter((item) => item.status === 'upcoming').length;
	const expiredBansos = bansosList.filter((item) => item.status === 'expired').length;
	const commitContributors = getCommitContributorStats().filter(
		(c) => c.login !== 'github-actions[bot]'
	);
	// Gabungin dengan kontributor dari bansos.json (entry contributor field)
	const entryContributors = getContributorStats();
	const combinedLogins: Record<string, boolean> = {};
	for (const c of commitContributors) {
		combinedLogins[c.login.toLowerCase()] = true;
	}
	for (const ec of entryContributors) {
		const githubMatch = ec.url.match(new RegExp('^https://github.com/([^/?#]+)'));
		if (githubMatch) {
			const ghLogin = githubMatch[1].toLowerCase();
			if (!combinedLogins[ghLogin]) {
				combinedLogins[ghLogin] = true;
				commitContributors.push({
					login: ghLogin,
					name: ec.name,
					avatarUrl: `https://github.com/${ghLogin}.png?size=96`,
					commitUrl: `https://github.com/${ghLogin}`,
					count: ec.count
				});
			}
		}
	}
	let githubStars: number | string = $state('-');
	let githubPrs: number | string = $state('-');
	let githubContributors: GithubContributor[] = $state([]);
	let popularityData: Record<string, number> = $state({});
	let discussionStats: Record<string, { comments: number; reactions: number }> = $state({});

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
			.catch((err) => {
				console.error('Failed to fetch popularity data:', err);
			});

		fetch('/api/discussion-stats')
			.then((res) => (res.ok ? res.json() : {}))
			.then((data) => {
				discussionStats = data;
			})
			.catch((err) => {
				console.error('Failed to fetch discussion stats:', err);
			});
	});

	let mouseX = $state(0);
	let mouseY = $state(0);
	let isHovered = $state(false);
	let containerEl = $state<HTMLElement | null>(null);

	function handleMouseMove(event: MouseEvent) {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		const dx = event.clientX - centerX;
		const dy = event.clientY - centerY;

		// Magnetic factor: follow cursor but damp it
		const pullStrength = 0.35;
		mouseX = dx * pullStrength;
		mouseY = dy * pullStrength;

		// Cap the translation
		const maxDist = 45; // Max translation offset
		const currentDist = Math.hypot(mouseX, mouseY);
		if (currentDist > maxDist) {
			const angle = Math.atan2(mouseY, mouseX);
			mouseX = Math.cos(angle) * maxDist;
			mouseY = Math.sin(angle) * maxDist;
		}
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
		mouseX = 0;
		mouseY = 0;
	}
</script>

<svelte:head>
	<title>{$t('meta.homeTitle')}</title>
	<meta name="title" content={$t('meta.homeTitle')} />
	<meta name="description" content={$t('meta.homeDesc')} />
	<meta name="keywords" content={$t('meta.homeKeywords')} />
	<link rel="canonical" href={siteUrl} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={siteUrl} />
	<meta property="og:title" content={$t('meta.homeTitle')} />
	<meta property="og:description" content={$t('meta.homeDesc')} />
	<meta property="og:image" content="{siteUrl}og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content={siteUrl} />
	<meta name="twitter:title" content={$t('meta.homeTitle')} />
	<meta name="twitter:description" content={$t('meta.homeDesc')} />
	<meta name="twitter:image" content="{siteUrl}og.png" />

	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' + websiteSchema + '</' + 'script>'}
</svelte:head>

<main class="page-wrapper">
	<div class="glow-orb main-glow"></div>

	<!-- Header Section -->
	<header class="hero-section container">
		<div class="badge-container">
			<span class="version-badge">{__BUILD_DATE__}</span>
			<a
				href="https://gitlab.com/wauputr4/bansos"
				target="_blank"
				rel="noopener noreferrer"
				class="github-badge"
			>
				<svg class="icon" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
					/>
				</svg>
				<span>{$t('badge.opensource')}</span>
			</a>
			<a
				href="https://discord.gg/m4WFaQpNGs"
				target="_blank"
				rel="noopener noreferrer"
				class="discord-badge"
			>
				<svg class="icon" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"
					/>
				</svg>
				<span>{$t('badge.discord')}</span>
			</a>
			<a
				href="https://t.me/bansos_dev"
				target="_blank"
				rel="noopener noreferrer"
				class="telegram-badge"
			>
				<svg class="icon" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.61l-1.92 9.06c-.14.63-.52.79-1.04.5l-2.93-2.16-1.41 1.36c-.16.16-.29.29-.6.29l.21-3.01 5.48-4.95c.24-.22-.05-.34-.37-.13l-6.78 4.27-2.92-.91c-.63-.2-.65-.63.13-.94l11.41-4.4c.53-.19 1 .13.83.99z"
					/>
				</svg>
				<span>{$t('badge.telegram')}</span>
			</a>
		</div>

		<h1 class="main-title text-balance">
			<span class="title-ban">Ban</span><span class="title-sos">sos</span>
			<span class="title-dev">Developer</span>
		</h1>
		<p class="tagline text-gradient">{$t('home.heroTagline')}</p>
		<p class="community-tagline text-pretty">{$t('home.heroCommunity')}</p>

		<!-- Interactive Heart Code Logo -->
		<div
			bind:this={containerEl}
			class="logo-hero-wrapper"
			onmousemove={handleMouseMove}
			onmouseleave={handleMouseLeave}
			role="presentation"
			aria-hidden="true"
		>
			<div class="logo-hero-translate" style:transform="translate({mouseX}px, {mouseY}px)">
				<div class="logo-hero-rotate" class:spinning={isHovered}>
					<svg
						class="logo-hero-icon"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<!-- Left bracket < -->
						<path class="bracket-path" d="M 6.5 7.5 L 2.5 12 L 6.5 16.5" />
						<!-- Right bracket > -->
						<path class="bracket-path" d="M 17.5 7.5 L 21.5 12 L 17.5 16.5" />
						<!-- Green Heart -->
						<path
							class="heart-path"
							d="M12 18.2C10.7 17 6.5 13.2 6.5 9.7C6.5 7.1 8.3 5.3 10.8 5.3C12.3 5.3 13.2 6.1 13.8 7C14.4 6.1 15.3 5.3 16.8 5.3C19.3 5.3 21.1 7.1 21.1 9.7C21.1 13.2 16.9 17 15.6 18.2L13.8 19.8Z"
							transform="translate(4.41, 5.0975) scale(0.55)"
						/>
					</svg>
				</div>
			</div>
		</div>

		<p class="intro-text text-pretty">
			{$t('home.heroIntro')}
			<strong>{$t('home.heroIntroStrong')}</strong>
		</p>

		<div class="stats-strip" aria-label={$t('home.statsAria')}>
			<div class="stat-item">
				<span class="stat-value">{totalBansos}</span>
				<span class="stat-label">{$t('home.statTotal')}</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{activeBansos}</span>
				<span class="stat-label">{$t('home.statActive')}</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{upcomingBansos}</span>
				<span class="stat-label">{$t('home.statUpcoming')}</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{expiredBansos}</span>
				<span class="stat-label">{$t('home.statExpired')}</span>
			</div>
		</div>

		<!-- Bansos Sections -->
		<div class="bansos-sections">
			{#if featuredBansosList.length > 0}
				<BansosHighlights
					items={featuredBansosList}
					title={$t('home.sectionFeatured')}
					icon="fa-solid fa-fire"
					{popularityData}
					{discussionStats}
				/>
			{/if}
			{#if latestBansosList.length > 0}
				<BansosHighlights
					items={latestBansosList}
					title={$t('home.sectionLatest')}
					icon="fa-solid fa-bolt"
					{popularityData}
					{discussionStats}
				/>
			{/if}
		</div>

		<!-- Large Glowing CTA -->
		<div class="cta-container">
			<a href={resolve('/list')} class="btn-primary main-cta">
				<i class="fa-solid fa-magnifying-glass"></i>
				{$t('home.ctaViewAll')}
			</a>
		</div>
	</header>

	<!-- Kelebihan Section -->
	<section class="advantages-section container">
		<h2 class="advantages-title text-gradient">{$t('home.advantagesTitle')}</h2>
		<div class="advantages-grid">
			<div class="glass-card advantage-card">
				<div class="advantage-icon"><i class="fa-solid fa-bolt"></i></div>
				<h3>{$t('home.adv.curatedTitle')}</h3>
				<p>{$t('home.adv.curatedDesc')}</p>
			</div>
			<div class="glass-card advantage-card">
				<div class="advantage-icon"><i class="fa-solid fa-eye"></i></div>
				<h3>{$t('home.adv.transparentTitle')}</h3>
				<p>{$t('home.adv.transparentDesc')}</p>
			</div>
			<div class="glass-card advantage-card">
				<div class="advantage-icon"><i class="fa-solid fa-code"></i></div>
				<h3>{$t('home.adv.opensourceTitle')}</h3>
				<p>{$t('home.adv.opensourceDesc')}</p>
			</div>
			<div class="glass-card advantage-card">
				<div class="advantage-icon"><i class="fa-solid fa-users"></i></div>
				<h3>{$t('home.adv.communityTitle')}</h3>
				<p>{$t('home.adv.communityDesc')}</p>
			</div>
			<div class="glass-card advantage-card">
				<div class="advantage-icon"><i class="fa-solid fa-gift"></i></div>
				<h3>{$t('home.adv.referralTitle')}</h3>
				<p>{$t('home.adv.referralDesc')}</p>
			</div>
			<div class="glass-card advantage-card">
				<div class="advantage-icon"><i class="fa-solid fa-scale-balanced"></i></div>
				<h3>{$t('home.adv.fairTitle')}</h3>
				<p>{$t('home.adv.fairDesc')}</p>
			</div>
		</div>

		<div class="glass-card disclaimer-card">
			<div class="disclaimer-icon"><i class="fa-solid fa-shield-halved"></i></div>
			<div class="disclaimer-copy">
				<h3>{$t('home.disclaimerTitle')}</h3>
				<p>{$t('home.disclaimerText')}</p>
			</div>
		</div>
	</section>

	<!-- Contribution & GitHub Section -->
	<section class="github-section container">
		<div class="glass-card github-card">
			<h2><i class="fa-solid fa-handshake"></i> {$t('home.ossTitle')}</h2>
			<p class="text-pretty">{$t('home.ossDesc')}</p>
			<div class="repo-live-panel" aria-label={$t('home.statsAria')}>
				<div class="commit-contributor-panel">
					<span class="repo-panel-label">{$t('home.ossContribLabel')}</span>
					<div class="contributors-stack" aria-label={$t('home.ossContribStackAria')}>
						{#each commitContributors as contributor (contributor.login)}
							<a
								href={contributor.login === gitlabOwner.login
									? gitlabOwner.url
									: `https://github.com/${contributor.login}`}
								target="_blank"
								rel="noopener noreferrer"
								class="contributor-avatar"
								aria-label={$t('home.ossContribAria', {
									login: contributor.login,
									count: contributor.count
								})}
							>
								<img
									src={contributor.login === gitlabOwner.login
										? gitlabOwner.avatarUrl
										: contributor.avatarUrl}
									alt={contributor.login}
									loading="lazy"
								/>
							</a>
						{/each}
					</div>
				</div>
				<div class="repo-live-stats">
					<a href={repoUrl} target="_blank" rel="noopener noreferrer" class="repo-stat">
						<i class="fa-solid fa-star" aria-hidden="true"></i>
						<span>{formatNumber(githubStars)}</span>
						{$t('home.ossStarsLabel')}
					</a>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={`${repoUrl}/pulls`} target="_blank" rel="noopener noreferrer" class="repo-stat">
						<i class="fa-solid fa-code-pull-request" aria-hidden="true"></i>
						<span>{formatNumber(githubPrs)}</span>
						{$t('home.ossPrLabel')}
					</a>
				</div>
			</div>
			<div class="github-actions">
				<a href={resolve('/contribute')} class="btn-secondary">
					<i class="fa-solid fa-code-pull-request btn-icon" aria-hidden="true"></i>
					{$t('home.ossContributeBtn')}
				</a>
				<a href={resolve('/about')} class="btn-text">
					{$t('home.ossLearnMore')}
					<i class="fa-solid fa-arrow-right btn-icon" aria-hidden="true"></i>
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
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.5rem;
		width: 100%;
	}

	@media (max-width: 48rem) {
		.badge-container {
			flex-wrap: nowrap;
			justify-content: center;
			gap: 0.5rem;
			width: 100%;
			max-width: 100%;
		}

		.version-badge {
			font-size: 0.75rem;
			padding: 0 0.65rem;
			height: 1.7rem; /* Match the 1rem icon + 0.35rem padding * 2 */
			white-space: nowrap;
			display: inline-flex;
			align-items: center;
			justify-content: center;
		}

		.github-badge,
		.discord-badge,
		.telegram-badge {
			padding: 0.35rem;
			border-radius: 50%;
			aspect-ratio: 1;
			display: inline-flex;
			justify-content: center;
			align-items: center;
		}

		.github-badge span,
		.discord-badge span,
		.telegram-badge span {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			white-space: nowrap;
			border-width: 0;
		}

		.github-badge .icon,
		.discord-badge .icon,
		.telegram-badge .icon {
			width: 1rem;
			height: 1rem;
		}
	}

	.version-badge {
		font-size: 0.75rem;
		font-weight: 600;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border-color);
		padding: 0.25rem 0.75rem;
		border-radius: 2rem;
		color: var(--text-secondary);
		display: inline-flex;
		align-items: center;
		justify-content: center;
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

	.discord-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.75rem;
		font-weight: 600;
		background: rgba(88, 101, 242, 0.1);
		border: 1px solid rgba(88, 101, 242, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 2rem;
		color: #5865f2 !important;
	}

	.discord-badge:hover {
		background: rgba(88, 101, 242, 0.15);
	}

	.discord-badge .icon {
		width: 0.875rem;
		height: 0.875rem;
	}

	.telegram-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.75rem;
		font-weight: 600;
		background: rgba(34, 158, 217, 0.1);
		border: 1px solid rgba(34, 158, 217, 0.2);
		padding: 0.25rem 0.75rem;
		border-radius: 2rem;
		color: #229ed9 !important;
	}

	.telegram-badge:hover {
		background: rgba(34, 158, 217, 0.15);
	}

	.telegram-badge .icon {
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

	.main-title .title-ban {
		color: var(--text-primary);
	}

	.main-title .title-sos {
		color: #10b981;
	}

	.main-title .title-dev {
		color: var(--text-primary);
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

	.logo-hero-wrapper {
		display: flex;
		justify-content: center;
		margin-block: 0.5rem;
		perspective: 1000px;
	}

	.logo-hero-translate {
		transition: transform 0.15s cubic-bezier(0.25, 1, 0.5, 1);
		will-change: transform;
	}

	.logo-hero-rotate {
		width: 5rem;
		height: 5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		will-change: transform;
		transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	.logo-hero-rotate.spinning {
		animation: spin-icon 2s linear infinite;
	}

	@keyframes spin-icon {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.logo-hero-icon {
		width: 100%;
		height: 100%;
		filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.15));
	}

	.logo-hero-icon .bracket-path {
		stroke: var(--text-primary);
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.logo-hero-icon .heart-path {
		fill: var(--color-accent);
	}

	@media (min-width: 48rem) {
		.stats-strip {
			grid-template-columns: repeat(4, 1fr);
		}
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
		flex-direction: row;
		gap: 1rem;
	}

	@media (max-width: 48rem) {
		.github-actions {
			flex-direction: column;
			align-items: center;
		}
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
		flex-wrap: wrap;
		justify-content: center;
		padding-left: 0.75rem;
		gap: 0;
	}

	.contributor-avatar {
		width: 2.35rem;
		height: 2.35rem;
		margin-left: -0.75rem;
		border: 2px solid var(--bg-primary);
		border-radius: 999px;
		background: color-mix(in srgb, var(--text-primary) 8%, transparent);
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
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

	.btn-text {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--text-secondary);
		font-size: 0.95rem;
		font-weight: 750;
		transition: color 0.2s;
		cursor: pointer;
		text-decoration: none;
	}

	.btn-text:hover {
		color: var(--text-primary);
		text-decoration: none;
	}

	.btn-text .btn-icon {
		font-size: 0.85rem;
		margin-right: 0;
		width: auto;
		height: auto;
		display: flex;
		align-items: center;
		transform: translateY(1px);
	}

	.advantages-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		align-items: center;
		text-align: center;
	}

	.advantages-title {
		font-size: var(--font-size-h2);
		font-weight: 800;
		margin: 0;
	}

	.advantages-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		width: 100%;
	}

	@media (min-width: 48rem) {
		.advantages-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.advantage-card {
		padding: 2rem 1.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		text-align: center;
		transition:
			transform 0.2s,
			border-color 0.2s;
	}

	.advantage-card:hover {
		transform: translateY(-4px);
		border-color: var(--color-accent);
	}

	.advantage-icon {
		font-size: 2.25rem;
		color: var(--color-accent);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 50%;
		background: rgba(16, 185, 129, 0.08);
		border: 1px solid rgba(16, 185, 129, 0.15);
	}

	.advantage-card h3 {
		font-size: 1.2rem;
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
	}

	.advantage-card p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.5;
		margin: 0;
	}

	.disclaimer-card {
		display: flex;
		align-items: flex-start;
		gap: 1.25rem;
		padding: 1.5rem;
		border-left: 4px solid #ef4444;
		background: rgba(239, 68, 68, 0.04);
	}

	.disclaimer-icon {
		flex-shrink: 0;
		font-size: 1.5rem;
		color: #ef4444;
		margin-top: 0.15rem;
	}

	.disclaimer-copy h3 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
		font-weight: 800;
		color: var(--text-primary);
	}

	.disclaimer-copy p {
		font-size: 0.85rem;
		color: var(--text-secondary);
		line-height: 1.55;
		margin: 0;
	}

	@media (max-width: 48rem) {
		.disclaimer-card {
			flex-direction: column;
			gap: 0.75rem;
		}
	}
</style>
