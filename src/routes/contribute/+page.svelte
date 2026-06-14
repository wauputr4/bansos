<script lang="ts">
	import GithubBadge from '$lib/components/GithubBadge.svelte';
	import {
		getCommitContributorStats,
		getContributorStats,
		type ContributorSummary
	} from '$lib/data/bansos';

	const contributors: ContributorSummary[] = getContributorStats();
	const commitContributors = getCommitContributorStats().sort((a, b) => {
		if (a.login === 'wauputr4') return -1;
		if (b.login === 'wauputr4') return 1;
		return 0;
	});
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
	let copiedId = $state('');

	const copyToClipboard = async (text: string, id: string) => {
		try {
			await navigator.clipboard.writeText(text);
			copiedId = id;
			copiedNotice = 'Tersalin ke clipboard!';
			setTimeout(() => {
				if (copiedId === id) copiedId = '';
				copiedNotice = '';
			}, 2000);
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
						class="copy-button mobile-only"
						class:copied={copiedId === 'one-line'}
						onclick={() => copyToClipboard(singleLineExample, 'one-line')}
					>
						{#if copiedId === 'one-line'}
							<i class="fa-solid fa-check"></i>
						{:else}
							Copy
						{/if}
					</button>
				</div>
				<div class="code-wrapper">
					<pre class="command-inline"><code>{singleLineExample}</code></pre>
					<button
						type="button"
						class="hover-copy-btn"
						class:copied={copiedId === 'one-line'}
						aria-label="Salin kode"
						onclick={() => copyToClipboard(singleLineExample, 'one-line')}
					>
						<i class="fa-solid fa-{copiedId === 'one-line' ? 'check' : 'clipboard'}"></i>
					</button>
				</div>
			</div>
			<div class="command-panel">
				<div class="command-head">
					<span>Versi rapi (dengan jeda baris biar enak dibaca):</span>
					<button
						type="button"
						class="copy-button mobile-only"
						class:copied={copiedId === 'multi-line'}
						onclick={() => copyToClipboard(multilineExample, 'multi-line')}
					>
						{#if copiedId === 'multi-line'}
							<i class="fa-solid fa-check"></i>
						{:else}
							Copy
						{/if}
					</button>
				</div>
				<div class="code-wrapper">
					<pre class="command-block"><code>{multilineExample}</code></pre>
					<button
						type="button"
						class="hover-copy-btn"
						class:copied={copiedId === 'multi-line'}
						aria-label="Salin kode"
						onclick={() => copyToClipboard(multilineExample, 'multi-line')}
					>
						<i class="fa-solid fa-{copiedId === 'multi-line' ? 'check' : 'clipboard'}"></i>
					</button>
				</div>
			</div>
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
						class="copy-button mobile-only"
						class:copied={copiedId === 'agent-install'}
						onclick={() => copyToClipboard(agentSkillInstallCommand, 'agent-install')}
					>
						{#if copiedId === 'agent-install'}
							<i class="fa-solid fa-check"></i>
						{:else}
							Copy
						{/if}
					</button>
				</div>
				<div class="code-wrapper">
					<pre class="command-inline"><code>{agentSkillInstallCommand}</code></pre>
					<button
						type="button"
						class="hover-copy-btn"
						class:copied={copiedId === 'agent-install'}
						aria-label="Salin kode"
						onclick={() => copyToClipboard(agentSkillInstallCommand, 'agent-install')}
					>
						<i class="fa-solid fa-{copiedId === 'agent-install' ? 'check' : 'clipboard'}"></i>
					</button>
				</div>
			</div>
			<div class="command-panel">
				<div class="command-head">
					<span>Contoh prompt setelah skill terpasang:</span>
					<button
						type="button"
						class="copy-button mobile-only"
						class:copied={copiedId === 'agent-prompt'}
						onclick={() => copyToClipboard(agentPromptExample, 'agent-prompt')}
					>
						{#if copiedId === 'agent-prompt'}
							<i class="fa-solid fa-check"></i>
						{:else}
							Copy
						{/if}
					</button>
				</div>
				<div class="code-wrapper">
					<pre class="command-block"><code>{agentPromptExample}</code></pre>
					<button
						type="button"
						class="hover-copy-btn"
						class:copied={copiedId === 'agent-prompt'}
						aria-label="Salin kode"
						onclick={() => copyToClipboard(agentPromptExample, 'agent-prompt')}
					>
						<i class="fa-solid fa-{copiedId === 'agent-prompt' ? 'check' : 'clipboard'}"></i>
					</button>
				</div>
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

		{#if copiedNotice}
			<div class="toast-notice">
				<i class="fa-solid fa-circle-check"></i>
				{copiedNotice}
			</div>
		{/if}

		<section class="contributors-section">
			<h2 class="section-title">
				<i class="fa-solid fa-code-commit"></i> Kontributor Proyek
			</h2>
			<p class="section-note">
				Kontributor proyek adalah akun GitHub yang benar-benar menambah atau mengubah kode atau data
				lewat commit. Satu bansos bisa punya beberapa kontributor proyek kalau pernah diupdate.
			</p>
			<ul class="commit-contributors-list">
				{#each commitContributors as contributor (contributor.login)}
					<li
						class="commit-contributor-card"
						class:author-highlight={contributor.login === 'wauputr4'}
					>
						<a
							href={`https://github.com/${contributor.login}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							<img src={contributor.avatarUrl} alt={contributor.login} loading="lazy" />
							<span class="login-name">@{contributor.login}</span>
							{#if contributor.login === 'wauputr4'}
								<span class="author-badge" title="Author">
									<i class="fa-solid fa-crown"></i>
									<span class="author-text">Author</span>
								</span>
							{/if}
						</a>
						<span class="contributor-count">{contributor.count} data tersentuh</span>
					</li>
				{/each}
			</ul>
		</section>

		<section class="contributors-section">
			<h2 class="section-title">
				<i class="fa-solid fa-users"></i> Kontributor Terdaftar
			</h2>
			<p class="section-note">
				Kontributor terdaftar adalah orang yang berkontribusi menambahkan atau meng-update data
				bansos via CLI/sistem.
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
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
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
		transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.copy-button:hover {
		background: var(--bg-secondary);
		border-color: var(--color-accent);
		color: var(--color-accent);
		transform: scale(1.05);
		box-shadow: 0 4px 12px var(--color-accent-glow);
	}

	.mobile-only {
		display: none;
	}

	.code-wrapper {
		position: relative;
	}

	.hover-copy-btn {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: color-mix(in srgb, var(--text-primary) 5%, var(--bg-primary));
		border: 1px solid var(--border-color);
		color: var(--text-secondary);
		border-radius: 0.4rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		opacity: 0;
		transition: all 0.2s ease;
	}

	.code-wrapper:hover .hover-copy-btn,
	.hover-copy-btn:focus,
	.hover-copy-btn.copied {
		opacity: 1;
	}

	.hover-copy-btn:hover {
		background: var(--bg-secondary);
		color: var(--color-accent);
		border-color: var(--color-accent);
		transform: scale(1.1);
		box-shadow: 0 4px 12px var(--color-accent-glow);
	}

	.hover-copy-btn.copied,
	.copy-button.copied {
		color: #10b981;
		border-color: #10b981;
	}

	.command-block,
	.command-inline {
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
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

	.toast-notice {
		position: fixed;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		background: var(--glass-bg);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		color: var(--text-primary);
		border: 1px solid var(--glass-border);
		padding: 0.75rem 1.5rem;
		border-radius: 2rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		z-index: 1000;
		animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	@media (max-width: 48rem) {
		.toast-notice {
			width: max-content;
			max-width: 90vw;
			bottom: 5.5rem;
			white-space: nowrap;
		}
	}

	@media (min-width: 48rem) {
		.toast-notice {
			left: auto;
			right: 2rem;
			transform: none;
			animation: slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		}
	}

	@keyframes slideInRight {
		from {
			transform: translateX(30px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			transform: translate(-50%, 20px);
			opacity: 0;
		}
		to {
			transform: translate(-50%, 0);
			opacity: 1;
		}
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
		max-height: 350px;
		overflow-y: auto;
		padding-right: 0.5rem;
	}

	.contributors-list::-webkit-scrollbar {
		width: 6px;
	}
	.contributors-list::-webkit-scrollbar-track {
		background: transparent;
	}
	.contributors-list::-webkit-scrollbar-thumb {
		background: color-mix(in srgb, var(--text-muted) 30%, transparent);
		border-radius: 4px;
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
		max-height: 350px;
		overflow-y: auto;
		padding-right: 0.5rem;
	}

	.commit-contributors-list::-webkit-scrollbar {
		width: 6px;
	}
	.commit-contributors-list::-webkit-scrollbar-track {
		background: transparent;
	}
	.commit-contributors-list::-webkit-scrollbar-thumb {
		background: color-mix(in srgb, var(--text-muted) 30%, transparent);
		border-radius: 4px;
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

	.login-name {
		display: inline-block;
		transform: translateY(-1.5px);
	}

	.commit-contributor-card img {
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		display: block;
	}

	.author-highlight {
		border-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 8%, transparent);
	}

	.author-badge {
		font-size: 0.8rem;
		color: var(--color-accent);
		margin-left: 0.25rem;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		transform: translateY(-1.5px);
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

	@media (max-width: 48rem) {
		.mobile-only {
			display: flex;
			align-items: center;
			justify-content: center;
			min-width: 4rem;
		}
		.hover-copy-btn {
			display: none;
		}
		.author-text {
			display: none;
		}
		.commit-contributor-card {
			gap: 0.5rem;
			padding: 0.75rem;
		}
		.contributor-count {
			font-size: 0.8rem;
			text-align: right;
		}
	}
</style>
