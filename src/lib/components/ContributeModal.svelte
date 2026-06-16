<script lang="ts">
	import BansosForm from '$lib/components/BansosForm.svelte';
	import { bansosList } from '$lib/data/bansos';

	let { open = $bindable(false) } = $props();

	type TabId = 'form' | 'npx' | 'git' | 'ai';

	let activeTab = $state<TabId>('form');

	const tabs: { id: TabId; label: string; icon: string }[] = [
		{ id: 'form', label: 'Form', icon: 'fa-solid fa-pen-to-square' },
		{ id: 'npx', label: 'npx', icon: 'fa-solid fa-terminal' },
		{ id: 'git', label: 'Git Clone', icon: 'fa-solid fa-code-branch' },
		{ id: 'ai', label: 'AI Agent', icon: 'fa-solid fa-robot' }
	];

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
		parts.push(`  --tags "${item.tags.join(',')}" \\`);
		parts.push(`  --status ${item.status}`);

		return parts.join('\n');
	}

	function generateGitCommand(item: (typeof bansosList)[number]): string {
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
		parts.push(`  --tags "${item.tags.join(',')}" \\`);
		parts.push(`  --status ${item.status}`);
		parts.push('');
		parts.push('# Lalu buat PR manual');

		return parts.join('\n');
	}

	function generateAiPrompt(item: (typeof bansosList)[number]): string {
		return `Use $bansos-add-entry to research and add this bansos to bansos.dev:\n\nTitle: ${item.title}\nProvider: ${item.provider}\nURL: ${item.ctaLink}\n\nPlease research the source, verify the benefits and requirements, then prepare a valid submission.`;
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
			copiedNotice = 'Tersalin!';
			setTimeout(() => {
				if (copiedId === id) copiedId = '';
				copiedNotice = '';
			}, 2000);
		} catch {
			copiedNotice = 'Gagal copy';
			setTimeout(() => {
				copiedNotice = '';
			}, 2200);
		}
	};

	function closeModal() {
		open = false;
		activeTab = 'form';
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			closeModal();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			closeModal();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop" onclick={handleBackdropClick}>
		<div class="modal-container" role="dialog" aria-modal="true" aria-label="Tambah Bansos">
			<div class="modal-header">
				<h2>Tambah Bansos Baru</h2>
				<button class="modal-close" onclick={closeModal} aria-label="Tutup">
					<i class="fa-solid fa-times"></i>
				</button>
			</div>

			<div class="modal-tabs">
				{#each tabs as tab (tab.id)}
					<button
						class="modal-tab"
						class:active={activeTab === tab.id}
						onclick={() => (activeTab = tab.id)}
					>
						<i class={tab.icon}></i>
						<span>{tab.label}</span>
					</button>
				{/each}
			</div>

			<div class="modal-body">
				{#if activeTab === 'form'}
					<div class="tab-content">
						<p class="tab-description">
							Isi form di bawah, lalu klik Submit. Issue GitHub otomatis terbuka dan bot akan
							membuat PR.
						</p>
						<BansosForm />
					</div>
				{:else if activeTab === 'npx'}
					<div class="tab-content">
						<p class="tab-description">
							Pakai command line? Jalankan satu baris perintah ini di terminal kamu. Nanti URL issue
							GitHub otomatis muncul, tinggal buka dan submit. Bot langsung bikin PR-nya.
						</p>
						<div class="examples-section">
							<span class="examples-label"><i class="fa-solid fa-lightbulb"></i> Pilih contoh:</span
							>
							<div class="examples-buttons">
								{#each examples as example, i (example.id)}
									<button
										type="button"
										class="example-btn"
										onclick={() => copyToClipboard(npxExamples[i], `npx-${i}`)}
									>
										<i class="fa-solid fa-arrow-right"></i>
										{example.title.length > 35 ? example.title.slice(0, 35) + '...' : example.title}
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
								<i class="fa-solid fa-circle-info"></i> Argumen <code>--benefits</code> dan
								<code>--requirements</code>
								dipisahkan dengan <code>|</code>. Argumen <code>--tags</code> dipisahkan dengan koma.
							</p>
						</div>
					</div>
				{:else if activeTab === 'git'}
					<div class="tab-content">
						<p class="tab-description">
							Download repo-nya dulu, terus jalankan script lokal buat nambah data. Setelah itu kamu
							bisa review dulu sebelum bikin PR manual. Cocok buat yang mau lihat dulu hasilnya
							sebelum submit.
						</p>
						<div class="examples-section">
							<span class="examples-label"><i class="fa-solid fa-lightbulb"></i> Pilih contoh:</span
							>
							<div class="examples-buttons">
								{#each examples as example, i (example.id)}
									<button
										type="button"
										class="example-btn"
										onclick={() => copyToClipboard(gitExamples[i], `git-${i}`)}
									>
										<i class="fa-solid fa-arrow-right"></i>
										{example.title.length > 35 ? example.title.slice(0, 35) + '...' : example.title}
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
								<i class="fa-solid fa-circle-info"></i> Setelah data masuk <code>bansos.json</code>,
								push branch kamu dan buka PR ke <code>main</code>.
							</p>
						</div>
					</div>
				{:else if activeTab === 'ai'}
					<div class="tab-content">
						<p class="tab-description">
							Pakai AI agent kayak Claude, ChatGPT, atau yang lain? Install skill resmi bansos.dev
							biar agent-nya ngerti cara riset sumber dan bikin data yang valid sesuai format kita.
						</p>
						<div class="command-block-wrapper">
							<div class="command-head">
								<span>Install skill</span>
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
									>
										<i class="fa-solid fa-arrow-right"></i>
										{example.title.length > 35 ? example.title.slice(0, 35) + '...' : example.title}
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
							Lihat skill di skills.sh <i class="fa-solid fa-arrow-up-right-from-square"></i>
						</a>
					</div>
				{/if}
			</div>

			{#if copiedNotice}
				<div class="toast-notice">
					<i class="fa-solid fa-circle-check"></i>
					{copiedNotice}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 2rem 1rem;
		overflow-y: auto;
		animation: fadeIn 0.2s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-container {
		background: var(--bg-primary);
		border: 1px solid var(--glass-border);
		border-radius: 1rem;
		width: 100%;
		max-width: 48rem;
		position: relative;
		display: flex;
		flex-direction: column;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
		animation: slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--text-primary);
	}

	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		background: transparent;
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		color: var(--text-secondary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.modal-close:hover {
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.3);
		color: #ef4444;
	}

	.modal-tabs {
		display: flex;
		gap: 0;
		padding: 0 1.5rem;
		border-bottom: 1px solid var(--border-color);
		overflow-x: auto;
	}

	.modal-tab {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.75rem 1rem;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--text-secondary);
		font-family: inherit;
		font-size: 0.85rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
		white-space: nowrap;
	}

	.modal-tab:hover {
		color: var(--text-primary);
	}

	.modal-tab.active {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
	}

	.modal-body {
		padding: 1.5rem;
		max-height: 70vh;
		overflow-y: auto;
	}

	.tab-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.tab-description {
		color: var(--text-secondary);
		font-size: 0.9rem;
		margin: 0;
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
		gap: 0.5rem;
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
	}

	.skill-link:hover {
		text-decoration: underline;
	}

	.toast-notice {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		background: var(--glass-bg);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		color: var(--text-primary);
		border: 1px solid var(--glass-border);
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		font-weight: 700;
		font-size: 0.85rem;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
		animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 48rem) {
		.modal-backdrop {
			padding: 0;
			align-items: flex-end;
		}

		.modal-container {
			max-width: 100%;
			border-radius: 1rem 1rem 0 0;
			max-height: 90vh;
		}

		.modal-body {
			max-height: 60vh;
		}

		.modal-tab span {
			display: none;
		}

		.modal-tab {
			padding: 0.75rem;
		}
	}
</style>
