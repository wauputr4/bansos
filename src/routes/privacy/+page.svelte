<script lang="ts">
	import { resolve } from '$app/paths';
	import { t } from '$lib/i18n';
	import { locale } from 'svelte-i18n';
	const sections = [
		{ id: 1, paragraphs: 1 },
		{ id: 2, paragraphs: 2 },
		{ id: 3, paragraphs: 2 },
		{ id: 4, paragraphs: 2 },
		{ id: 5, paragraphs: 2 },
		{ id: 6, paragraphs: 1 }
	];
</script>

<svelte:head>
	<title>{$t('privacy.title')} | bansos.dev</title>
	<meta name="description" content={$t('privacy.description')} />
	<link rel="canonical" href="https://bansos.dev/privacy/" />
</svelte:head>
<main class="container policy">
	<h1>{$t('privacy.title')}</h1>
	{#if !['id', 'en'].includes($locale || 'id')}<p role="note">{$t('legal.fallbackNotice')}</p>{/if}
	<p>{$t('privacy.intro')}</p>
	{#each sections as section (section.id)}
		<section>
			<h2>{$t(`privacy.s${section.id}Title`)}</h2>
			{#each Array.from({ length: section.paragraphs }, (_, i) => i + 1) as paragraph (paragraph)}
				<p>{$t(`privacy.s${section.id}p${paragraph}`)}</p>
			{/each}
		</section>
	{/each}
	<a href="mailto:submit@bansos.dev">{$t('privacy.contact')}: submit@bansos.dev</a>
	<a href={resolve('/terms/')}>{$t('privacy.termsLink')}</a>
</main>

<style>
	.policy {
		max-width: 54rem;
		padding-block: 3rem;
		display: grid;
		gap: 1.5rem;
	}
	section {
		display: grid;
		gap: 0.6rem;
	}
	h1 {
		font-size: clamp(2rem, 5vw, 3rem);
	}
	h2 {
		font-size: 1.3rem;
	}
	p {
		color: var(--text-secondary);
		line-height: 1.8;
	}
	a {
		color: var(--color-accent);
	}
</style>
