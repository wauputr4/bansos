<script lang="ts">
	import { t } from '$lib/i18n';
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>{$t('meta.aboutTitle')}</title>
	<meta name="description" content={$t('meta.aboutDesc')} />
	<meta
		name="keywords"
		content="bansos.dev, katalog promo developer, open source Indonesia, domain gratis, cloud credits gratis, API credits, hosting free tier, startup credits, SvelteKit"
	/>
	<link rel="canonical" href="https://bansos.dev/about/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://bansos.dev/about/" />
	<meta property="og:title" content={$t('meta.aboutTitle')} />
	<meta property="og:description" content={$t('meta.aboutDesc')} />
	<meta property="og:image" content="https://bansos.dev/og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://bansos.dev/about/" />
	<meta name="twitter:title" content={$t('meta.aboutTitle')} />
	<meta name="twitter:description" content={$t('meta.aboutDesc')} />
	<meta name="twitter:image" content="https://bansos.dev/og.png" />
</svelte:head>

<main class="page-wrapper">
	<section class="container content-shell">
		<p class="eyebrow">{$t('about.eyebrow')}</p>
		<h1 class="text-gradient">{$t('about.h1')}</h1>
		<p>{$t('about.introP1')}</p>
		<p>{$t('about.introP2')}</p>

		<div class="info-grid">
			<section class="info-card">
				<h2><i class="fa-solid fa-magnifying-glass"></i> {$t('about.infoCards.easyTitle')}</h2>
				<p>{$t('about.infoCards.easyDesc')}</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-eye"></i> {$t('about.infoCards.transparentTitle')}</h2>
				<p>{$t('about.infoCards.transparentDesc')}</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-code"></i> {$t('about.infoCards.opensourceTitle')}</h2>
				<p>{$t('about.infoCards.opensourceDesc')}</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-terminal"></i> {$t('about.infoCards.instantTitle')}</h2>
				<p>{$t('about.infoCards.instantDesc')}</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-shield-heart"></i> {$t('about.infoCards.curationTitle')}</h2>
				<p>{$t('about.infoCards.curationDesc')}</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-handshake"></i> {$t('about.infoCards.fairTitle')}</h2>
				<p>{$t('about.infoCards.fairDesc')}</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-credit-card"></i> {$t('about.infoCards.noccTitle')}</h2>
				<p>{$t('about.infoCards.noccDesc')}</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-user-shield"></i> {$t('about.infoCards.noadsTitle')}</h2>
				<p>{$t('about.infoCards.noadsDesc')}</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-gauge-high"></i> {$t('about.infoCards.lightTitle')}</h2>
				<p>{$t('about.infoCards.lightDesc')}</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-comments"></i> {$t('about.infoCards.communityTitle')}</h2>
				<p>{$t('about.infoCards.communityDesc')}</p>
			</section>
		</div>

		<div class="actions">
			<a href={resolve('/list')} class="btn-primary">{$t('about.ctaList')}</a>
			<a href={resolve('/contribute')} class="about-link">{$t('about.ctaContribute')}</a>
		</div>

		<section class="discord-community-section">
			<h2>
				<i class="fa-brands fa-discord"></i>
				{$t('about.discordTitle')}
			</h2>
			<p>{$t('about.discordDesc')}</p>
			<div class="discord-button-wrapper">
				<a
					href="https://discord.gg/m4WFaQpNGs"
					target="_blank"
					rel="noopener noreferrer"
					class="discord-pill"
				>
					<i class="fa-brands fa-discord"></i>
					{$t('about.discordJoinBtn')}
				</a>
			</div>
		</section>

		<section class="whatsapp-community-section">
			<h2>
				<i class="fa-brands fa-whatsapp"></i>
				{$t('about.whatsappTitle')}
			</h2>
			<p>{$t('about.whatsappDesc')}</p>
			<div class="whatsapp-button-wrapper">
				<a
					href="https://whatsapp.com/channel/0029Vb8ZXgW1Hsq7j1uhRm0G"
					target="_blank"
					rel="noopener noreferrer"
					class="whatsapp-pill"
				>
					<i class="fa-brands fa-whatsapp"></i>
					{$t('about.whatsappJoinBtn')}
				</a>
			</div>
		</section>

		<section class="bansos-community-section">
			<div class="community-section-copy">
				<p class="eyebrow">{$t('about.communityEyebrow')}</p>
				<h2>{$t('about.communityTitle')}</h2>
				<p>{$t('about.communityDesc')}</p>
			</div>
			<div class="community-partner-grid">
				<a
					href="https://discord.gg/3wFyhHDsuK"
					target="_blank"
					rel="noopener noreferrer"
					class="community-partner-card"
				>
					<span class="partner-icon"><i class="fa-brands fa-discord"></i></span>
					<span class="partner-copy">
						<strong>{$t('about.communityPartner1')}</strong>
						<span>{$t('about.communityPartnerRole')}</span>
					</span>
					<i class="fa-solid fa-arrow-up-right-from-square partner-arrow"></i>
				</a>
				<a
					href="https://discord.gg/fgG4aHgWpE"
					target="_blank"
					rel="noopener noreferrer"
					class="community-partner-card"
				>
					<span class="partner-icon"><i class="fa-brands fa-discord"></i></span>
					<span class="partner-copy">
						<strong>{$t('about.communityPartner2')}</strong>
						<span>{$t('about.communityPartnerRole')}</span>
					</span>
					<i class="fa-solid fa-arrow-up-right-from-square partner-arrow"></i>
				</a>
			</div>
		</section>

		<section class="sponsor-section">
			<h2>
				<i class="fa-solid fa-heart"></i>
				{$t('about.sponsorTitle')}
			</h2>
			<p>{$t('about.sponsorDesc')}</p>

			<div class="support-options-grid">
				<div class="support-card">
					<h3>
						<i class="fa-solid fa-circle-dollar-to-slot text-rose"></i>
						{$t('about.sponsorFinancial')}
					</h3>
					<p>{$t('about.sponsorEmailLabel')}</p>
					<div class="support-actions">
						<a
							href="mailto:me@wau.my.id"
							target="_blank"
							rel="noopener noreferrer"
							class="sponsor-pill"
						>
							<i class="fa-solid fa-heart"></i> me@wau.my.id
						</a>
						<a
							href="https://github.com/sponsors/Renzie2161"
							target="_blank"
							rel="noopener noreferrer"
							class="sponsor-pill"
						>
							<i class="fa-solid fa-heart"></i> Renzie2161
						</a>
					</div>
				</div>

				<div class="support-card">
					<h3>
						<i class="fa-solid fa-code-branch text-emerald"></i>
						{$t('about.sponsorCodeTitle')}
					</h3>
					<p>{$t('about.sponsorCodeDesc')}</p>
					<div class="support-actions">
						<a
							href="https://github.com/wauputr4/bansos"
							target="_blank"
							rel="noopener noreferrer"
							class="contrib-pill github-star-pill"
						>
							<i class="fa-brands fa-github"></i>
							{$t('about.sponsorStarBtn')}
						</a>
						<a
							href="https://gitlab.com/wauputr4/bansos"
							target="_blank"
							rel="noopener noreferrer"
							class="contrib-pill github-star-pill"
						>
							<i class="fa-brands fa-gitlab"></i>
							{$t('about.sponsorStarBtn')}
						</a>
						<a href={resolve('/contribute')} class="contrib-pill submit-bansos-pill">
							<i class="fa-solid fa-plus"></i>
							{$t('about.sponsorPrBtn')}
						</a>
					</div>
				</div>
			</div>
		</section>

		<section class="disclaimer-section">
			<h2><i class="fa-solid fa-scale-balanced"></i> {$t('about.disclaimerTitle')}</h2>
			<div class="disclaimer-body">
				<p>{$t('about.disclaimerP1')}</p>
				<p>
					<strong>{$t('about.disclaimerProhibition')}</strong>
				</p>
				<ul>
					<li>{$t('about.disclaimerLi1')}</li>
					<li>{$t('about.disclaimerLi2')}</li>
					<li>{$t('about.disclaimerLi3')}</li>
					<li>{$t('about.disclaimerLi4')}</li>
					<li>{$t('about.disclaimerLi5')}</li>
				</ul>
				<p>{$t('about.disclaimerReference')}</p>
				<p>{$t('about.disclaimerAgreement')}</p>
			</div>
		</section>
	</section>
