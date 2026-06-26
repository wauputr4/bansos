<script lang="ts">
	import { t } from '$lib/i18n';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{$t('meta.termsTitle')}</title>
	<meta name="description" content={$t('meta.termsDesc')} />
	<link rel="canonical" href="https://bansos.dev/terms/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://bansos.dev/terms/" />
	<meta property="og:title" content={$t('meta.termsTitle')} />
	<meta property="og:description" content={$t('meta.termsDesc')} />
	<meta property="og:image" content="https://bansos.dev/og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://bansos.dev/terms/" />
	<meta name="twitter:title" content={$t('meta.termsTitle')} />
	<meta name="twitter:description" content={$t('meta.termsDesc')} />
	<meta name="twitter:image" content="https://bansos.dev/og.png" />
</svelte:head>

<main class="page-wrapper">
	<section class="container content-shell">
		<p class="eyebrow">{$t('terms.eyebrow')}</p>
		<h1 class="text-gradient">{$t('terms.h1')}</h1>
		<p class="lead">{$t('terms.lead')}</p>

		<section class="terms-section">
			<h2>{$t('terms.section1Title')}</h2>
			<p>{$t('terms.section1Desc')}</p>
		</section>

		<section class="terms-section">
			<h2>{$t('terms.section2Title')}</h2>
			<p>{$t('terms.section2Desc')}</p>
		</section>

		<section class="terms-section">
			<h2>{$t('terms.section3Title')}</h2>
			<p>{$t('terms.section3Desc')}</p>
		</section>

		<section class="terms-section">
			<h2>{$t('terms.section4Title')}</h2>
			<p>{$t('terms.section4P1')}</p>
			<p style="margin-top: 0.5rem;">{$t('terms.section4P2')}</p>
		</section>

		<section class="terms-section">
			<h2>{$t('terms.section5Title')}</h2>
			<p>{$t('terms.section5Intro')}</p>
			<ul class="terms-list">
				<li>{$t('terms.liAbuse')}</li>
				<li>{$t('terms.liTos')}</li>
				<li>{$t('terms.liPrivacy')}</li>
				<li>{$t('terms.liIllegal')}</li>
				<li>{$t('terms.liFalse')}</li>
			</ul>
			<p style="margin-top: 0.5rem;">{$t('terms.section5Outro')}</p>
		</section>

		<section class="terms-section">
			<h2>{$t('terms.section6Title')}</h2>
			<p>{$t('terms.section6Desc')}</p>
		</section>

		<section class="terms-section">
			<h2>{$t('terms.section7Title')}</h2>
			<p>{$t('terms.section7Desc')}</p>
		</section>

		<div class="actions">
			<a href={resolve('/list')} class="btn-primary">{$t('terms.ctaList')}</a>
			<a href={resolve('/contribute')} class="terms-link">{$t('terms.ctaContribute')}</a>
		</div>
	</section>
</main>

<style>
	.page-wrapper {
		padding-block: 2rem 3rem;
	}

	.content-shell {
		max-width: 52rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.eyebrow {
		color: var(--color-accent);
		font-size: 0.8rem;
		font-weight: 850;
		text-transform: uppercase;
	}

	h1 {
		font-size: var(--font-size-h1);
		line-height: 1.1;
	}

	.lead,
	p {
		color: var(--text-secondary);
	}

	.lead {
		font-size: 1.05rem;
	}

	.terms-section {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		padding: 1rem;
	}

	.terms-section h2 {
		margin: 0;
		color: var(--text-primary);
		font-size: 1.05rem;
		line-height: 1.25;
	}

	.terms-section p {
		margin: 0;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.terms-link {
		color: var(--color-accent);
		font-weight: 800;
	}

	.terms-list {
		margin: 0.25rem 0 0;
		padding-left: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.terms-list li {
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.terms-list li strong {
		color: #ef4444;
	}
</style>
