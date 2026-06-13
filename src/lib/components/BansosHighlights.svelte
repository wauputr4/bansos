<script lang="ts">
	import type { BansosItem } from '$lib/data/bansos';

	let { title, icon, items }: { title: string; icon: string; items: BansosItem[] } = $props();

	let activeTooltip = $state<string | null>(null);

	function toggleTooltip(id: string, e: Event) {
		e.preventDefault();
		e.stopPropagation();
		activeTooltip = activeTooltip === id ? null : id;
	}
</script>

<div class="scroll-section">
	<div class="section-header">
		<h2><i class={icon}></i> {title}</h2>
		<a href="/list" class="see-all">Lihat Semua <i class="fa-solid fa-arrow-right"></i></a>
	</div>
	<div class="highlight-scroll">
		{#each items as item (item.id)}
			<a href="/list/{item.id}" class="highlight-card glass-card">
				<div class="highlight-header">
					<div class="tags-container">
						{#each item.tags.slice(0, 1) as tag}
							<span class="highlight-tag">
								<i class="fa-solid fa-tag"></i>
								<span class="tag-text">{tag}</span>
							</span>
						{/each}
					</div>
					{#if item.status !== 'expired'}
						<!-- svelte-ignore a11y_interactive_supports_focus -->
						{#if item.validity.type === 'forever'}
							<span
								class="validity-badge validity-forever {item.validity.description
									? 'has-tooltip'
									: ''}"
								role={item.validity.description ? 'button' : undefined}
								onclick={(e) => {
									if (item.validity.description) {
										e.preventDefault();
										e.stopPropagation();
										activeTooltip = activeTooltip === item.id ? null : item.id;
									}
								}}
								onmouseleave={() => (activeTooltip = null)}
							>
								<i class="fa-solid fa-infinity"></i> Selamanya
								{#if item.validity.description}
									<span class="tooltip-text" class:show-mobile={activeTooltip === item.id}
										>{item.validity.description}</span
									>
								{/if}
							</span>
						{:else if item.validity.type === 'fixed'}
							<span
								class="validity-badge validity-fixed {item.validity.description
									? 'has-tooltip'
									: ''}"
								role={item.validity.description ? 'button' : undefined}
								onclick={(e) => {
									if (item.validity.description) {
										e.preventDefault();
										e.stopPropagation();
										activeTooltip = activeTooltip === item.id ? null : item.id;
									}
								}}
								onmouseleave={() => (activeTooltip = null)}
							>
								<i class="fa-regular fa-calendar"></i>
								{item.validity.date}
								{#if item.validity.description}
									<span class="tooltip-text" class:show-mobile={activeTooltip === item.id}
										>{item.validity.description}</span
									>
								{/if}
							</span>
						{:else}
							<span
								class="validity-badge validity-uncertain {item.validity.description
									? 'has-tooltip'
									: ''}"
								role={item.validity.description ? 'button' : undefined}
								onclick={(e) => {
									if (item.validity.description) {
										e.preventDefault();
										e.stopPropagation();
										activeTooltip = activeTooltip === item.id ? null : item.id;
									}
								}}
								onmouseleave={() => (activeTooltip = null)}
							>
								<i class="fa-solid fa-hourglass-half"></i> Tidak Tentu
								{#if item.validity.description}
									<span class="tooltip-text" class:show-mobile={activeTooltip === item.id}
										>{item.validity.description}</span
									>
								{/if}
							</span>
						{/if}
					{/if}
				</div>
				<h3 class="highlight-title">{item.title}</h3>
				<p class="highlight-provider">{item.provider}</p>
				<p class="highlight-description">{item.description}</p>
				<span class="highlight-cta">Lihat Cara Klaim</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.scroll-section {
		width: 100%;
		max-width: 58rem;
		margin-block: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-inline: 0.5rem;
	}

	.section-header h2 {
		font-size: 1.15rem;
		font-weight: 800;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
	}

	.section-header h2 i {
		color: var(--color-accent);
	}

	.see-all {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--color-accent);
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: 0.35rem;
		transition: color 0.2s;
	}

	.see-all:hover {
		color: var(--text-primary);
	}

	.highlight-scroll {
		display: flex;
		overflow-x: auto;
		gap: 1rem;
		padding-top: 0.25rem;
		padding-bottom: 1rem;
		padding-inline: 0.5rem;
		scroll-snap-type: x mandatory;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.highlight-scroll::-webkit-scrollbar {
		display: none;
	}

	.highlight-card {
		flex: 0 0 85%;
		max-width: 22rem;
		scroll-snap-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		text-align: left;
		padding: 1.25rem;
		border: 1px solid rgba(16, 185, 129, 0.32);
		border-radius: 0.9rem;
		transition:
			transform 0.2s,
			border-color 0.2s;
	}

	.highlight-card:hover {
		transform: translateY(-2px);
		border-color: rgba(16, 185, 129, 0.6);
	}

	.highlight-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.tags-container {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}

	.highlight-tag {
		font-size: 0.65rem;
		font-weight: 850;
		background: rgba(16, 185, 129, 0.15);
		color: var(--color-accent);
		padding: 0.25rem 0.45rem;
		border-radius: 0.35rem;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		text-transform: uppercase;
		max-width: 8rem;
		line-height: 1;
	}

	.tag-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.validity-badge {
		font-size: 0.65rem;
		font-weight: 750;
		padding: 0.25rem 0.5rem;
		border-radius: 0.35rem;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		white-space: nowrap;
		line-height: 1;
	}

	.validity-forever {
		color: var(--color-success);
		background: rgba(16, 185, 129, 0.1);
		border: 1px solid rgba(16, 185, 129, 0.2);
	}

	.validity-fixed {
		color: var(--color-warning);
		background: rgba(245, 158, 11, 0.1);
		border: 1px solid rgba(245, 158, 11, 0.2);
	}

	.validity-uncertain {
		color: var(--text-muted);
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid var(--border-color);
	}

	.has-tooltip {
		position: relative;
		cursor: help;
	}

	@media (pointer: coarse) {
		.has-tooltip {
			cursor: pointer;
		}
	}

	.has-tooltip .tooltip-text {
		visibility: hidden;
		opacity: 0;
		position: absolute;
		top: 140%;
		right: 0;
		transform: translateY(-5px);
		background: rgba(15, 23, 42, 0.98);
		color: #fff;
		padding: 0.6rem 0.85rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		width: max-content;
		max-width: 220px;
		white-space: normal;
		z-index: 50;
		transition: all 0.2s ease;
		border: 1px solid rgba(255, 255, 255, 0.15);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		pointer-events: none;
		line-height: 1.4;
		text-align: right;
		font-weight: 500;
	}

	@media (hover: hover) {
		.has-tooltip:hover .tooltip-text,
		.has-tooltip:active .tooltip-text {
			visibility: visible;
			opacity: 1;
			transform: translateY(0);
		}
	}

	.tooltip-text.show-mobile {
		visibility: visible !important;
		opacity: 1 !important;
		transform: translateY(0) !important;
	}

	.highlight-title {
		font-size: 1.05rem;
		font-weight: 800;
		color: var(--text-primary);
		line-height: 1.35;
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.highlight-provider {
		font-size: 0.8rem;
		font-weight: 750;
		color: var(--text-secondary);
		margin: -0.25rem 0 0 0;
	}

	.highlight-description {
		font-size: 0.84rem;
		color: var(--text-muted);
		line-height: 1.5;
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.highlight-cta {
		font-size: 0.86rem;
		font-weight: 750;
		color: var(--color-accent);
		margin-top: auto;
		padding-top: 0.5rem;
	}

	@media (max-width: 48rem) {
		/* display:none removed to support mobile toggles */
	}

	@media (min-width: 48rem) {
		.highlight-card {
			flex: 0 0 calc(50% - 0.5rem);
		}
	}

	@media (min-width: 64rem) {
		.highlight-card {
			flex: 0 0 calc(33.333% - 0.66rem);
		}
	}
</style>