</main>

<style>
	.page-wrapper {
		padding-block: 2rem 3rem;
	}

	.content-shell {
		max-width: 56rem;
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

	p {
		color: var(--text-secondary);
	}

	.info-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.info-card {
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		padding: 1rem;
	}

	.info-card h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 0.5rem;
		color: var(--text-primary);
		font-size: 1.05rem;
		line-height: 1.25;
	}

	.info-card h2 i {
		color: var(--color-accent);
	}

	.info-card p {
		margin: 0;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.about-link {
		color: var(--color-accent);
		font-weight: 800;
	}

	@media (min-width: 48rem) {
		.info-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.sponsor-section {
		margin-top: 3.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		text-align: center;
	}

	.sponsor-section h2 {
		font-size: var(--font-size-h2);
		color: var(--text-primary);
	}

	.sponsor-section h2 i {
		color: #ea4335;
	}

	.sponsor-section p {
		max-width: 32rem;
		color: var(--text-secondary);
		margin: 0 auto;
	}

	.support-options-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1.5rem;
		width: 100%;
		margin-top: 1.5rem;
		text-align: left;
	}

	@media (min-width: 48rem) {
		.support-options-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	.support-card {
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.02);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.support-card h3 {
		font-size: 1.15rem;
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.support-card h3 i.text-rose {
		color: #ec4899;
	}

	.support-card h3 i.text-emerald {
		color: var(--color-accent);
	}

	.support-card p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.4;
		margin: 0;
	}

	.support-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: auto;
		padding-top: 0.5rem;
	}

	.sponsor-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: #fff;
		font-size: 0.85rem;
		font-weight: 700;
		padding: 0.5rem 1rem;
		border-radius: 999px;
		background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
		box-shadow: 0 4px 10px rgba(236, 72, 153, 0.2);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		text-decoration: none;
	}

	.sponsor-pill:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 14px rgba(236, 72, 153, 0.3);
		color: #fff;
	}

	.contrib-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--text-primary);
		font-size: 0.85rem;
		font-weight: 700;
		padding: 0.5rem 1rem;
		border-radius: 999px;
		border: 1px solid var(--border-color);
		background: rgba(255, 255, 255, 0.05);
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.contrib-pill:hover {
		transform: translateY(-1px);
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--text-secondary);
	}

	.github-star-pill {
		background: rgba(241, 196, 15, 0.1);
		border-color: rgba(241, 196, 15, 0.2);
		color: #f1c40f;
	}

	.github-star-pill:hover {
		background: rgba(241, 196, 15, 0.15);
		border-color: rgba(241, 196, 15, 0.35);
		color: #f1c40f;
	}

	.submit-bansos-pill {
		background: rgba(16, 185, 129, 0.1);
		border-color: rgba(16, 185, 129, 0.25);
		color: var(--color-success);
	}

	.submit-bansos-pill:hover {
		background: rgba(16, 185, 129, 0.15);
		border-color: rgba(16, 185, 129, 0.4);
		color: var(--color-success);
	}

	.discord-community-section {
		margin-top: 3.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		text-align: center;
		border: 1px dashed rgba(88, 101, 242, 0.45);
		border-radius: 1rem;
		padding: 2.25rem 1.5rem;
		background: rgba(88, 101, 242, 0.03);
	}

	.discord-community-section h2 {
		font-size: var(--font-size-h2);
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
	}

	.discord-community-section h2 i {
		color: #5865f2;
	}

	.discord-community-section p {
		max-width: 36rem;
		color: var(--text-secondary);
		margin: 0 auto;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.discord-button-wrapper {
		margin-top: 0.5rem;
	}

	.discord-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: #fff;
		font-size: 1rem;
		font-weight: 700;
		padding: 0.6rem 1.25rem;
		border-radius: 999px;
		background: #5865f2;
		box-shadow: 0 4px 14px rgba(88, 101, 242, 0.35);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		text-decoration: none;
	}

	.discord-pill:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(88, 101, 242, 0.45);
		color: #fff;
	}

	.whatsapp-community-section {
		margin-top: 3.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		text-align: center;
		border: 1px dashed rgba(37, 211, 102, 0.45);
		border-radius: 1rem;
		padding: 2.25rem 1.5rem;
		background: rgba(37, 211, 102, 0.03);
	}

	.whatsapp-community-section h2 {
		font-size: var(--font-size-h2);
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
	}

	.whatsapp-community-section h2 i {
		color: #25d366;
	}

	.whatsapp-community-section p {
		max-width: 36rem;
		color: var(--text-secondary);
		margin: 0 auto;
		font-size: 0.95rem;
		line-height: 1.5;
	}

	.whatsapp-button-wrapper {
		margin-top: 0.5rem;
	}

	.whatsapp-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: #fff;
		font-size: 1rem;
		font-weight: 700;
		padding: 0.6rem 1.25rem;
		border-radius: 999px;
		background: #25d366;
		box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);
		transition:
			transform 0.2s,
			box-shadow 0.2s;
		text-decoration: none;
	}

	.whatsapp-pill:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(37, 211, 102, 0.45);
		color: #fff;
	}

	.bansos-community-section {
		margin-top: 1.25rem;
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		border: 1px solid rgba(16, 185, 129, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		background: linear-gradient(
			135deg,
			rgba(16, 185, 129, 0.08) 0%,
			rgba(255, 255, 255, 0.02) 58%,
			rgba(88, 101, 242, 0.07) 100%
		);
	}

	.community-section-copy {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.community-section-copy h2 {
		margin: 0;
		color: var(--text-primary);
		font-size: clamp(1.35rem, 3vw, 1.9rem);
		line-height: 1.2;
	}

	.community-section-copy p {
		margin: 0;
	}

	.community-partner-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}

	.community-partner-card {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		border: 1px solid var(--border-color);
		border-radius: 0.8rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.04);
		text-decoration: none;
		transition:
			transform 0.2s,
			border-color 0.2s,
			background-color 0.2s;
	}

	.community-partner-card:hover {
		transform: translateY(-2px);
		border-color: rgba(88, 101, 242, 0.55);
		background: rgba(88, 101, 242, 0.08);
	}

	.partner-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 999px;
		color: #fff;
		background: #5865f2;
		box-shadow: 0 8px 18px rgba(88, 101, 242, 0.25);
		flex-shrink: 0;
	}

	.partner-icon i {
		font-size: 1.25rem;
	}

	.partner-copy {
		display: flex;
		flex: 1;
		min-width: 0;
		flex-direction: column;
		gap: 0.2rem;
	}

	.partner-copy strong {
		color: var(--text-primary);
		font-size: 1rem;
		line-height: 1.25;
	}

	.partner-copy span {
		color: var(--text-secondary);
		font-size: 0.85rem;
		font-weight: 650;
	}

	.partner-arrow {
		color: var(--text-muted);
		flex-shrink: 0;
		transition: color 0.2s;
	}

	.community-partner-card:hover .partner-arrow {
		color: #5865f2;
	}

	@media (min-width: 48rem) {
		.bansos-community-section {
			grid-template-columns: minmax(0, 1.1fr) minmax(18rem, 0.9fr);
			align-items: center;
		}
	}

	.disclaimer-section {
		margin-top: 4rem;
		padding-top: 2.5rem;
		border-top: 1px solid var(--border-color);
	}

	.disclaimer-section h2 {
		font-size: var(--font-size-h2);
		color: var(--text-primary);
		margin: 0 0 1.25rem;
	}

	.disclaimer-section h2 i {
		color: #ef4444;
	}

	.disclaimer-body {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.disclaimer-body p {
		color: var(--text-secondary);
		line-height: 1.6;
		margin: 0;
		font-size: 0.9rem;
	}

	.disclaimer-body ul {
		margin: 0;
		padding-left: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.disclaimer-body li {
		color: var(--text-secondary);
		font-size: 0.9rem;
		line-height: 1.5;
	}
</style>
