<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import BansosCard from '$lib/components/BansosCard.svelte';
	import { getContributorInitials, sortBansosByNewest } from '$lib/data/bansos';
	import type { BansosItem, Contributor } from '$lib/data/bansos';
	import { renderProfileMarkdown } from '$lib/utils/profileMarkdown.js';

	let { data }: { data: { contributor: Contributor; bansos: BansosItem[] } } = $props();

	const { contributor, bansos } = $derived(data);

	const sortedBansos = $derived(sortBansosByNewest(bansos));

	const linkEntries = $derived(
		Object.entries(contributor.links).filter(([, url]) => url && url.trim())
	);
	const markdownHtml = $derived(
		contributor.markdown ? renderProfileMarkdown(contributor.markdown) : ''
	);
	const canonicalUrl = $derived(`https://bansos.dev/contributor/${contributor.login}/`);
	const description = $derived(
		contributor.bio ||
			`${contributor.displayName} telah membagikan ${bansos.length} program untuk komunitas developer di bansos.dev.`
	);
	const personSchema = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: contributor.displayName,
			url: canonicalUrl,
			...(contributor.avatar ? { image: contributor.avatar } : {}),
			description,
			sameAs: Object.values(contributor.links),
			knowsAbout: contributor.skills
		})
	);

	const socialIcon: Record<string, string> = {
		github: 'fa-brands fa-github',
		twitter: 'fa-brands fa-x-twitter',
		linkedin: 'fa-brands fa-linkedin',
		website: 'fa-solid fa-globe',
		telegram: 'fa-brands fa-telegram',
		npm: 'fa-brands fa-npm',
		youtube: 'fa-brands fa-youtube'
	};

	function linkLabel(platform: string, url: string) {
		if (platform !== 'github') return platform;
		return `@${url.match(/^https:\/\/github\.com\/([^/?#]+)/i)?.[1] || contributor.login}`;
	}
</script>

