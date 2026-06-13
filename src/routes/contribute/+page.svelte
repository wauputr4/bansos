<script lang="ts">
	import { getContributorStats, type ContributorSummary } from '$lib/data/bansos';

	const contributors: ContributorSummary[] = getContributorStats();
</script>

<svelte:head>
	<title>Kontribusi bansos.dev</title>
	<meta name="description" content="Cara menambahkan daftar bansos developer ke bansos.dev." />
</svelte:head>

<main class="page-wrapper">
	<section class="container content-shell">
		<p class="eyebrow">Kontribusi</p>
		<h1 class="text-gradient">Punya info bansos? Jangan dinikmati sendirian.</h1>
		<p>
			Info baru bisa ditambahkan lewat Pull Request. Isi minimalnya: nama program, provider,
			benefit, syarat klaim, masa berlaku, link official, tag, dan nama kontributor.
		</p>

		<div class="command-box">
			<p>Contoh submit via CLI (format lengkap yang diterima):</p>
			<pre class="command-block"><code>npx bansosdev add \
  --id name-com-developer-jelata \
  --title "Promo Domain .app/.dev/.online/.site/.link" \
  --provider "name.com" \
  --description "Nikmati promo pendaftaran domain dengan 12.5% diskon khusus paket domain, tanpa perlu kartu kredit untuk akun tertentu." \
  --benefits "Tidak perlu kartu kredit|Tidak ada biaya setup|Layanan domain untuk developer" \
  --validity "Berlaku 8-30 Juni 2026" \
  --requirements "Daftar akun name.com|Gunakan promo code DEVWEEK26|Maksimal 1 domain per akun" \
  --promo-code "DEVWEEK26" \
  --cta-link "https://www.name.com" \
  --tags "Domain,Promo,Gratis,Cloud" \
  --contributor-name "Wauputra" \
  --contributor-url "https://wau.my.id" \
  --featured false \
  --status expired</code></pre>
		</div>

		<div class="actions">
			<a
				href="https://github.com/wauputr4/bansos"
				target="_blank"
				rel="noopener noreferrer"
				class="btn-primary"
			>
				Buka GitHub
			</a>
		</div>

		<section class="contributors-section">
			<h2 class="section-title">
				<i class="fa-solid fa-users"></i> Kontributor Terdaftar
			</h2>
			{#if contributors.length > 0}
				<ul class="contributors-list">
					{#each contributors as contributor}
						<li class="contributor-card">
							<div class="contributor-name">
								<a href={contributor.url} target="_blank" rel="noopener noreferrer">
									{contributor.name}
								</a>
							</div>
							<span class="contributor-count">{contributor.count} kontribusi</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="empty-contributor">Belum ada kontributor yang terdeteksi di data.</p>
			{/if}
		</section>
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

	p {
		color: var(--text-secondary);
	}

	.command-box {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		padding: 1rem;
	}

	.command-block {
		margin: 0;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		padding: 0.9rem 1rem;
		overflow-x: auto;
	}

	.command-block code {
		display: block;
		color: var(--text-primary);
		font-size: 0.82rem;
		line-height: 1.6;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.contributors-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 0.75rem;
	}

	.section-title {
		color: var(--text-primary);
		font-size: 1.25rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.contributors-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.contributor-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.9rem 1rem;
		border: 1px solid var(--border-color);
		border-radius: 0.7rem;
		background: rgba(255, 255, 255, 0.03);
		color: var(--text-secondary);
	}

	.contributor-name {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.contributor-name a {
		color: var(--color-accent);
		font-weight: 700;
		text-decoration: none;
	}

	.contributor-name a:hover {
		text-decoration: underline;
	}

	.contributor-count {
		color: var(--text-muted);
		font-size: 0.9rem;
		font-weight: 700;
	}

	.empty-contributor {
		color: var(--text-secondary);
		margin: 0;
	}
</style>
