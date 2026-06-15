<script lang="ts">
	import { onMount } from 'svelte';

	let { repo = 'wauputr4/bansos' }: { repo?: string } = $props();
	let stars: number | string = $state('-');
	let forks: number | string = $state('-');
	let version: string = $state('v-');

	function formatNumber(num: number | string): string | number {
		if (typeof num !== 'number') return num;
		if (num >= 1000) {
			return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
		}
		return num;
	}

	onMount(() => {
		const CACHE_KEY = `bansos_gh_v2_${repo}`;

		const cached = localStorage.getItem(CACHE_KEY);
		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				stars = parsed.stars ?? stars;
				forks = parsed.forks ?? forks;
				version = parsed.version ?? version;
			} catch {
				// Ignore parse error
			}
		}

		Promise.all([
			fetch(`https://api.github.com/repos/${repo}`).then((r) => (r.ok ? r.json() : null)),
			fetch(`https://api.github.com/repos/${repo}/releases/latest`).then((r) =>
				r.ok ? r.json() : null
			)
		])
			.then(([repoData, releaseData]) => {
				if (repoData || releaseData) {
					if (repoData) {
						stars = repoData.stargazers_count;
						forks = repoData.forks_count;
					}
					if (releaseData && releaseData.tag_name) {
						version = releaseData.tag_name;
					}
					localStorage.setItem(CACHE_KEY, JSON.stringify({ stars, forks, version }));
				}
			})
			.catch(() => {});
	});
</script>

<a
	href={`https://github.com/${repo}`}
	target="_blank"
	rel="noopener noreferrer"
	class="repo-link"
	aria-label="GitHub Repository"
>
	<i class="fa-brands fa-git-alt git-icon"></i>
	<div class="repo-info">
		<span class="repo-name">{repo}</span>
		<ul class="md-source__facts">
			{#if version !== 'v-'}
				<li class="md-source__fact"><i class="fa-solid fa-tag"></i> {version}</li>
			{/if}
			<li class="md-source__fact"><i class="fa-solid fa-star"></i> {formatNumber(stars)}</li>
			<li class="md-source__fact"><i class="fa-solid fa-code-branch"></i> {formatNumber(forks)}</li>
		</ul>
	</div>
</a>

<style>
	.repo-link {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		border: none;
		background: transparent;
		color: var(--text-secondary);
		padding: 0.4rem 0.75rem;
		border-radius: 0.5rem;
		text-decoration: none;
		transition:
			background-color 0.2s,
			color 0.2s;
	}

	.repo-link:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.05);
	}

	.git-icon {
		flex-shrink: 0;
		font-size: 1.5rem;
	}

	.repo-info {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.repo-name {
		font-size: 0.8rem;
		font-weight: 750;
		line-height: 1;
		color: var(--text-primary);
	}

	.md-source__facts {
		display: flex;
		align-items: center;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: 0.5rem;
	}

	.md-source__fact {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted);
		line-height: 1;
	}

	.md-source__fact i {
		font-size: 0.7rem;
		opacity: 0.75;
	}

	.repo-link:hover .md-source__fact {
		color: var(--text-secondary);
	}
</style>