<svelte:head>
	<title>{contributor.displayName} — Profil & Bansos Developer</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:type" content="profile" />
	<meta property="og:title" content="{contributor.displayName} — bansos.dev" />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:site_name" content="bansos.dev" />
	<meta name="twitter:card" content={contributor.avatar ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content="{contributor.displayName} — bansos.dev" />
	<meta name="twitter:description" content={description} />
	{#if contributor.avatar}
		<meta property="og:image" content={contributor.avatar} />
		<meta name="twitter:image" content={contributor.avatar} />
	{/if}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' + personSchema + '</' + 'script>'}
</svelte:head>

<div class="contributor-page">
	<!-- Profile Header -->
	<div class="profile-header">
		<div class="avatar-container">
			{#if contributor.avatar}
				<img src={contributor.avatar} alt={contributor.displayName} class="avatar" loading="lazy" />
			{:else}
				<div class="avatar-placeholder">
					{getContributorInitials(contributor.displayName)}
				</div>
			{/if}
		</div>

		<div class="profile-info">
			<h1 class="display-name">{contributor.displayName}</h1>
			{#if contributor.title}
				<p class="title">{contributor.title}</p>
			{/if}
			{#if contributor.location}
				<p class="location">📍 {contributor.location}</p>
			{/if}
			{#if contributor.pronouns}
				<p class="pronouns">{contributor.pronouns}</p>
			{/if}
		</div>
	</div>

	<!-- Bio -->
	{#if markdownHtml}
		<div class="bio-section markdown-content">
			<!-- Repository Markdown is escaped by renderProfileMarkdown before rendering. -->
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html markdownHtml}
		</div>
	{:else if contributor.bio}
		<div class="bio-section"><p class="bio">{contributor.bio}</p></div>
	{/if}

	<!-- Social Links -->
	{#if linkEntries.length > 0}
		<div class="links-section">
			<h2><i class="fa-solid fa-link" aria-hidden="true"></i> Tautan</h2>
			<div class="links-grid">
				{#each linkEntries as [platform, url] (platform)}
					<a href={url} target="_blank" rel="me noopener noreferrer" class="link-card">
						<i class={socialIcon[platform] || 'fa-solid fa-link'} aria-hidden="true"></i>
						<span class="link-label">{linkLabel(platform, url)}</span>
					</a>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Skills -->
	{#if contributor.skills && contributor.skills.length > 0}
		<div class="skills-section">
			<h2>⚡ Keahlian</h2>
			<div class="skills-list">
				{#each contributor.skills as skill, index (`${skill}-${index}`)}
					<span class="skill-tag">{skill}</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Contributed Bansos -->
	<div class="bansos-section">
		<h2>📦 Bansos Dikontribusi ({bansos.length})</h2>
		{#if sortedBansos.length > 0}
			<div class="bansos-grid">
				{#each sortedBansos as item (item.id)}
					<BansosCard {item} />
				{/each}
			</div>
		{:else}
			<p class="empty-text">Belum ada bansos yang dikontribusi.</p>
		{/if}
	</div>
</div>

<style>
	.contributor-page {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.profile-header {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	.avatar-container {
		flex-shrink: 0;
	}

	.avatar {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		object-fit: cover;
		border: 3px solid var(--color-primary, #6366f1);
	}

	.avatar-placeholder {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary, #6366f1), #a855f7);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		font-weight: 700;
	}

	.profile-info {
		width: 100%;
	}

	.display-name {
		font-size: 1.8rem;
		font-weight: 700;
		margin: 0 0 0.25rem;
		line-height: 1.2;
	}

	.title {
		font-size: 1.1rem;
		color: var(--color-muted, #6b7280);
		margin: 0;
	}

	.location {
		font-size: 0.95rem;
		color: var(--color-muted, #6b7280);
		margin: 0.25rem 0 0;
	}

	.pronouns {
		font-size: 0.85rem;
		color: var(--color-muted-2, #9ca3af);
		margin: 0.15rem 0 0;
	}

	.bio-section {
		margin-bottom: 1.5rem;
		padding: 1rem 1.25rem;
		background: var(--bg-card, #1f2937);
		border-radius: 12px;
	}

	.bio {
		margin: 0;
		font-size: 1rem;
		line-height: 1.6;
	}

	.links-section,
	.skills-section,
	.bansos-section {
		margin-bottom: 2rem;
	}

	.links-section,
	.skills-section {
		text-align: center;
	}

	.links-section h2,
	.skills-section h2,
	.bansos-section h2 {
		font-size: 1.1rem;
		margin-bottom: 0.75rem;
		color: var(--color-heading, #f3f4f6);
	}

	.links-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}

	.link-card {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		background: var(--bg-card, #1f2937);
		border: 1px solid var(--border-color, #374151);
		text-decoration: none;
		color: var(--color-text, #e5e7eb);
		font-size: 0.9rem;
		transition: all 0.2s ease;
	}

	.link-card:hover {
		background: var(--color-primary, #6366f1);
		color: white;
		border-color: var(--color-primary, #6366f1);
	}

	.link-card i {
		font-size: 1rem;
	}

	.skills-list {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
	}

	.skill-tag {
		padding: 0.3rem 0.75rem;
		border-radius: 20px;
		background: var(--bg-card, #1f2937);
		border: 1px solid var(--border-color, #374151);
		font-size: 0.85rem;
		color: var(--color-muted, #9ca3af);
	}

	.bansos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		gap: 1rem;
	}

	.empty-text {
		color: var(--color-muted, #6b7280);
		font-style: italic;
	}

	.markdown-content :global(h2) {
		font-size: 1.1rem;
		margin: 0 0 0.75rem;
	}

	.markdown-content :global(p),
	.markdown-content :global(ul) {
		margin: 0.5rem 0;
		line-height: 1.65;
	}

	.markdown-content :global(a) {
		color: var(--color-accent);
	}

	.markdown-content :global(ul) {
		padding-left: 1.25rem;
	}
</style>
