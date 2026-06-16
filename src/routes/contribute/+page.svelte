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

	let formId = $state('');
	let formTitle = $state('');
	let formProvider = $state('');
	let formDescription = $state('');
	let formBenefits = $state<string[]>(['']);
	let formRequirements = $state<string[]>(['']);
	let formCtaLink = $state('');
	let formTags = $state('');
	let formValidityType = $state<'fixed' | 'uncertain' | 'forever'>('uncertain');
	let formValidityDate = $state('');
	let formValidityDesc = $state('');
	let formPublishedAt = $state(new Date().toISOString().slice(0, 10));
	let formPromoCode = $state('');
	let formSource = $state('');
	let formContributorName = $state('');
	let formContributorUrl = $state('');
	let formStatus = $state<'active' | 'expired' | 'upcoming'>('active');
	let formFeatured = $state(false);
	let formErrors = $state<string[]>([]);

	function slugify(text: string): string {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	$effect(() => {
		if (formTitle && !formId) {
			formId = slugify(formTitle);
		}
	});

	function addBenefit() {
		formBenefits = [...formBenefits, ''];
	}

	function removeBenefit(index: number) {
		formBenefits = formBenefits.filter((_, i) => i !== index);
	}

	function updateBenefit(index: number, value: string) {
		formBenefits = formBenefits.map((item, i) => (i === index ? value : item));
	}

	function addRequirement() {
		formRequirements = [...formRequirements, ''];
	}

	function removeRequirement(index: number) {
		formRequirements = formRequirements.filter((_, i) => i !== index);
	}

	function updateRequirement(index: number, value: string) {
		formRequirements = formRequirements.map((item, i) => (i === index ? value : item));
	}

	function generateIssueUrl(): string | null {
		formErrors = [];
		const errors: string[] = [];

		if (!formId.trim()) errors.push('ID wajib diisi');
		else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formId.trim()))
			errors.push('ID harus kebab-case lowercase (contoh: nama-bansos)');

		if (!formTitle.trim()) errors.push('Title wajib diisi');
		if (!formProvider.trim()) errors.push('Provider wajib diisi');
		if (!formDescription.trim()) errors.push('Description wajib diisi');

		const validBenefits = formBenefits.filter((b) => b.trim());
		if (validBenefits.length === 0) errors.push('Minimal 1 benefit wajib diisi');

		const validRequirements = formRequirements.filter((r) => r.trim());
		if (validRequirements.length === 0) errors.push('Minimal 1 requirement wajib diisi');

		if (!formCtaLink.trim()) errors.push('CTA Link wajib diisi');
		else {
			try {
				const url = new URL(formCtaLink.trim());
				if (url.protocol !== 'http:' && url.protocol !== 'https:')
					errors.push('CTA Link harus menggunakan http:// atau https://');
			} catch {
				errors.push('CTA Link harus URL yang valid');
			}
		}
		if (!formTags.trim()) errors.push('Tags wajib diisi (pisahkan dengan koma)');

		if (formValidityType === 'fixed') {
			if (!formValidityDate) errors.push('Validity Date wajib diisi untuk tipe Fixed');
			else if (!/^\d{4}-\d{2}-\d{2}$/.test(formValidityDate))
				errors.push('Validity Date harus format YYYY-MM-DD');
		}

		if (formContributorName && !formContributorUrl)
			errors.push('Contributor URL wajib diisi jika Contributor Name diisi');
		if (!formContributorName && formContributorUrl)
			errors.push('Contributor Name wajib diisi jika Contributor URL diisi');
		if (formContributorUrl) {
			try {
				const url = new URL(formContributorUrl.trim());
				if (url.protocol !== 'http:' && url.protocol !== 'https:')
					errors.push('Contributor URL harus menggunakan http:// atau https://');
			} catch {
				errors.push('Contributor URL harus URL yang valid');
			}
		}

		if (errors.length > 0) {
			formErrors = errors;
			return null;
		}

		const payload: Record<string, unknown> = {
			id: formId.trim(),
			title: formTitle.trim(),
			provider: formProvider.trim(),
			description: formDescription.trim(),
			benefits: validBenefits.map((b) => b.trim()),
			validity: {
				type: formValidityType,
				...(formValidityType === 'fixed' && formValidityDate ? { date: formValidityDate } : {}),
				...(formValidityDesc.trim() ? { description: formValidityDesc.trim() } : {})
			},
			requirements: validRequirements.map((r) => r.trim()),
			publishedAt: formPublishedAt || new Date().toISOString().slice(0, 10),
			ctaLink: formCtaLink.trim(),
			tags: formTags
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean),
			featured: formFeatured,
			status: formStatus
		};

		if (formPromoCode.trim()) payload.promoCode = formPromoCode.trim();
		if (formSource.trim()) payload.source = formSource.trim();
		if (formContributorName.trim() && formContributorUrl.trim()) {
			payload.contributor = {
				name: formContributorName.trim(),
				url: formContributorUrl.trim()
			};
		}

		const body = [
			'## Bansos submission',
			'',
			'```json',
			JSON.stringify(payload, null, 2),
			'```'
		].join('\n');
		const params = new URLSearchParams({
			title: `Tambah bansos: ${formTitle.trim()}`,
			body,
			labels: 'submission,bansos'
		});
		return `https://github.com/wauputr4/bansos/issues/new?${params.toString()}`;
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		const url = generateIssueUrl();
		if (url) {
			window.open(url, '_blank');
		}
	}
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

		<section class="submit-form-box">
			<div class="form-header">
				<p class="eyebrow">Form Submit</p>
				<h2>Isi form ini, langsung submit ke GitHub.</h2>
				<p>Gak perlu CLI. Isi form di bawah, klik Submit, dan issue GitHub otomatis terbuka.</p>
			</div>

			<form class="bansos-form" onsubmit={handleSubmit} novalidate>
				<div class="form-grid">
					<div class="form-group full-width">
						<label for="form-title">Title <span class="required">*</span></label>
						<input
							id="form-title"
							type="text"
							bind:value={formTitle}
							placeholder="GitHub Copilot Gratis 3 Bulan"
							required
						/>
						<span class="hint">ID akan otomatis terbuat dari title</span>
					</div>

					<div class="form-group">
						<label for="form-provider">Provider <span class="required">*</span></label>
						<input
							id="form-provider"
							type="text"
							bind:value={formProvider}
							placeholder="GitHub"
							required
						/>
					</div>

					<div class="form-group">
						<label for="form-cta-link">CTA Link <span class="required">*</span></label>
						<input
							id="form-cta-link"
							type="url"
							bind:value={formCtaLink}
							placeholder="https://example.com"
							required
						/>
					</div>

					<div class="form-group full-width">
						<label for="form-description">Description <span class="required">*</span></label>
						<textarea
							id="form-description"
							bind:value={formDescription}
							placeholder="Deskripsi singkat tentang bansos ini..."
							rows="2"
							required
						></textarea>
					</div>

					<!-- svelte-ignore a11y_label_has_associated_control -->
					<div class="form-group full-width">
						<label id="benefits-label">Benefits <span class="required">*</span></label>
						<div class="repeater-list" aria-labelledby="benefits-label">
							{#each formBenefits as benefit, i (i)}
								<div class="repeater-item">
									<input
										type="text"
										value={benefit}
										oninput={(e) => updateBenefit(i, e.currentTarget.value)}
										placeholder="Benefit {i + 1}"
										aria-label="Benefit {i + 1}"
									/>
									{#if formBenefits.length > 1}
										<button
											type="button"
											class="repeater-remove"
											onclick={() => removeBenefit(i)}
											aria-label="Remove benefit {i + 1}"
										>
											<i class="fa-solid fa-times"></i>
										</button>
									{/if}
								</div>
							{/each}
						</div>
						<button type="button" class="repeater-add" onclick={addBenefit}>
							<i class="fa-solid fa-plus"></i> Tambah Benefit
						</button>
					</div>

					<!-- svelte-ignore a11y_label_has_associated_control -->
					<div class="form-group full-width">
						<label id="requirements-label">Requirements <span class="required">*</span></label>
						<div class="repeater-list" aria-labelledby="requirements-label">
							{#each formRequirements as requirement, i (i)}
								<div class="repeater-item">
									<input
										type="text"
										value={requirement}
										oninput={(e) => updateRequirement(i, e.currentTarget.value)}
										placeholder="Requirement {i + 1}"
										aria-label="Requirement {i + 1}"
									/>
									{#if formRequirements.length > 1}
										<button
											type="button"
											class="repeater-remove"
											onclick={() => removeRequirement(i)}
											aria-label="Remove requirement {i + 1}"
										>
											<i class="fa-solid fa-times"></i>
										</button>
									{/if}
								</div>
							{/each}
						</div>
						<button type="button" class="repeater-add" onclick={addRequirement}>
							<i class="fa-solid fa-plus"></i> Tambah Requirement
						</button>
					</div>

					<div class="form-group">
						<label for="form-tags">Tags <span class="required">*</span></label>
						<input
							id="form-tags"
							type="text"
							bind:value={formTags}
							placeholder="Cloud,AI,Gratisan"
							required
						/>
						<span class="hint">Pisahkan dengan koma</span>
					</div>

					<div class="form-group">
						<label for="form-validity-type">Masa Berlaku <span class="required">*</span></label>
						<select id="form-validity-type" bind:value={formValidityType}>
							<option value="uncertain">Tidak Tentu</option>
							<option value="fixed">Batas Waktu</option>
							<option value="forever">Selamanya</option>
						</select>
					</div>

					{#if formValidityType === 'fixed'}
						<div class="form-group">
							<label for="form-validity-date"
								>Tanggal Berakhir <span class="required">*</span></label
							>
							<input id="form-validity-date" type="date" bind:value={formValidityDate} required />
						</div>
					{/if}

					<div class="form-group full-width">
						<label for="form-validity-desc">Catatan Masa Berlaku</label>
						<input
							id="form-validity-desc"
							type="text"
							bind:value={formValidityDesc}
							placeholder="Berlaku sampai slot habis, dll (opsional)"
						/>
					</div>

					<div class="form-group">
						<label for="form-published-at">Tanggal Publish</label>
						<input id="form-published-at" type="date" bind:value={formPublishedAt} />
					</div>

					<div class="form-group">
						<label for="form-status">Status</label>
						<select id="form-status" bind:value={formStatus}>
							<option value="active">Aktif</option>
							<option value="upcoming">Akan Datang</option>
							<option value="expired">Expired</option>
						</select>
					</div>

					<div class="form-group">
						<label for="form-promo-code">Promo Code</label>
						<input
							id="form-promo-code"
							type="text"
							bind:value={formPromoCode}
							placeholder="PROMOCODE2026"
						/>
					</div>

					<div class="form-group">
						<label for="form-source">Sumber</label>
						<input
							id="form-source"
							type="text"
							bind:value={formSource}
							placeholder="https://sumber-berita.com atau teks"
						/>
					</div>

					<div class="form-group">
						<label for="form-contributor-name">Nama Kontributor</label>
						<input
							id="form-contributor-name"
							type="text"
							bind:value={formContributorName}
							placeholder="Nama Kamu"
						/>
					</div>

					<div class="form-group">
						<label for="form-contributor-url">URL Kontributor</label>
						<input
							id="form-contributor-url"
							type="url"
							bind:value={formContributorUrl}
							placeholder="https://github.com/username"
						/>
					</div>

					<div class="form-group checkbox-group full-width">
						<label class="checkbox-label">
							<input type="checkbox" bind:checked={formFeatured} />
							<span>Featured (tandai sebagai rekomendasi)</span>
						</label>
					</div>
				</div>

				<button type="submit" class="btn-submit">
					<i class="fa-brands fa-github"></i>
					Submit ke GitHub
				</button>

				{#if formErrors.length > 0}
					<div class="form-errors">
						<p><i class="fa-solid fa-circle-exclamation"></i> Ada yang perlu diperbaiki:</p>
						<ul>
							{#each formErrors as error, i (i)}
								<li>{error}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</form>
		</section>

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

	.submit-form-box {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border: 1px solid color-mix(in srgb, var(--color-accent) 42%, var(--border-color));
		border-radius: 0.75rem;
		background:
			linear-gradient(135deg, rgba(53, 194, 124, 0.08), rgba(255, 255, 255, 0.02)),
			color-mix(in srgb, var(--text-primary) 4%, transparent);
		padding: 1.25rem;
	}

	.form-header {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.form-header h2 {
		margin: 0;
		color: var(--text-primary);
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		line-height: 1.15;
	}

	.form-header p {
		margin: 0;
	}

	.bansos-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-errors {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.4);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
		color: #fca5a5;
	}

	.form-errors p {
		margin: 0 0 0.5rem;
		font-weight: 700;
		color: #fca5a5;
	}

	.form-errors ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	.form-errors li {
		font-size: 0.9rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	@media (min-width: 40rem) {
		.form-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.form-group.full-width {
		grid-column: 1 / -1;
	}

	.form-group label {
		color: var(--text-primary);
		font-size: 0.9rem;
		font-weight: 700;
	}

	.required {
		color: #ef4444;
	}

	.hint {
		color: var(--text-muted);
		font-size: 0.8rem;
	}

	.form-group input,
	.form-group textarea,
	.form-group select {
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.65rem 0.85rem;
		color: var(--text-primary);
		font-family: inherit;
		font-size: 0.95rem;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
	}

	.form-group input::placeholder,
	.form-group textarea::placeholder {
		color: var(--text-muted);
	}

	.form-group textarea {
		resize: vertical;
		min-height: 4rem;
	}

	.checkbox-group {
		flex-direction: row;
		align-items: center;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	.checkbox-label input[type='checkbox'] {
		width: 1.1rem;
		height: 1.1rem;
		accent-color: var(--color-accent);
		cursor: pointer;
	}

	.checkbox-label span {
		color: var(--text-secondary);
		font-size: 0.9rem;
		font-weight: 600;
	}

	.btn-submit {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: var(--color-accent);
		color: #ffffff;
		border: none;
		border-radius: 0.6rem;
		padding: 0.85rem 1.5rem;
		font-family: inherit;
		font-size: 1rem;
		font-weight: 750;
		cursor: pointer;
		transition: all 0.2s;
		align-self: flex-start;
	}

	.btn-submit:hover {
		background: color-mix(in srgb, var(--color-accent) 85%, #000);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px var(--color-accent-glow);
	}

	.btn-submit:active {
		transform: translateY(0);
	}

	.repeater-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.repeater-item {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.repeater-item input {
		flex: 1;
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.65rem 0.85rem;
		color: var(--text-primary);
		font-family: inherit;
		font-size: 0.95rem;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.repeater-item input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
	}

	.repeater-item input::placeholder {
		color: var(--text-muted);
	}

	.repeater-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.2rem;
		height: 2.2rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 0.5rem;
		color: #ef4444;
		cursor: pointer;
		transition: all 0.2s;
	}

	.repeater-remove:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: #ef4444;
	}

	.repeater-add {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		background: transparent;
		border: 1px dashed var(--border-color);
		border-radius: 0.5rem;
		color: var(--text-secondary);
		font-family: inherit;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.repeater-add:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 5%, transparent);
	}
</style>
