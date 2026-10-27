<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve */
	import GithubBadge from '$lib/components/GithubBadge.svelte';
	import SubmissionFields from '$lib/components/SubmissionFields.svelte';
	import { resolve } from '$app/paths';
	import { t } from '$lib/i18n';
	import { get } from 'svelte/store';
	import { locale } from 'svelte-i18n';
	import {
		getContributorInitials,
		getContributorStats,
		type ContributorSummary
	} from '$lib/data/bansos';
	let { data, form } = $props();
	const loginHref = $derived(
		data.demoMode ? '/auth/demo?as=user&next=contribute' : '/auth/github?next=contribute'
	);

	type TabId = 'form' | 'ai' | 'email' | 'discord' | 'telegram';

	const contributors: ContributorSummary[] = getContributorStats();

	let tabs = $derived<{ id: TabId; label: string; icon: string; inactive?: boolean }[]>([
		{ id: 'form', label: $t('contribute.tabs.form'), icon: 'fa-solid fa-pen-to-square' },
		{
			id: 'discord',
			label: $t('contribute.tabs.discord'),
			icon: 'fa-brands fa-discord',
			inactive: true
		},
		{
			id: 'telegram',
			label: $t('contribute.tabs.telegram'),
			icon: 'fa-brands fa-telegram',
			inactive: true
		}
	]);

	let activeTab = $state<TabId>('form');
	const aiInstallCommand = "npx skills add wauputr4/skill-bansos --skill '*' --agent '*'";

	const emailTemplate = $derived(
		($locale || 'id') === 'en'
			? `Hello bansos.dev team,

I would like to submit a new bansos entry for the directory. Here are the details:

Submission: New Bansos
ID/Slug: [example: provider-free-promo]
Title: [Bansos name]
Provider: [Provider name]
Provider Logo URL: [optional, logo/favicon URL]
Description: [Short description]

Benefits:
- [Benefit 1]
- [Benefit 2]

Promo Code: [optional]

Validity:
- Type: [fixed/uncertain/forever]
- Date: [YYYY-MM-DD, if fixed]
- Description: [example: while quota lasts]

Claim Requirements:
1. [Requirement 1]
2. [Requirement 2]

Tips: [optional, safest claim method]
Claim Link: [Official URL]
Source: [Official source/post URL]
Categories/Tags: [AI, Cloud, Domain, etc]
Featured: [true/false]
Status: [active/upcoming]

Why this bansos deserves to be listed and is NOT a violation:
[Explain why this is legitimate, non-abusive, and complies with ToS]

Contributor: [Your name]

Thank you,
[Your name]`
			: `Halo tim bansos.dev,

Saya ingin mengusulkan bansos baru untuk ditambahkan ke direktori. Berikut detailnya:

Usulan: Bansos Baru
ID/Slug: [contoh: provider-promo-gratis]
Judul: [Nama bansos]
Provider: [Nama provider]
Provider Logo URL: [opsional, URL logo/favicon]
Deskripsi: [Deskripsi singkat]

Benefit:
- [Benefit 1]
- [Benefit 2]

Promo Code: [opsional]

Validitas:
- Tipe: [fixed/uncertain/forever]
- Tanggal: [YYYY-MM-DD, jika fixed]
- Deskripsi: [contoh: selama kuota tersedia]

Syarat Klaim:
1. [Syarat 1]
2. [Syarat 2]

Tips: [opsional, cara klaim paling aman]
Link Klaim: [URL resmi]
Sumber Info: [URL sumber resmi/postingan]
Kategori/Tags: [AI, Cloud, Domain, dll]
Featured: [true/false]
Status: [active/upcoming]

Alasan kenapa bansos ini layak masuk dan BUKAN violation:
[Jelaskan kenapa ini legitimate, tidak abusive, dan sesuai ToS]

Kontributor: [Nama kamu]

Terima kasih,
[Nama kamu]`
	);
	const emailHref = $derived(
		`mailto:submit@bansos.dev?subject=${encodeURIComponent(
			$t('contribute.emailSubject')
		)}&body=${encodeURIComponent(emailTemplate)}`
	);

	let copiedId = $state('');
	let copiedNotice = $state('');
	const copyToClipboard = async (text: string, id: string) => {
		try {
			await navigator.clipboard.writeText(text);
			copiedId = id;
			copiedNotice = (get(t) as (id: string) => string)('contribute.toastCopied');
			setTimeout(() => {
				if (copiedId === id) copiedId = '';
				copiedNotice = '';
			}, 2000);
		} catch {
			copiedNotice = (get(t) as (id: string) => string)('contribute.toastCopyFailed');
			setTimeout(() => {
				copiedNotice = '';
			}, 2200);
		}
	};
