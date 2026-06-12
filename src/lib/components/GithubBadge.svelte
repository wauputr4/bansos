<script lang="ts">
	import { onMount } from 'svelte';

	let { repo = 'wauputr4/bansos' }: { repo?: string } = $props();
	let stars: number | string = $state('-');

	onMount(() => {
		fetch(`https://api.github.com/repos/${repo}`)
			.then((res) => {
				if (!res.ok) throw new Error('API limit or error');
				return res.json();
			})
			.then((data) => {
				stars = data.stargazers_count;
			})
			.catch(() => {
				stars = '-';
			});
	});
</script>

<a href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer" class="repo-link" aria-label="GitHub Repository">
	<svg class="github-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
		<path fill="currentColor" d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
	</svg>
	<span class="repo-name">{repo}</span>
	<span class="stars">★ {stars}</span>
</a>

<style>
	.repo-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid var(--border-color);
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 700;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		text-decoration: none;
		transition: background-color 0.2s, color 0.2s;
	}

	.repo-link:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.05);
	}

	.github-icon {
		flex-shrink: 0;
	}

	.repo-name {
		line-height: 1;
	}

	.stars {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		font-size: 0.85rem;
		color: var(--text-muted);
		padding-left: 0.5rem;
		border-left: 1px solid var(--border-color);
		line-height: 1;
	}
	
	.repo-link:hover .stars {
		color: var(--text-secondary);
	}
</style>