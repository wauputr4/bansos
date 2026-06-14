<script lang="ts">
	import GithubBadge from '$lib/components/GithubBadge.svelte';
	import {
		getCommitContributorStats,
		getContributorStats,
		type ContributorSummary
	} from '$lib/data/bansos';

	const contributors: ContributorSummary[] = getContributorStats();
	const commitContributors = getCommitContributorStats();
	const singleLineExample =
		'npx bansosdev add --id contoh-bansos --title "Contoh" --provider "Provider" --description "Deskripsi singkat" --benefits "Benefit 1|Benefit 2" --validity-type "uncertain" --validity-desc "Berlaku sampai slot habis" --requirements "Buat akun|Klaim program" --cta-link "https://example.com" --contributor-name "Nama Kamu" --contributor-url "https://example.com" --tags "Cloud,Gratisan" --status active';
	const agentSkillInstallCommand =
		"npx skills add wauputr4/skill-bansos --skill bansos-add-entry --agent '*'";
	const agentPromptExample =
		'Use $bansos-add-entry to research this source and prepare a valid bansos.dev submission: https://example.com';
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
			bikin Pull Request otomatis kalau payload JSON valid. Isi minimalnya: nama program, provider,
			benefit, syarat klaim, masa berlaku, link official, tag, dan nama kontributor.
		</p>

		<div class="repo-status-card">
			<p class="eyebrow">Open Source Repo</p>
			<GithubBadge />
		</div>

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

		<section class="agent-skill-box">
			<div class="agent-copy">
				<p class="eyebrow">AI Agent</p>
				<h2>Pakai skill khusus biar agent gak halu pas nambah bansos.</h2>
				<p>
					Kalau kamu pakai AI agent yang support Agent Skills, install skill resmi
					<code>wauputr4/skill-bansos</code> lewat <code>npx skills</code>. Skill ini ngajarin agent
					cara riset sumber, bikin payload valid, dan mengikuti aturan kontribusi bansos.dev.
				</p>
			</div>
			<div class="command-panel">
				<div class="command-head">
					<span>Install skill untuk agent:</span>
					<button
						type="button"
						class="copy-button"
						onclick={() => copyToClipboard(agentSkillInstallCommand, 'Command install skill')}
					>
						Copy
					</button>
				</div>
				<pre class="command-inline"><code>{agentSkillInstallCommand}</code></pre>
			</div>
			<div class="command-panel">
				<div class="command-head">
					<span>Contoh prompt setelah skill terpasang:</span>
					<button
						type="button"
						class="copy-button"
						onclick={() => copyToClipboard(agentPromptExample, 'Prompt agent')}
					>
						Copy
					</button>
				</div>
				<pre class="command-block"><code>{agentPromptExample}</code></pre>
			</div>
			<a
				href="https://www.skills.sh/wauputr4/skill-bansos"
				target="_blank"
				rel="noopener noreferrer"
				class="skill-link"
			>
				Lihat skill di skills.sh
			</a>
		</section>

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
			<p class="section-note">
				Kontributor terdaftar adalah nama yang ditulis di payload bansos. Commit kontributor adalah
				akun GitHub yang benar-benar menambah atau mengubah data lewat commit, jadi satu bansos bisa
				punya beberapa commit kontributor kalau pernah diupdate.
			</p>
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

		<section class="contributors-section">
			<h2 class="section-title">
				<i class="fa-solid fa-code-commit"></i> Commit Kontributor
			</h2>
			<ul class="commit-contributors-list">
				{#each commitContributors as contributor (contributor.login)}
					<li class="commit-contributor-card">
						<a
							href={`https://github.com/${contributor.login}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<img src={contributor.avatarUrl} alt={contributor.login} loading="lazy" />
							<span>@{contributor.login}</span>
						</a>
						<span class="contributor-count">{contributor.count} data tersentuh</span>
					</li>
				{/each}
			</ul>
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
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		padding: 1rem;
	}

	.repo-status-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.65rem;
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		padding: 1rem;
	}

	.agent-skill-box {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		border: 1px solid color-mix(in srgb, var(--color-accent) 42%, var(--border-color));
		border-radius: 0.75rem;
		background:
			linear-gradient(135deg, rgba(53, 194, 124, 0.12), rgba(255, 255, 255, 0.03)),
			color-mix(in srgb, var(--text-primary) 4%, transparent);
		padding: 1rem;
	}

	.agent-copy {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.agent-copy h2 {
		margin: 0;
		color: var(--text-primary);
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		line-height: 1.15;
	}

	.agent-copy p {
		margin: 0;
	}

	.agent-copy code {
		color: var(--text-primary);
		font-weight: 800;
	}

	.skill-link {
		width: fit-content;
		color: var(--color-accent);
		font-size: 0.9rem;
		font-weight: 800;
		text-decoration: none;
	}

	.skill-link:hover {
		text-decoration: underline;
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

	.section-note {
		color: var(--text-secondary);
		margin: -0.25rem 0 0;
	}

	.commit-contributors-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.commit-contributor-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		border: 1px solid var(--border-color);
		border-radius: 0.7rem;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		padding: 0.75rem 1rem;
	}

	.commit-contributor-card a {
		display: inline-flex;
		align-items: center;
		gap: 0.65rem;
		color: var(--color-accent);
		font-weight: 800;
	}

	.commit-contributor-card img {
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
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
