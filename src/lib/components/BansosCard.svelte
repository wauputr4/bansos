<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		getProviderBySlug,
		slugifyProvider,
		formatNumber,
		type BansosItem
	} from '$lib/data/bansos';

	let {
		item,
		compact = false,
		views = 0,
		comments = 0,
		reactions = 0
	}: {
		item: BansosItem;
		compact?: boolean;
		views?: number;
		comments?: number;
		reactions?: number;
	} = $props();
	const status = $derived(item.status || 'unknown');

	let showTooltip = $state(false);
	const providerSlug = $derived(slugifyProvider(item.provider));
	const provider = $derived(getProviderBySlug(providerSlug));

	function toggleTooltip(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		showTooltip = !showTooltip;
	}
</script>

<article class:compact class:is-expired={status === 'expired'} class="glass-card bansos-card">
	<div class="card-header">
		<div class="tags-scroll-container">
			{#each item.tags as tag (tag)}
				<span class="tag-badge">{tag}</span>
			{/each}
		</div>
		<div class="status-container">
			<span class="status-badge status-{status}">
				<i class="fa-solid fa-circle"></i>
				{status.toUpperCase()}
			</span>
		</div>
	</div>

	<h2 class="card-title">{item.title}</h2>
	<div class="provider-row">
		<p class="provider-label">
			Provider:
			{#if provider}
				<a href={resolve(`/providers/${providerSlug}`)}>{item.provider}</a>
			{:else}
				<strong>{item.provider}</strong>
			{/if}
		</p>
		{#if status !== 'expired'}
			{#if item.validity.description}
				<button
					type="button"
					class="validity-text has-tooltip"
					onclick={(e) => toggleTooltip(e)}
					onmouseleave={() => (showTooltip = false)}
				>
					{#if item.validity.type === 'forever'}
						<i class="fa-solid fa-infinity"></i> Selamanya
					{:else if item.validity.type === 'fixed'}
						<i class="fa-regular fa-calendar"></i> {item.validity.date}
					{:else}
						<i class="fa-solid fa-question"></i> Tidak Tentu
					{/if}
					<span class="tooltip-text" class:show-mobile={showTooltip}
						>{item.validity.description}</span
					>
				</button>
			{:else}
				<span class="validity-text">
					{#if item.validity.type === 'forever'}
						<i class="fa-solid fa-infinity"></i> Selamanya
					{:else if item.validity.type === 'fixed'}
						<i class="fa-regular fa-calendar"></i> {item.validity.date}
					{:else}
						<i class="fa-solid fa-question"></i> Tidak Tentu
					{/if}
				</span>
			{/if}
		{/if}
	</div>
	{#if item.contributor}
		<p class="contributor-label">
			Kontributor:
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={item.contributor.url} target="_blank" rel="noopener noreferrer">
				{item.contributor.name}
			</a>
		</p>
	{/if}

	<p class="card-desc text-pretty">
		{item.description.length > 250
			? item.description.substring(0, 250).trim() + '...'
			: item.description}
	</p>

	<div class="card-footer">
		<div class="card-actions">
			<a href={resolve(`/list/${item.id}`)} class="btn-primary"> Lihat Cara Klaim Lengkap </a>
		</div>
		<div class="card-stats">
			<span class="stat-icon" title="Views"
				><i class="fa-regular fa-eye"></i> {formatNumber(views)}</span
			>
			{#if comments > 0}
				<span class="stat-icon" title="Comments"
					><i class="fa-regular fa-comment"></i> {formatNumber(comments)}</span
				>
			{/if}
			{#if reactions > 0}
				<span class="stat-icon" title="Reactions"
					><i class="fa-regular fa-thumbs-up"></i> {formatNumber(reactions)}</span
				>
			{/if}
		</div>
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
		padding: 0.3rem 0.6rem;
		border-radius: 0.5rem;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		line-height: 1;
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

	.provider-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: -0.5rem;
	}

	.provider-label {
		margin: 0;
	}

	.provider-label a {
		color: var(--color-accent);
		font-weight: 800;
	}

	.validity-text {
		border: 0;
		background: transparent;
		padding: 0;
		font-size: 0.85rem;
		font-family: inherit;
		color: var(--text-muted);
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-weight: 600;
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
		bottom: 140%;
		right: 0;
		transform: translateY(5px);
		background: var(--bg-secondary);
		color: var(--text-primary);
		padding: 0.6rem 0.85rem;
		border-radius: 0.5rem;
		font-size: 0.75rem;
		width: max-content;
		max-width: 220px;
		white-space: normal;
		z-index: 50;
		transition: all 0.2s ease;
		border: 1px solid var(--border-color);
		box-shadow: 0 4px 12px var(--glass-shadow);
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

	.card-footer {
		margin-top: auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.card-actions {
		flex: 1;
	}

	.card-actions .btn-primary {
		width: 100%;
	}

	.card-stats {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.stat-icon {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: var(--text-muted);
		font-weight: 600;
	}

	.stat-icon i {
		font-size: 0.8rem;
		opacity: 0.8;
	}

	@media (max-width: 48rem) {
		/* Remove the flex wrap static changes */
	}
</style>
