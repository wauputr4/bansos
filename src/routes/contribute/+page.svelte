<script lang="ts">
	import { getContributorStats, type ContributorSummary } from '$lib/data/bansos';

	const contributors: ContributorSummary[] = getContributorStats();
	const singleLineExample =
		'npx bansosdev add --id contoh-bansos --title "Contoh" --provider "Provider" --description "Deskripsi singkat" --benefits "Benefit 1|Benefit 2" --validity-type "uncertain" --validity-desc "Berlaku sampai slot habis" --requirements "Buat akun|Klaim program" --cta-link "https://example.com" --contributor-name "Nama Kamu" --contributor-url "https://example.com" --tags "Cloud,Gratisan" --status active';
	const multilineExample = [
		'npx bansosdev add \\',
		'  --id namecom-domain-app \\',
		'  --title "Promo Domain .DEV & .APP Gratis dari Name.com" \\',
		'  --provider "Name.com" \\',
		'  --description "Domain .dev dan .app gratis buat developer yang mau rilis aplikasi tanpa keluar budget domain." \\',
		'  --benefits "Domain .dev dan .app gratis|Tidak perlu kartu kredit|Limit 1 domain per akun|Promo code DEVWEEK26 sudah tidak aktif" \\',
		'  --validity-type "uncertain" \\',
		'  --validity-desc "Sudah tidak aktif (promo code tidak bisa digunakan lagi)" \\',
		'  --requirements "Punya akun Name.com aktif|Pilih domain .dev atau .app yang tersedia|Gunakan promo code pas checkout" \\',
		'  --promo-code "DEVWEEK26" \\',
		'  --published-at "2026-06-11" \\',
		'  --cta-link "https://www.name.com" \\',
		'  --contributor-name "Wauputra" \\',
		'  --contributor-url "https://wau.my.id" \\',
		'  --tags "Domain,Gratisan,No Credit Card" \\',
		'  --featured true \\',
		'  --status expired'
	].join('\n');
	let copiedNotice = $state('');

	const copyToClipboard = async (text: string, label: string) => {
		try {
			await navigator.clipboard.writeText(text);
			copiedNotice = `${label} sudah disalin.`;
			setTimeout(() => {
				copiedNotice = '';
			}, 1800);
		} catch {
			copiedNotice = 'Gagal copy, coba blok URL manual dulu ya.';
			setTimeout(() => {
				copiedNotice = '';
			}, 2200);
		}
	};
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
			Info baru bisa ditambahkan lewat CLI. Kamu submit issue dari hasil command, lalu bot akan
			bikin Pull Request otomatis kalau payload JSON valid. Isi minimalnya: nama program,
			provider, benefit, syarat klaim, masa berlaku, link official, tag, dan nama kontributor.
		</p>

		<div class="command-box">
			<p>Contoh submit via CLI (format lengkap yang diterima):</p>
			<div class="command-panel">
				<div class="command-head">
					<span>Contoh memanjang (1 baris):</span>
					<button
						type="button"
						class="copy-button"
						onclick={() => copyToClipboard(singleLineExample, 'Command one-line')}
					>
						Copy
					</button>
				</div>
				<pre class="command-inline"><code>{singleLineExample}</code></pre>
			</div>
			<div class="command-panel">
				<div class="command-head">
					<span>Versi rapi (dengan jeda baris biar enak dibaca):</span>
					<button
						type="button"
						class="copy-button"
						onclick={() => copyToClipboard(multilineExample, 'Command multiline')}
					>
						Copy
					</button>
				</div>
				<pre class="command-block"><code>{multilineExample}</code></pre>
			</div>
			{#if copiedNotice}
				<p class="copy-notice">{copiedNotice}</p>
			{/if}
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
					{#each contributors as contributor (`${contributor.name}-${contributor.url}`)}
						<li class="contributor-card">
							<div class="contributor-name">
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
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

	.command-panel {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.command-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.8rem;
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.copy-button {
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid var(--border-color);
		color: var(--text-primary);
		border-radius: 0.6rem;
		font-size: 0.76rem;
		padding: 0.38rem 0.75rem;
		font-weight: 700;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease;
	}

	.copy-button:hover {
		background: rgba(255, 255, 255, 0.14);
		border-color: rgba(255, 255, 255, 0.35);
	}

	.command-block,
	.command-inline {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		padding: 0.9rem 1rem;
		overflow-x: auto;
		margin: 0;
	}

	.command-inline code,
	.command-block code {
		display: block;
		color: var(--text-primary);
		font-size: 0.82rem;
		line-height: 1.6;
	}

	.command-inline code {
		white-space: nowrap;
	}

	.command-block {
		white-space: pre-wrap;
		word-break: break-word;
	}

	.copy-notice {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.84rem;
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
