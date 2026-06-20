<script lang="ts">
	import GithubBadge from '$lib/components/GithubBadge.svelte';
	import BansosForm from '$lib/components/BansosForm.svelte';
	import {
		bansosList,
		getCommitContributorStats,
		getContributorStats,
		type ContributorSummary
	} from '$lib/data/bansos';

	type TabId = 'form' | 'npx' | 'git' | 'ai';

	const contributors: ContributorSummary[] = getContributorStats();
	const commitContributors = getCommitContributorStats().sort((a, b) => {
		if (a.login === 'wauputr4') return -1;
		if (b.login === 'wauputr4') return 1;
		return 0;
	});

	const tabs: { id: TabId; label: string; icon: string }[] = [
		{ id: 'form', label: 'Form', icon: 'fa-solid fa-pen-to-square' },
		{ id: 'npx', label: 'npx CLI', icon: 'fa-solid fa-terminal' },
		{ id: 'git', label: 'Git Clone', icon: 'fa-solid fa-code-branch' },
		{ id: 'ai', label: 'AI Agent', icon: 'fa-solid fa-robot' }
	];

	let activeTab = $state<TabId>('form');

	const examples = bansosList.filter((i) => i.status === 'active').slice(0, 3);

	function generateNpxCommand(item: (typeof bansosList)[number]): string {
		const parts = [
			'npx bansosdev add \\',
			`  --id ${item.id} \\`,
			`  --title "${item.title}" \\`,
			`  --provider "${item.provider}" \\`,
			`  --description "${item.description}" \\`,
			`  --benefits "${item.benefits.join('|')}" \\`,
			`  --validity-type ${item.validity.type} \\`
		];

		if (item.validity.date) {
			parts.push(`  --validity-date ${item.validity.date} \\`);
		}
		if (item.validity.description) {
			parts.push(`  --validity-desc "${item.validity.description}" \\`);
		}

		parts.push(`  --requirements "${item.requirements.join('|')}" \\`);
		parts.push(`  --cta-link "${item.ctaLink}" \\`);
		parts.push(`  --tags "${item.tags.join(',')}"`);

		return parts.join('\n');
	}

	function generateGitCommand(item: (typeof bansosList)[number]): string {
		const branchName = `add/${item.id}`;
		const parts = [
			'git clone https://github.com/wauputr4/bansos.git',
			'cd bansos',
			'npm install',
			'',
			'npm run add:bansos -- \\',
			`  --id ${item.id} \\`,
			`  --title "${item.title}" \\`,
			`  --provider "${item.provider}" \\`,
			`  --description "${item.description}" \\`,
			`  --benefits "${item.benefits.join('|')}" \\`,
			`  --validity-type ${item.validity.type} \\`
		];

		if (item.validity.date) {
			parts.push(`  --validity-date ${item.validity.date} \\`);
		}
		if (item.validity.description) {
			parts.push(`  --validity-desc "${item.validity.description}" \\`);
		}

		parts.push(`  --requirements "${item.requirements.join('|')}" \\`);
		parts.push(`  --cta-link "${item.ctaLink}" \\`);
		parts.push(`  --tags "${item.tags.join(',')}"`);
		parts.push('');
		parts.push(`git checkout -b ${branchName}`);
		parts.push('git add .');
		parts.push(`git commit -m "feat: add ${item.title}"`);
		parts.push(`git push origin ${branchName}`);
		parts.push('');
		parts.push(
			`gh pr create --title "feat: add ${item.title}" --body "Added ${item.title} to bansos list" --base main`
		);

		return parts.join('\n');
	}

	function generateAiPrompt(item: (typeof bansosList)[number]): string {
		return `Use $bansos-add-entry to research and add this bansos to bansos.dev:\n\nTitle: ${item.title}\nURL: ${item.ctaLink}\n\nPlease research the source, verify the benefits and requirements, then prepare a valid submission.`;
	}

	const npxExamples = examples.map(generateNpxCommand);
	const gitExamples = examples.map(generateGitCommand);
	const aiExamples = examples.map(generateAiPrompt);

	const aiSkillInstall =
		"npx skills add wauputr4/skill-bansos --skill bansos-add-entry --agent '*'";

	let copiedId = $state('');
	let copiedNotice = $state('');

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
			Pilih cara kontribusi yang paling nyaman buat kamu. Semua cara di bawah akan menghasilkan
			payload JSON yang sama, lalu bot otomatis bikin Pull Request dari issue yang kamu submit.
		</p>

		<div class="repo-status-card">
			<p class="eyebrow">Open Source Repo</p>
			<GithubBadge />
		</div>

		<div class="tabs-container">
			<div class="tabs-header">
				{#each tabs as tab (tab.id)}
					<button
						class="tab-btn"
						class:active={activeTab === tab.id}
						onclick={() => (activeTab = tab.id)}
					>
						<i class={tab.icon}></i>
						<span>{tab.label}</span>
					</button>
				{/each}
			</div>

			<div class="tab-content">
				{#if activeTab === 'form'}
					<div class="tab-panel">
						<div class="tab-description">
							<h2>Isi form, langsung submit ke GitHub</h2>
							<p>
								Gak perlu CLI. Isi form di bawah, klik Submit, dan issue GitHub otomatis terbuka.
								Bot akan bikin PR dari issue tersebut.
							</p>
						</div>
						<div class="form-wrapper">
							<BansosForm />
						</div>
					</div>
				{:else if activeTab === 'npx'}
					<div class="tab-panel">
						<div class="tab-description">
							<h2>Via npx CLI</h2>
							<p>
								Pakai command line? Jalankan satu baris perintah ini di terminal kamu. Nanti URL
								issue GitHub otomatis muncul, tinggal buka dan submit. Bot langsung bikin PR-nya.
							</p>
						</div>
						<div class="examples-section">
							<span class="examples-label"><i class="fa-solid fa-lightbulb"></i> Pilih contoh:</span
							>
							<div class="examples-buttons">
								{#each examples as example, i (example.id)}
									<button
										type="button"
										class="example-btn"
										onclick={() => copyToClipboard(npxExamples[i], `npx-${i}`)}
										title={example.title}
									>
										<i class="fa-solid fa-arrow-right"></i>
										{example.provider}
									</button>
								{/each}
							</div>
						</div>
						<div class="command-block-wrapper">
							<div class="command-head">
								<span>npx bansosdev add</span>
								<button
									type="button"
									class="copy-btn"
									class:copied={copiedId === 'npx-0'}
									onclick={() => copyToClipboard(npxExamples[0], 'npx-0')}
								>
									<i class="fa-solid fa-{copiedId === 'npx-0' ? 'check' : 'clipboard'}"></i>
									{copiedId === 'npx-0' ? 'Tersalin' : 'Copy'}
								</button>
							</div>
							<pre class="command-block"><code>{npxExamples[0]}</code></pre>
						</div>
						<div class="tab-note">
							<p>
								<i class="fa-solid fa-circle-info"></i>
								Argumen <code>--benefits</code> dan <code>--requirements</code> dipisahkan dengan
								<code>|</code>. Argumen <code>--tags</code> dipisahkan dengan koma. Pakai
								<code>--mode json</code> untuk cek payload tanpa buka issue.
							</p>
						</div>
					</div>
				{:else if activeTab === 'git'}
					<div class="tab-panel">
						<div class="tab-description">
							<h2>Clone repo &amp; npm run add:bansos</h2>
							<p>
								Download repo-nya dulu, terus jalankan script lokal buat nambah data. Setelah itu
								kamu bisa review dulu sebelum bikin PR manual. Cocok buat yang mau lihat dulu
								hasilnya sebelum submit.
							</p>
						</div>
						<div class="examples-section">
							<span class="examples-label"><i class="fa-solid fa-lightbulb"></i> Pilih contoh:</span
							>
							<div class="examples-buttons">
								{#each examples as example, i (example.id)}
									<button
										type="button"
										class="example-btn"
										onclick={() => copyToClipboard(gitExamples[i], `git-${i}`)}
										title={example.title}
									>
										<i class="fa-solid fa-arrow-right"></i>
										{example.provider}
									</button>
								{/each}
							</div>
						</div>
						<div class="command-block-wrapper">
							<div class="command-head">
								<span>git clone + npm run add:bansos</span>
								<button
									type="button"
									class="copy-btn"
									class:copied={copiedId === 'git-0'}
									onclick={() => copyToClipboard(gitExamples[0], 'git-0')}
								>
									<i class="fa-solid fa-{copiedId === 'git-0' ? 'check' : 'clipboard'}"></i>
									{copiedId === 'git-0' ? 'Tersalin' : 'Copy'}
								</button>
							</div>
							<pre class="command-block"><code>{gitExamples[0]}</code></pre>
						</div>
						<div class="tab-note">
							<p>
								<i class="fa-solid fa-circle-info"></i>
								Setelah data masuk <code>bansos.json</code>, push branch kamu dan buka PR ke
								<code>main</code>. CI akan validasi data otomatis.
							</p>
						</div>
					</div>
				{:else if activeTab === 'ai'}
					<div class="tab-panel">
						<div class="tab-description">
							<h2>AI Agent Skill</h2>
							<p>
								Pakai AI agent kayak Claude, ChatGPT, atau yang lain? Install skill resmi bansos.dev
								biar agent-nya ngerti cara riset sumber dan bikin data yang valid sesuai format
								kita.
							</p>
						</div>
						<div class="command-block-wrapper">
							<div class="command-head">
								<span>Install skill untuk agent</span>
								<button
									type="button"
									class="copy-btn"
									class:copied={copiedId === 'ai-install'}
									onclick={() => copyToClipboard(aiSkillInstall, 'ai-install')}
								>
									<i class="fa-solid fa-{copiedId === 'ai-install' ? 'check' : 'clipboard'}"></i>
									{copiedId === 'ai-install' ? 'Tersalin' : 'Copy'}
								</button>
							</div>
							<pre class="command-block"><code>{aiSkillInstall}</code></pre>
						</div>
						<div class="examples-section">
							<span class="examples-label"
								><i class="fa-solid fa-lightbulb"></i> Contoh prompt:</span
							>
							<div class="examples-buttons">
								{#each examples as example, i (example.id)}
									<button
										type="button"
										class="example-btn"
										onclick={() => copyToClipboard(aiExamples[i], `ai-${i}`)}
										title={example.title}
									>
										<i class="fa-solid fa-arrow-right"></i>
										{example.provider}
									</button>
								{/each}
							</div>
						</div>
						<div class="command-block-wrapper">
							<div class="command-head">
								<span>Contoh prompt</span>
								<button
									type="button"
									class="copy-btn"
									class:copied={copiedId === 'ai-0'}
									onclick={() => copyToClipboard(aiExamples[0], 'ai-0')}
								>
									<i class="fa-solid fa-{copiedId === 'ai-0' ? 'check' : 'clipboard'}"></i>
									{copiedId === 'ai-0' ? 'Tersalin' : 'Copy'}
								</button>
							</div>
							<pre class="command-block"><code>{aiExamples[0]}</code></pre>
						</div>
						<a
							href="https://www.skills.sh/wauputr4/skill-bansos"
							target="_blank"
							rel="noopener noreferrer"
							class="skill-link"
						>
							Lihat skill di skills.sh
							<i class="fa-solid fa-arrow-up-right-from-square"></i>
						</a>
					</div>
				{/if}
			</div>
		</div>

		{#if copiedNotice}
			<div class="toast-notice">
				<i class="fa-solid fa-circle-check"></i>
				{copiedNotice}
			</div>
		{/if}

		<section class="contributors-section">
			<h2 class="section-title">
				<i class="fa-solid fa-code-commit"></i>
				Kontributor Proyek
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
				<i class="fa-solid fa-users"></i>
				Kontributor Terdaftar
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

	.tabs-container {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.tabs-header {
		display: flex;
		border-bottom: 1px solid var(--border-color);
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		overflow-x: auto;
	}

	.tab-btn {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.85rem 1.25rem;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--text-secondary);
		font-family: inherit;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.tab-btn:hover {
		color: var(--text-primary);
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
	}

	.tab-btn.active {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 6%, transparent);
	}

	.tab-content {
		padding: 1.5rem;
	}

	.tab-panel {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.tab-description {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.tab-description h2 {
		margin: 0;
		color: var(--text-primary);
		font-size: 1.25rem;
		font-weight: 800;
	}

	.tab-description p {
		margin: 0;
	}

	.form-wrapper {
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		padding: 1.25rem;
		background: color-mix(in srgb, var(--text-primary) 3%, transparent);
	}

	.examples-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border: 1px solid color-mix(in srgb, var(--color-accent) 25%, var(--border-color));
		border-radius: 0.6rem;
		background: color-mix(in srgb, var(--color-accent) 5%, transparent);
	}

	.examples-label {
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		gap: 0.35rem;
	}

	.examples-label i {
		color: var(--color-accent);
	}

	.examples-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	.example-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: transparent;
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		color: var(--text-secondary);
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 650;
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.example-btn:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 8%, transparent);
	}

	.example-btn i {
		font-size: 0.6rem;
	}

	.command-block-wrapper {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		overflow: hidden;
	}

	.command-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.6rem 1rem;
		background: color-mix(in srgb, var(--text-primary) 6%, transparent);
		border-bottom: 1px solid var(--border-color);
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.copy-btn {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		background: transparent;
		border: 1px solid var(--border-color);
		border-radius: 0.4rem;
		color: var(--text-secondary);
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 700;
		padding: 0.3rem 0.6rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.copy-btn:hover {
		background: rgba(255, 255, 255, 0.08);
		border-color: var(--color-accent);
		color: var(--color-accent);
	}

	.copy-btn.copied {
		color: #10b981;
		border-color: #10b981;
	}

	.command-block {
		margin: 0;
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

	.tab-note {
		background: color-mix(in srgb, var(--color-accent) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-accent) 20%, var(--border-color));
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
	}

	.tab-note p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.85rem;
	}

	.tab-note code {
		color: var(--color-accent);
		font-weight: 700;
	}

	.skill-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: var(--color-accent);
		font-size: 0.9rem;
		font-weight: 750;
		text-decoration: none;
		align-self: flex-start;
	}

	.skill-link:hover {
		text-decoration: underline;
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
		.page-wrapper {
			padding-block: 0.75rem 2.25rem;
		}
		.content-shell {
			gap: 0.75rem;
		}
		.tab-content {
			padding: 0.85rem;
		}
		.tab-panel {
			gap: 0.85rem;
		}
		.form-wrapper {
			padding: 0.85rem;
			border-radius: 0.6rem;
		}
		.tab-btn span {
			display: none;
		}
		.tab-btn {
			padding: 0.85rem;
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
