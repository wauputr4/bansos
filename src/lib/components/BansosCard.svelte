<script lang="ts">
	import type { BansosItem } from '$lib/data/bansos';

	let { item, compact = false }: { item: BansosItem; compact?: boolean } = $props();
</script>

<article class:compact class:is-expired={item.status === 'expired'} class="glass-card bansos-card">
	<div class="card-header">
		<div class="tags-scroll-container">
			{#each item.tags as tag}
				<span class="tag-badge">{tag}</span>
			{/each}
		</div>
		<div class="status-container">
			<span class="status-badge status-{item.status}">
				<i class="fa-solid fa-circle"></i>
				{item.status.toUpperCase()}
			</span>
		</div>
	</div>

	<h2 class="card-title">{item.title}</h2>
	<p class="provider-label">Provider: <strong>{item.provider}</strong></p>
	{#if item.contributor}
		<p class="contributor-label">
			Kontributor:
			<a href={item.contributor.url} target="_blank" rel="noopener noreferrer">
				{item.contributor.name}
			</a>
		</p>
	{/if}

	<p class="card-desc text-pretty">{item.description}</p>

	<div class="card-actions">
		<a href="/list/{item.id}" class="btn-primary"> Lihat Cara Klaim Lengkap </a>
	</div>
</article>

<style>
	.bansos-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}

	.bansos-card.compact {
		padding: 1.25rem;
	}

	.bansos-card.is-expired {
		opacity: 0.65;
		background: rgba(0, 0, 0, 0.2);
		transition: opacity 0.3s ease;
	}

	.bansos-card.is-expired:hover {
		opacity: 0.85;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.75rem;
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
		font-weight: 650;
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
		font-weight: 750;
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

	.card-title {
		font-size: 1.2rem;
		font-weight: 800;
		line-height: 1.35;
	}

	.provider-label,
	.contributor-label {
		font-size: 0.88rem;
		color: var(--text-secondary);
	}

	.contributor-label {
		margin-top: -0.5rem;
		color: var(--text-muted);
	}

	.contributor-label a {
		color: var(--color-accent);
		font-weight: 700;
	}

	.card-desc {
		color: var(--text-secondary);
		font-size: 0.95rem;
	}

	.card-actions {
		margin-top: auto;
	}

	.card-actions .btn-primary {
		width: 100%;
	}
</style>
