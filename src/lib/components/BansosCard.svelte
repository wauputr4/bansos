<script lang="ts">
	import type { BansosItem } from '$lib/data/bansos';

	let { item, compact = false }: { item: BansosItem; compact?: boolean } = $props();
</script>

<article class:compact class="glass-card bansos-card">
	<div class="card-header">
		<div class="tags-container">
			{#each item.tags as tag}
				<span class="tag-badge">{tag}</span>
			{/each}
		</div>
		<span class="status-badge status-{item.status}">
			{item.status === 'active' ? '● Aktif' : item.status}
		</span>
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
		<a href="/list/{item.id}" class="btn-primary">
			Lihat Cara Klaim Lengkap
		</a>
	</div>
</article>

<style>
	.bansos-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.bansos-card.compact {
		padding: 1.25rem;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag-badge {
		font-size: 0.75rem;
		font-weight: 650;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border-color);
		padding: 0.2rem 0.6rem;
		border-radius: 0.5rem;
		color: var(--text-secondary);
	}

	.status-badge {
		font-size: 0.75rem;
		font-weight: 750;
		padding: 0.2rem 0.6rem;
		border-radius: 0.5rem;
		background: rgba(16, 185, 129, 0.1);
		color: var(--color-success);
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
