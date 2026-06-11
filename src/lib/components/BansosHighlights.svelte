<script lang="ts">
	import type { BansosItem } from '$lib/data/bansos';

	let { items }: { items: BansosItem[] } = $props();
</script>

<div class="highlight-container">
	{#each items as item, index (item.id)}
		<a href="/list/{item.id}" class="highlight-card glass-card">
			<div class="highlight-header">
				<span class="highlight-tag">
					{index === 0 ? 'BANSOS TERBARU' : 'BANSOS PILIHAN'}
				</span>
			</div>
			<h3 class="highlight-title">{item.title}</h3>
			<p class="highlight-provider">{item.provider} · {item.validity}</p>
			<span class="highlight-cta">Lihat Cara Klaim</span>
		</a>
	{/each}
</div>

<style>
	.highlight-container {
		width: 100%;
		max-width: 58rem;
		margin-block: 1rem;
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}

	.highlight-card {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		text-align: left;
		padding: 1.25rem;
		border: 1px solid rgba(16, 185, 129, 0.32);
		border-radius: 0.9rem;
	}

	.highlight-tag {
		font-size: 0.7rem;
		font-weight: 850;
		background: rgba(16, 185, 129, 0.15);
		color: var(--color-accent);
		padding: 0.25rem 0.5rem;
		border-radius: 0.35rem;
		width: fit-content;
	}

	.highlight-title {
		font-size: 1.05rem;
		font-weight: 800;
		color: var(--text-primary);
		line-height: 1.35;
	}

	.highlight-provider {
		font-size: 0.84rem;
		font-weight: 650;
		color: var(--text-muted);
		line-height: 1.45;
	}

	.highlight-cta {
		font-size: 0.86rem;
		font-weight: 750;
		color: var(--color-accent);
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