</script>

<svelte:head>
	<title>{$t('meta.contribTitle')}</title>
	<meta name="description" content={$t('meta.contribDesc')} />
	<link rel="canonical" href="https://bansos.dev/contribute/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://bansos.dev/contribute/" />
	<meta property="og:title" content={$t('meta.contribTitle')} />
	<meta property="og:description" content={$t('meta.contribDesc')} />
	<meta property="og:image" content="https://bansos.dev/og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://bansos.dev/contribute/" />
	<meta name="twitter:title" content={$t('meta.contribTitle')} />
	<meta name="twitter:description" content={$t('meta.contribDesc')} />
	<meta name="twitter:image" content="https://bansos.dev/og.png" />
</svelte:head>

<main class="page-wrapper">
	<section class="container content-shell">
		<p class="eyebrow">{$t('contribute.eyebrow')}</p>
		<h1 class="text-gradient">{$t('contribute.h1')}</h1>
		<p>
			{$t('contribute.intro')}
		</p>

		{#if activeTab !== 'form'}
			<div class="integrity-warning-banner glass-card">
				<i class="fa-solid fa-shield-halved warning-icon"></i>
				<div class="banner-content">
					<h4>{$t('contribute.warningTitle')}</h4>
					<p>
						{$t('contribute.warningText')}
					</p>
				</div>
			</div>

			<div class="referral-policy-banner glass-card">
				<i class="fa-solid fa-circle-exclamation info-icon"></i>
				<div class="banner-content">
					<h4>{$t('contribute.referralTitle')}</h4>
					<p>
						{$t('contribute.referralText')}
					</p>
				</div>
			</div>

			<div class="repo-status-card">
				<p class="eyebrow">{$t('contribute.repoEyebrow')}</p>
				<GithubBadge />
			</div>
		{/if}

		<div class="tabs-container" id="form">
			<div class="tabs-header">
				{#each tabs as tab (tab.id)}
					<button
						type="button"
						class="tab-btn"
						class:active={activeTab === tab.id}
						class:muted-tab={tab.inactive}
						disabled={tab.inactive}
						title={tab.inactive ? 'Pengajuan sekarang hanya lewat form setelah login' : undefined}
						onclick={() => {
							if (!tab.inactive) activeTab = tab.id;
						}}
					>
						<i class={tab.icon}></i>
						<span>{tab.label}</span>
						{#if tab.inactive}<i class="fa-solid fa-lock disabled-lock" aria-hidden="true"></i>{/if}
					</button>
				{/each}
			</div>

			<div class="tab-content">
				{#if activeTab === 'form'}
					<div class="form-layout">
						<div class="editor-card">
							<div class="editor-intro">
								<span class="editor-eyebrow"
									><i class="fa-solid fa-pen-to-square"></i> USULAN BARU</span
								>
								<h2>Bagikan bansos untuk developer</h2>
								<p>
									Isi informasi program secara lengkap. Admin akan meninjau usulanmu sebelum tampil
									di katalog.
								</p>
							</div>
							<p>
								Login memakai profil GitHub, tanpa meminta akses repository atau scope email. Dengan
								mengirim kontribusi, kamu menyetujui <a href={resolve('/terms/')}
									>Syarat Penggunaan</a
								>
								dan memahami <a href={resolve('/privacy/')}>Kebijakan Privasi</a>. Jangan sertakan
								rahasia atau data sensitif.
							</p>
							{#if !data.viewer}
								<div class="login-gate">
									<div class="gate-icon"><i class="fa-brands fa-github"></i></div>
									<h3>Masuk untuk mengirim usulan</h3>
									<p>
										Login GitHub menghubungkan kontribusi dengan akunmu. Form akan terbuka setelah
										kamu masuk.
									</p>
									<a class="primary-action" href={loginHref}
										><i class="fa-brands fa-github"></i>
										{data.demoMode
											? 'Masuk sebagai demo kontributor'
											: 'Lanjutkan dengan GitHub'}</a
									>
								</div>
							{:else if data.viewer.banned_at}
								<p class="form-notice" role="alert">
									Akun ini tidak dapat mengirim usulan. Hubungi admin bila menurutmu ada kesalahan.
								</p>
							{:else}
								{#if form?.message}<p class="form-notice" role="alert">{form.message}</p>{/if}
								<form method="POST" action="?/create" class="submission-form">
									<SubmissionFields draft={form?.values} idPrefix="contribute-new" />
									<div class="form-footer">
										<p>
											<i class="fa-solid fa-shield-halved"></i> Semua usulan masuk antrean review. Status
											Featured hanya ditentukan admin.
										</p>
										<button type="submit" class="primary-action"
											>Kirim untuk review <i class="fa-solid fa-arrow-right"></i></button
										>
									</div>
								</form>
							{/if}
						</div>
						<aside class="form-sidebar" aria-label="Panduan kontribusi">
							<div class="side-card">
								<span class="side-label"
									><i class="fa-solid fa-list-check"></i> ALUR KONTRIBUSI</span
								>
								<ol>
									<li>Masuk dengan akun GitHub.</li>
									<li>Lengkapi detail program dan sumber resmi.</li>
									<li>Admin meninjau sebelum menerbitkan.</li>
								</ol>
							</div>
							<div class="side-card">
								<span class="side-label"
									><i class="fa-solid fa-shield-halved"></i> SEBELUM MENGIRIM</span
								>
								<p>
									Pastikan promonya sah, masih berlaku, dan bukan hasil bug atau pelanggaran syarat
									layanan. Sampaikan syarat, batas, dan biaya dengan jelas.
								</p>
							</div>
							{#if data.viewer}<a class="side-link" href="/dashboard/"
									>Lihat usulan saya <i class="fa-solid fa-arrow-right"></i></a
								>{/if}
						</aside>
					</div>
				{:else if activeTab === 'ai'}
					<div class="tab-panel">
						<div class="tab-description">
							<h2>{$t('contribute.aiTitle')}</h2>
							<p>{$t('contribute.aiDesc')}</p>
						</div>
						<div class="command-block-wrapper">
							<div class="command-head">
								<span>{$t('contribute.aiInstallHead')}</span>
								<button
									type="button"
									class="copy-btn"
									class:copied={copiedId === 'ai-install'}
									onclick={() => copyToClipboard(aiInstallCommand, 'ai-install')}
								>
									<i class="fa-solid fa-{copiedId === 'ai-install' ? 'check' : 'clipboard'}"></i>
									{copiedId === 'ai-install'
										? $t('contribute.gitCopied')
										: $t('contribute.gitCopy')}
								</button>
							</div>
							<pre class="command-block"><code>{aiInstallCommand}</code></pre>
						</div>
						<div class="tab-note">
							<p><i class="fa-solid fa-circle-info"></i> {$t('contribute.aiPrompt')}</p>
						</div>
						<a
							class="skill-link"
							href="https://www.skills.sh/wauputr4/skill-bansos"
							target="_blank"
							rel="noopener noreferrer"
						>
							<i class="fa-solid fa-arrow-up-right-from-square"></i>
							{$t('contribute.aiOpenSkill')}
						</a>
					</div>
				{:else if activeTab === 'email'}
					<div class="tab-panel">
						<div class="tab-description">
							<h2>{$t('contribute.emailTitle')}</h2>
							<p>
								{$t('contribute.emailDesc')}
							</p>
							<div class="integrity-note">
								<i class="fa-solid fa-shield-halved"></i>
								<p>
									{$t('contribute.emailIntegrity')}
								</p>
							</div>
							<div class="email-submit-card">
								<div class="email-icon">
									<i class="fa-solid fa-envelope"></i>
								</div>
								<h3>{$t('contribute.emailTo')}</h3>
								<a href={emailHref} target="_blank" class="email-send-btn">
									<i class="fa-solid fa-paper-plane"></i>
									{$t('contribute.emailSendBtn')}
								</a>
								<p class="email-hint">
									{$t('contribute.emailHint')}
								</p>
								<pre class="email-template">{emailTemplate}</pre>
							</div>
						</div>
					</div>
				{:else if activeTab === 'discord'}
					<div class="tab-panel">
						<div class="tab-description">
							<h2>{$t('contribute.discordTitle')}</h2>
							<p>
								{$t('contribute.discordDesc')}
							</p>
						</div>
						<div class="discord-coming-soon-card">
							<div class="coming-soon-icon">
								<i class="fa-brands fa-discord"></i>
							</div>
							<h3>{$t('contribute.discordCardTitle')}</h3>
							<span class="status-badge-soon">{$t('contribute.discordBadge')}</span>
							<p>
								{$t('contribute.discordCardDesc')}
							</p>
							<a
								href="https://discord.gg/m4WFaQpNGs"
								target="_blank"
								rel="noopener noreferrer"
								class="discord-join-btn"
							>
								<i class="fa-brands fa-discord"></i>
								{$t('contribute.discordJoinBtn')}
							</a>
						</div>
					</div>
				{:else if activeTab === 'telegram'}
					<div class="tab-panel">
						<div class="tab-description">
							<h2>{$t('contribute.telegramTitle')}</h2>
							<p>
								{$t('contribute.telegramDesc')}
							</p>
						</div>
						<div class="telegram-coming-soon-card">
							<div class="coming-soon-icon">
								<i class="fa-brands fa-telegram"></i>
							</div>
							<h3>{$t('contribute.telegramCardTitle')}</h3>
							<span class="status-badge-soon">{$t('contribute.telegramBadge')}</span>
							<p>
								{$t('contribute.telegramCardDesc')}
							</p>
							<a
								href="https://t.me/bansos_dev"
								target="_blank"
								rel="noopener noreferrer"
								class="telegram-join-btn"
							>
								<i class="fa-brands fa-telegram"></i>
								{$t('contribute.telegramJoinBtn')}
							</a>
						</div>
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

		<div class="contributor-tabs-container">
			<div class="contributor-tab-content">
				<div class="contrib-tab-panel">
					<h2 class="section-title">
						<i class="fa-solid fa-users"></i>
						{$t('contribute.communityTitle')} ({contributors.length})
					</h2>
					<p class="section-note">{$t('contribute.communityDesc')}</p>
					{#if contributors.length > 0}
						<ul class="commit-contributors-list">
							{#each contributors as contributor (contributor.login)}
								<li class="commit-contributor-card">
									<a href={resolve('/[slug]', { slug: contributor.login })}>
										{#if contributor.avatar}
											<img src={contributor.avatar} alt={contributor.name} loading="lazy" />
										{:else}
											<span class="contributor-initial" aria-hidden="true">
												{getContributorInitials(contributor.name)}
											</span>
										{/if}
										<span class="login-name">{contributor.name}</span>
										{#if contributor.hasGithub}
											<i class="fa-brands fa-github" aria-label="GitHub"></i>
										{/if}
									</a>
									<span class="contributor-count">
										{$t('contribute.communityCount', { values: { count: contributor.count } })}
										{#if contributor.editCount > 0}
											· {$t('contribute.communityEditCount', {
												values: { count: contributor.editCount }
											})}
										{/if}
									</span>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="empty-contributor">{$t('contribute.communityEmpty')}</p>
					{/if}
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	.page-wrapper {
		padding-block: 2rem 3rem;
	}

	.content-shell {
		max-width: 80rem;
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

	.muted-tab {
		opacity: 0.55;
		filter: grayscale(40%);
	}

	.muted-tab:hover {
		opacity: 0.55;
	}
	.tab-btn:disabled {
		cursor: not-allowed;
	}
	.tab-btn:disabled:hover {
		color: var(--text-secondary);
		background: transparent;
	}
	.disabled-lock {
		font-size: 0.65rem;
		opacity: 0.85;
	}

	.tab-content {
		padding: 1.5rem;
	}

	.tab-panel {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		max-width: 52rem;
	}

	.form-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(15rem, 18rem);
		gap: 1.5rem;
		align-items: start;
	}
	.editor-card {
		min-width: 0;
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		background: var(--bg-secondary);
		padding: clamp(1.25rem, 3vw, 2.5rem);
	}
	.editor-intro {
		padding-bottom: 1.5rem;
		margin-bottom: 1.75rem;
		border-bottom: 1px solid var(--border-color);
	}
	.editor-eyebrow,
	.side-label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--color-accent);
		font-size: 0.73rem;
		font-weight: 800;
		letter-spacing: 0.08em;
	}
	.editor-intro h2 {
		font-size: clamp(1.65rem, 3vw, 2.35rem);
		margin: 0.75rem 0 0.5rem;
		color: var(--color-accent);
		line-height: 1.2;
	}
	.editor-intro p {
		line-height: 1.6;
	}
	.form-sidebar {
		display: grid;
		gap: 1rem;
	}
	.side-card {
		border: 1px solid var(--border-color);
		border-radius: 0.85rem;
		padding: 1.2rem;
		background: var(--bg-secondary);
	}
	.side-card p,
	.side-card li {
		margin-top: 0.7rem;
		font-size: 0.84rem;
		line-height: 1.55;
	}
	.side-card ol {
		margin: 0.5rem 0 0;
		padding-left: 1.2rem;
	}
	.side-link {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.85rem 1rem;
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.login-gate {
		display: grid;
		justify-items: start;
		gap: 0.75rem;
		max-width: 32rem;
		padding: 1rem 0 0.5rem;
	}
	.gate-icon {
		display: grid;
		place-items: center;
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 0.85rem;
		color: var(--color-accent);
		background: var(--color-accent-glow);
		font-size: 1.5rem;
	}
	.login-gate h3 {
		color: var(--text-primary);
		font-size: 1.4rem;
		margin: 0.25rem 0 0;
	}
	.login-gate p {
		line-height: 1.6;
	}
	.primary-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.65rem;
		border: 0;
		border-radius: 0.7rem;
		background: var(--color-accent);
		color: #06130f;
		font: inherit;
		font-weight: 800;
		padding: 0.85rem 1.15rem;
		cursor: pointer;
		text-decoration: none;
	}
	.primary-action:hover {
		filter: brightness(1.08);
		color: #06130f;
	}
	.form-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		border-top: 1px solid var(--border-color);
		margin-top: 1.75rem;
		padding-top: 1.5rem;
	}
	.form-footer p {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		max-width: 24rem;
		font-size: 0.8rem;
		line-height: 1.5;
	}
	.form-footer i {
		color: var(--color-accent);
	}
	.form-notice {
		padding: 0.9rem 1rem;
		border: 1px solid #f59e0b;
		border-radius: 0.65rem;
		margin-bottom: 1.25rem;
	}
	@media (max-width: 52rem) {
		.form-layout {
			grid-template-columns: 1fr;
		}
		.form-sidebar {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.side-link {
			grid-column: 1 / -1;
		}
	}
	@media (max-width: 38rem) {
		.tab-content {
			padding: 0.75rem;
		}
		.form-sidebar {
			grid-template-columns: 1fr;
		}
		.editor-card {
			padding: 1.25rem;
		}
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
		object-fit: cover;
	}

	.contributor-initial {
		width: 2rem;
		height: 2rem;
		border-radius: 999px;
		display: grid;
		place-items: center;
		background: var(--color-accent);
		color: var(--bg-primary);
		font-weight: 900;
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
		.tab-btn span {
			display: none;
		}
		.tab-btn.active span {
			display: inline;
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

	.discord-coming-soon-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 3rem 2rem;
		border: 1px dashed rgba(88, 101, 242, 0.35);
		border-radius: 1rem;
		background: rgba(88, 101, 242, 0.02);
		margin-top: 1.5rem;
		gap: 1rem;
	}

	.coming-soon-icon {
		font-size: 3.5rem;
		color: #5865f2;
		animation: pulse-slow 2s infinite alternate;
	}

	.discord-coming-soon-card h3 {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
	}

	.status-badge-soon {
		background: rgba(16, 185, 129, 0.1);
		color: var(--color-success);
		font-size: 0.75rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.25rem 0.75rem;
		border-radius: 999px;
		border: 1px solid rgba(16, 185, 129, 0.2);
	}

	.discord-coming-soon-card p {
		color: var(--text-secondary);
		max-width: 24rem;
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.discord-join-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: #fff;
		font-size: 0.9rem;
		font-weight: 750;
		padding: 0.55rem 1.1rem;
		border-radius: 999px;
		background: #5865f2;
		box-shadow: 0 4px 12px rgba(88, 101, 242, 0.3);
		transition: all 0.2s ease;
		text-decoration: none;
		margin-top: 0.5rem;
	}

	.discord-join-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(88, 101, 242, 0.4);
		color: #fff;
	}

	.telegram-coming-soon-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 3rem 2rem;
		border: 1px dashed rgba(34, 158, 217, 0.35);
		border-radius: 1rem;
		background: rgba(34, 158, 217, 0.02);
		margin-top: 1.5rem;
		gap: 1rem;
	}

	.telegram-coming-soon-card h3 {
		font-size: 1.25rem;
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
	}

	.telegram-coming-soon-card p {
		color: var(--text-secondary);
		max-width: 24rem;
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.5;
	}

	.telegram-join-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: #fff;
		font-size: 0.9rem;
		font-weight: 750;
		padding: 0.55rem 1.1rem;
		border-radius: 999px;
		background: #229ed9;
		box-shadow: 0 4px 12px rgba(34, 158, 217, 0.3);
		transition: all 0.2s ease;
		text-decoration: none;
		margin-top: 0.5rem;
	}

	.telegram-join-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 6px 16px rgba(34, 158, 217, 0.4);
		color: #fff;
	}

	@keyframes pulse-slow {
		0% {
			transform: scale(1);
			opacity: 0.8;
		}
		100% {
			transform: scale(1.08);
			opacity: 1;
		}
	}

	.contributor-tabs-container {
		margin-top: 3.5rem;
		border: 1px solid var(--border-color);
		border-radius: 1.25rem;
		background: rgba(255, 255, 255, 0.02);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.contributor-tabs-header {
		display: flex;
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 0.5rem;
		gap: 1.5rem;
	}

	.contrib-tab-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: transparent;
		border: none;
		border-bottom: 2px solid transparent;
		color: var(--text-secondary);
		font-family: inherit;
		font-size: 1rem;
		font-weight: 750;
		padding: 0.5rem 0.25rem;
		cursor: pointer;
		transition: all 0.2s ease;
		padding-bottom: 0.75rem;
		margin-bottom: -0.6rem;
	}

	.contrib-tab-btn:hover {
		color: var(--text-primary);
	}

	.contrib-tab-btn.active {
		color: var(--color-accent);
		border-bottom-color: var(--color-accent);
	}

	.contrib-tab-panel {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.referral-policy-banner {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.25rem;
		border-left: 4px solid var(--color-accent);
		background: rgba(16, 185, 129, 0.03);
		border-radius: 0.75rem;
		margin-bottom: 0.5rem;
		text-align: left;
	}

	.referral-policy-banner .info-icon {
		font-size: 1.35rem;
		color: var(--color-accent);
		margin-top: 0.15rem;
	}

	.banner-content h4 {
		font-size: 1rem;
		font-weight: 800;
		color: var(--text-primary);
		margin: 0 0 0.35rem;
	}

	.banner-content p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.45;
		margin: 0;
	}

	.integrity-warning-banner {
		display: flex;
		align-items: flex-start;
		gap: 1rem;
		padding: 1.25rem;
		border-left: 4px solid #ef4444;
		background: rgba(239, 68, 68, 0.04);
		border-radius: 0.75rem;
		margin-bottom: 0.5rem;
		text-align: left;
	}

	.integrity-warning-banner .warning-icon {
		font-size: 1.35rem;
		color: #ef4444;
		margin-top: 0.15rem;
	}

	.integrity-warning-banner h4 {
		font-size: 1rem;
		font-weight: 800;
		color: #ef4444;
		margin: 0 0 0.35rem;
	}

	.integrity-warning-banner p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		line-height: 1.45;
		margin: 0;
	}

	.integrity-note {
		display: flex;
		align-items: flex-start;
		gap: 0.7rem;
		padding: 0.85rem 1rem;
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 0.6rem;
		background: rgba(239, 68, 68, 0.04);
	}

	.integrity-note i {
		font-size: 1.1rem;
		color: #ef4444;
		margin-top: 0.1rem;
		flex-shrink: 0;
	}

	.integrity-note p {
		margin: 0;
		font-size: 0.85rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}

	.email-submit-card {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		background: rgba(255, 255, 255, 0.02);
		text-align: center;
	}
	.email-submit-card .email-icon i {
		font-size: 2.5rem;
		color: var(--color-accent);
	}
	.email-submit-card h3 {
		font-size: 1.1rem;
		font-weight: 800;
		color: var(--text-primary);
		margin: 0;
	}
	.email-send-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: #fff;
		font-size: 1rem;
		font-weight: 700;
		padding: 0.75rem 1.5rem;
		border-radius: 999px;
		background: linear-gradient(135deg, #10b981, #059669);
		box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
		transition: all 0.2s ease;
		text-decoration: none;
	}
	.email-send-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
		color: #fff;
	}
	.email-hint {
		font-size: 0.8rem;
		color: var(--text-secondary);
		margin: 0;
	}
	.email-template {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		padding: 1rem;
		font-size: 0.8rem;
		color: var(--text-secondary);
		text-align: left;
		width: 100%;
		overflow-x: auto;
		white-space: pre-wrap;
		word-break: break-word;
		line-height: 1.4;
	}
</style>
