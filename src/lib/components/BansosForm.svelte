<script lang="ts">
	import { bansosList, extractProvider } from '$lib/data/bansos';
	import DatePicker from './DatePicker.svelte';

	const existingTags = [...new Set(bansosList.flatMap((i) => i.tags))].sort((a, b) =>
		a.localeCompare(b)
	);
	const existingIds = new Set(bansosList.map((i) => i.id));

	const examples = bansosList.filter((i) => i.status === 'active').slice(0, 3);

	let formId = $state('');
	let formTitle = $state('');
	let formProvider = $state('');
	let providerManuallyEdited = $state(false);

	let formDescription = $state('');
	let formBenefits = $state<string[]>(['']);
	let formRequirements = $state<string[]>(['']);
	let formCtaLink = $state('');
	let formTags = $state<string[]>([]);
	let tagInput = $state('');
	let formValidityType = $state<'fixed' | 'uncertain' | 'forever'>('uncertain');
	let formValidityDate = $state('');
	let formValidityDesc = $state('');
	let formPublishedAt = $state(new Date().toISOString().slice(0, 10));
	let formPromoCode = $state('');
	let formSource = $state('');
	let formContributorName = $state('');
	let formContributorUrl = $state('');
	let formErrors = $state<string[]>([]);
	let validityDropdownOpen = $state(false);
	let tagError = $state('');
	let ctaLinkError = $state('');

	const validityOptions = [
		{ value: 'uncertain', label: 'Tidak Tentu' },
		{ value: 'fixed', label: 'Batas Waktu' },
		{ value: 'forever', label: 'Selamanya' }
	];

	let autoStatus = $derived.by(() => {
		const d = new Date();
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		const today = `${yyyy}-${mm}-${dd}`;
		const start = formPublishedAt || today;
		if (start > today) return 'upcoming';

		if (formValidityType === 'fixed' && formValidityDate) {
			if (formValidityDate < today) return 'expired';
		}
		return 'active';
	});

	$effect(() => {
		if (!formCtaLink.trim()) {
			ctaLinkError = '';
			if (!providerManuallyEdited) {
				formProvider = '';
			}
			return;
		}
		try {
			const url = new URL(formCtaLink.trim());
			if (url.protocol !== 'http:' && url.protocol !== 'https:') {
				ctaLinkError = 'CTA Link harus menggunakan http:// atau https://';
			} else {
				ctaLinkError = '';
			}
		} catch {
			ctaLinkError = 'CTA Link bukan URL yang valid (contoh: https://example.com)';
		}

		if (formCtaLink.trim() && !providerManuallyEdited) {
			const extracted = extractProvider(formCtaLink);
			if (extracted !== 'Unknown') {
				formProvider = extracted;
			} else {
				formProvider = '';
			}
		}
	});

	const filteredTags = $derived(
		tagInput.trim()
			? existingTags.filter(
					(t) => t.toLowerCase().includes(tagInput.toLowerCase()) && !formTags.includes(t)
				)
			: existingTags.filter((t) => !formTags.includes(t))
	);

	function slugify(text: string): string {
		return text
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/[\s_-]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	function generateUniqueId(baseSlug: string): string {
		let slug = baseSlug;
		let counter = 1;
		while (existingIds.has(slug)) {
			slug = `${baseSlug}-${counter}`;
			counter++;
		}
		return slug;
	}

	$effect(() => {
		if (formTitle && !formId) {
			const slug = slugify(formTitle);
			if (slug) {
				formId = generateUniqueId(slug);
			}
		}
	});

	function fillExample(item: (typeof bansosList)[number]) {
		formId = '';
		formTitle = item.title;
		formProvider = item.provider;
		providerManuallyEdited = true;

		formDescription = item.description;
		formBenefits = [...item.benefits];
		formRequirements = [...item.requirements];
		formCtaLink = item.ctaLink;
		formTags = [...item.tags];
		formValidityType = item.validity.type;
		formValidityDate = item.validity.date || '';
		formValidityDesc = item.validity.description || '';
		formPublishedAt = item.publishedAt || new Date().toISOString().slice(0, 10);
		formPromoCode = item.promoCode || '';
		formSource = item.source || '';
		formContributorName = item.contributor?.name || '';
		formContributorUrl = item.contributor?.url || '';
		formErrors = [];
	}

	function removeBenefit(index: number) {
		formBenefits = formBenefits.filter((_, i) => i !== index);
		if (formBenefits.length === 0) formBenefits = [''];
	}

	function cleanupBenefits() {
		setTimeout(() => {
			const filled = formBenefits.map((b) => b.trim()).filter((b) => b !== '');
			formBenefits = [...filled, ''];
		}, 150);
	}

	function updateBenefit(index: number, value: string) {
		formBenefits = formBenefits.map((item, i) => (i === index ? value : item));
		if (index === formBenefits.length - 1 && value.trim() !== '') {
			formBenefits = [...formBenefits, ''];
		}
	}

	function removeRequirement(index: number) {
		formRequirements = formRequirements.filter((_, i) => i !== index);
		if (formRequirements.length === 0) formRequirements = [''];
	}

	function cleanupRequirements() {
		setTimeout(() => {
			const filled = formRequirements.map((r) => r.trim()).filter((r) => r !== '');
			formRequirements = [...filled, ''];
		}, 150);
	}

	function updateRequirement(index: number, value: string) {
		formRequirements = formRequirements.map((item, i) => (i === index ? value : item));
		if (index === formRequirements.length - 1 && value.trim() !== '') {
			formRequirements = [...formRequirements, ''];
		}
	}

	function addTag(tag: string) {
		const trimmed = tag.trim();
		if (trimmed.length < 2) {
			tagError = 'Tag minimal 2 karakter';
			return;
		}
		if (!formTags.includes(trimmed)) {
			formTags = [...formTags, trimmed];
		}
		tagInput = '';
		tagError = '';
	}

	function removeTag(index: number) {
		formTags = formTags.filter((_, i) => i !== index);
		tagError = '';
	}

	function handleTagInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			if (tagInput.trim()) {
				addTag(tagInput);
			}
		} else if (e.key === 'Backspace' && !tagInput && formTags.length > 0) {
			formTags = formTags.slice(0, -1);
			tagError = '';
		} else {
			tagError = '';
		}
	}

	function generateIssueUrl(): string | null {
		formErrors = [];
		const errors: string[] = [];

		const now = Date.now();
		const lastSubmission = localStorage.getItem('bansos_last_submission');
		if (lastSubmission && now - parseInt(lastSubmission) < 60000) {
			errors.push('Tunggu 1 menit sebelum submit form lagi (Rate Limit).');
		}

		if (!formId.trim()) errors.push('ID wajib diisi');
		else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formId.trim()))
			errors.push('ID harus kebab-case lowercase (contoh: nama-bansos)');
		else if (existingIds.has(formId.trim()))
			errors.push('ID sudah ada di katalog. Gunakan ID yang berbeda.');

		if (!formTitle.trim()) errors.push('Title wajib diisi');
		else if (formTitle.trim().length > 100) errors.push('Title maksimal 100 karakter');

		if (!formProvider.trim()) errors.push('Provider wajib diisi');

		if (!formDescription.trim()) errors.push('Description wajib diisi');
		else if (formDescription.trim().length > 250) errors.push('Description maksimal 250 karakter');

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
		if (formTags.length === 0) errors.push('Minimal 1 tag wajib dipilih');

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

		const d = new Date();
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const dd = String(d.getDate()).padStart(2, '0');
		const localToday = `${yyyy}-${mm}-${dd}`;

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
			publishedAt: formPublishedAt || localToday,
			ctaLink: formCtaLink.trim(),
			tags: formTags,
			status: autoStatus
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
			localStorage.setItem('bansos_last_submission', Date.now().toString());
			window.open(url, '_blank');
		}
	}

	export function reset() {
		formId = '';
		formTitle = '';
		formProvider = '';
		providerManuallyEdited = false;

		formDescription = '';
		formBenefits = [''];
		formRequirements = [''];
		formCtaLink = '';
		formTags = [];
		tagInput = '';
		formValidityType = 'uncertain';
		formValidityDate = '';
		formValidityDesc = '';
		formPublishedAt = new Date().toISOString().slice(0, 10);
		formPromoCode = '';
		formSource = '';
		formContributorName = '';
		formContributorUrl = '';
		formErrors = [];
	}
</script>

<form class="bansos-form" onsubmit={handleSubmit} novalidate>
	<div class="examples-section">
		<span class="examples-label"><i class="fa-solid fa-lightbulb"></i> Contoh pengisian:</span>
		<div class="examples-buttons">
			{#each examples as example (example.id)}
				<button type="button" class="example-btn" onclick={() => fillExample(example)}>
					<i class="fa-solid fa-arrow-right"></i>
					{example.title.length > 40 ? example.title.slice(0, 40) + '...' : example.title}
				</button>
			{/each}
		</div>
	</div>

	<div class="form-grid">
		<div class="form-group full-width">
			<label for="bansos-form-title">Title <span class="required">*</span></label>
			<input
				id="bansos-form-title"
				type="text"
				bind:value={formTitle}
				required
				maxlength="100"
				placeholder="Contoh: GitHub Student Developer Pack"
			/>
			<div class="hint-row">
				<span class="hint">ID akan otomatis terbuat dari title</span>
				<span class="char-count" class:near-limit={formTitle.length > 80}
					>{formTitle.length}/100</span
				>
			</div>
		</div>

		<div class="form-group">
			<label for="bansos-form-provider">Provider <span class="required">*</span></label>
			<input
				id="bansos-form-provider"
				type="text"
				bind:value={formProvider}
				oninput={() => (providerManuallyEdited = true)}
				required
				placeholder="Contoh: GitHub, Vercel"
			/>
		</div>

		<div class="form-group">
			<label for="bansos-form-cta-link">CTA Link <span class="required">*</span></label>
			<input
				id="bansos-form-cta-link"
				type="url"
				bind:value={formCtaLink}
				placeholder="https://example.com"
				class:error-border={ctaLinkError !== ''}
				required
			/>
			{#if ctaLinkError}
				<span class="error-hint" style="margin-top: 0.25rem; display: block;">{ctaLinkError}</span>
			{/if}
		</div>

		<div class="form-group full-width">
			<label for="bansos-form-description">Description <span class="required">*</span></label>
			<textarea
				id="bansos-form-description"
				bind:value={formDescription}
				required
				maxlength="250"
				placeholder="Jelaskan secara singkat apa saja yang didapatkan (max 250 karakter)..."
			></textarea>
			<div class="hint-row">
				<span></span>
				<span class="char-count" class:near-limit={formDescription.length > 200}
					>{formDescription.length}/250</span
				>
			</div>
		</div>

		<!-- svelte-ignore a11y_label_has_associated_control -->
		<div class="form-group full-width">
			<label id="bansos-form-benefits-label">Benefits <span class="required">*</span></label>
			<div class="repeater-list" aria-labelledby="bansos-form-benefits-label">
				{#each formBenefits as benefit, i (i)}
					<div class="repeater-item">
						<input
							type="text"
							value={benefit}
							oninput={(e) => updateBenefit(i, e.currentTarget.value)}
							onblur={cleanupBenefits}
							placeholder={i === formBenefits.length - 1
								? 'Ketik untuk menambah benefit baru...'
								: `Benefit ${i + 1}`}
							aria-label="Benefit {i + 1}"
						/>
						{#if i !== formBenefits.length - 1}
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
		</div>

		<!-- svelte-ignore a11y_label_has_associated_control -->
		<div class="form-group full-width">
			<label id="bansos-form-requirements-label">Requirements <span class="required">*</span></label
			>
			<div class="repeater-list" aria-labelledby="bansos-form-requirements-label">
				{#each formRequirements as requirement, i (i)}
					<div class="repeater-item">
						<input
							type="text"
							value={requirement}
							oninput={(e) => updateRequirement(i, e.currentTarget.value)}
							onblur={cleanupRequirements}
							placeholder={i === formRequirements.length - 1
								? 'Ketik untuk menambah requirement baru...'
								: `Requirement ${i + 1}`}
							aria-label="Requirement {i + 1}"
						/>
						{#if i !== formRequirements.length - 1}
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
		</div>

		<!-- svelte-ignore a11y_label_has_associated_control -->
		<div class="form-group full-width">
			<label id="bansos-form-tags-label">Tags <span class="required">*</span></label>
			<div class="tags-input-wrapper" aria-labelledby="bansos-form-tags-label">
				{#each formTags as tag, i (tag)}
					<span class="tag-chip">
						{tag}
						<button
							type="button"
							class="tag-chip-remove"
							onclick={() => removeTag(i)}
							aria-label="Remove tag {tag}"
						>
							<i class="fa-solid fa-times"></i>
						</button>
					</span>
				{/each}
				<input
					type="text"
					bind:value={tagInput}
					onkeydown={handleTagInputKeydown}
					placeholder={formTags.length === 0 ? 'Ketik atau pilih tag...' : ''}
					class="tag-text-input"
				/>
			</div>
			{#if filteredTags.length > 0}
				<div class="tags-suggestions">
					{#each filteredTags.slice(0, 12) as tag (tag)}
						<button type="button" class="tag-suggestion-btn" onclick={() => addTag(tag)}>
							{tag}
						</button>
					{/each}
				</div>
			{/if}
			<div class="hint-row">
				<span class="hint">Klik tag untuk pilih, atau ketik tag baru lalu tekan Enter</span>
				{#if tagError}
					<span class="error-hint">{tagError}</span>
				{/if}
			</div>
		</div>

		<div class="form-group custom-select-container">
			<label for="bansos-form-validity-type">Masa Berlaku <span class="required">*</span></label>
			<div class="custom-select" class:open={validityDropdownOpen}>
				<button
					type="button"
					id="bansos-form-validity-type"
					class="select-btn"
					onclick={() => (validityDropdownOpen = !validityDropdownOpen)}
				>
					{validityOptions.find((o) => o.value === formValidityType)?.label}
					<i class="fa-solid fa-chevron-down"></i>
				</button>
				{#if validityDropdownOpen}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="dropdown-backdrop" onclick={() => (validityDropdownOpen = false)}></div>
					<ul class="select-dropdown">
						{#each validityOptions as opt (opt.value)}
							<li>
								<button
									type="button"
									class="select-option"
									class:selected={formValidityType === opt.value}
									onclick={() => {
										formValidityType = opt.value as 'fixed' | 'uncertain' | 'forever';
										validityDropdownOpen = false;
									}}
								>
									{opt.label}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>

		{#if formValidityType === 'fixed'}
			<div class="form-group">
				<label for="bansos-form-validity-date"
					>Tanggal Berakhir <span class="required">*</span></label
				>
				<DatePicker id="bansos-form-validity-date" bind:value={formValidityDate} required={true} />
			</div>
		{/if}

		<div class="form-group full-width">
			<label for="bansos-form-validity-desc">Catatan Masa Berlaku</label>
			<input
				id="bansos-form-validity-desc"
				type="text"
				bind:value={formValidityDesc}
				placeholder="Berlaku sampai slot habis, dll (opsional)"
			/>
		</div>

		<div class="form-group full-width">
			<label for="bansos-form-published-at">Tanggal Mulai Berlaku</label>
			<DatePicker id="bansos-form-published-at" bind:value={formPublishedAt} />
		</div>

		<div class="form-group">
			<label for="bansos-form-promo-code">Promo Code</label>
			<input
				id="bansos-form-promo-code"
				type="text"
				bind:value={formPromoCode}
				placeholder="PROMOCODE2026"
			/>
		</div>

		<div class="form-group">
			<label for="bansos-form-source">Sumber</label>
			<input
				id="bansos-form-source"
				type="text"
				bind:value={formSource}
				placeholder="https://sumber-berita.com atau teks"
			/>
		</div>

		<div class="form-group">
			<label for="bansos-form-contributor-name">Nama Kontributor</label>
			<input
				id="bansos-form-contributor-name"
				type="text"
				bind:value={formContributorName}
				placeholder="Nama Kamu"
			/>
		</div>

		<div class="form-group">
			<label for="bansos-form-contributor-url">URL Kontributor</label>
			<input
				id="bansos-form-contributor-url"
				type="url"
				bind:value={formContributorUrl}
				placeholder="https://github.com/username"
			/>
		</div>
	</div>

	<div class="form-actions">
		<button type="button" class="btn-reset" onclick={reset}>
			<i class="fa-solid fa-rotate-left"></i>
			Reset Form
		</button>
		<button type="submit" class="btn-submit">
			<i class="fa-brands fa-github"></i>
			Submit ke GitHub
		</button>
	</div>

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

<style>
	.bansos-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.examples-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.85rem 1rem;
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
		font-size: 0.78rem;
		font-weight: 650;
		padding: 0.35rem 0.7rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.example-btn:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 8%, transparent);
	}

	.example-btn i {
		font-size: 0.65rem;
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

	@media (max-width: 48rem) {
		.form-grid {
			gap: 0.85rem;
		}
		.form-group {
			gap: 0.25rem;
		}
		.form-group input,
		.form-group textarea,
		.form-group select {
			padding: 0.55rem 0.75rem;
			font-size: 0.9rem;
		}
		.repeater-item input {
			padding: 0.55rem 0.75rem;
			font-size: 0.9rem;
		}
		.btn-submit,
		.btn-reset {
			padding: 0.75rem 1.25rem;
			font-size: 0.95rem;
		}
		.repeater-remove {
			width: 2rem;
			height: 2rem;
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
		font-size: 0.75rem;
		display: block;
	}

	.hint-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-top: 0.25rem;
		gap: 1rem;
	}

	.char-count {
		font-size: 0.75rem;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.char-count.near-limit {
		color: var(--color-warning);
	}

	.error-hint {
		color: var(--color-danger);
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.error-border {
		border-color: var(--color-danger) !important;
	}

	.hint-new {
		color: var(--color-accent);
		font-weight: 600;
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

	.tags-input-wrapper {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.45rem 0.6rem;
		min-height: 2.8rem;
		align-items: center;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.tags-input-wrapper:focus-within {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
	}

	.tag-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		background: color-mix(in srgb, var(--color-accent) 15%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-accent) 30%, transparent);
		border-radius: 999px;
		padding: 0.2rem 0.55rem;
		color: var(--color-accent);
		font-size: 0.8rem;
		font-weight: 700;
	}

	.tag-chip-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--color-accent);
		cursor: pointer;
		padding: 0;
		font-size: 0.65rem;
		opacity: 0.7;
		transition: opacity 0.15s;
	}

	.tag-chip-remove:hover {
		opacity: 1;
	}

	.tag-text-input {
		flex: 1;
		min-width: 8rem;
		background: transparent;
		border: none;
		padding: 0.2rem 0;
		color: var(--text-primary);
		font-family: inherit;
		font-size: 0.9rem;
		outline: none;
	}

	.form-group .tag-text-input {
		background: transparent;
		border: none;
		box-shadow: none;
		padding: 0.2rem 0;
	}

	.tag-text-input::placeholder {
		color: var(--text-muted);
	}

	.tags-suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.tag-suggestion-btn {
		background: transparent;
		border: 1px solid var(--border-color);
		border-radius: 999px;
		color: var(--text-secondary);
		font-family: inherit;
		font-size: 0.75rem;
		font-weight: 650;
		padding: 0.2rem 0.6rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.tag-suggestion-btn:hover {
		border-color: var(--color-accent);
		color: var(--color-accent);
		background: color-mix(in srgb, var(--color-accent) 8%, transparent);
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

	.form-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.btn-reset {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--border-color);
		border-radius: 0.6rem;
		padding: 0.85rem 1.25rem;
		font-family: inherit;
		font-size: 0.95rem;
		font-weight: 650;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-reset:hover {
		background: rgba(239, 68, 68, 0.08);
		border-color: rgba(239, 68, 68, 0.4);
		color: #ef4444;
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
		color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
		border-color: #ef4444;
	}

	.custom-select-container {
		position: relative;
	}

	.custom-select {
		position: relative;
		width: 100%;
	}

	.select-btn {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.65rem 0.85rem;
		color: var(--text-primary);
		font-family: inherit;
		font-size: 0.95rem;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.select-btn:focus,
	.custom-select.open .select-btn {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 20%, transparent);
	}

	.dropdown-backdrop {
		position: fixed;
		inset: 0;
		z-index: 10;
		cursor: default;
	}

	.select-dropdown {
		position: absolute;
		top: calc(100% + 0.25rem);
		left: 0;
		width: 100%;
		background: var(--bg-primary);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 0.5rem 0;
		margin: 0;
		list-style: none;
		z-index: 20;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
		max-height: 15rem;
		overflow-y: auto;
	}

	.select-option {
		width: 100%;
		text-align: left;
		padding: 0.5rem 1rem;
		background: transparent;
		border: none;
		color: var(--text-secondary);
		font-family: inherit;
		font-size: 0.95rem;
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
	}

	.select-option:hover {
		background: color-mix(in srgb, var(--text-primary) 5%, transparent);
		color: var(--text-primary);
	}

	.select-option.selected {
		color: var(--color-accent);
		background: rgba(16, 185, 129, 0.1);
		font-weight: 700;
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
