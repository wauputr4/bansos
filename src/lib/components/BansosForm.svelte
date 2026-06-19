<script lang="ts">
	import { bansosList } from '$lib/data/bansos';

	const existingTags = [...new Set(bansosList.flatMap((i) => i.tags))].sort((a, b) =>
		a.localeCompare(b)
	);
	const existingIds = new Set(bansosList.map((i) => i.id));

	const examples = bansosList.filter((i) => i.status === 'active').slice(0, 3);

	let formId = $state('');
	let formTitle = $state('');

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
	let formStatus = $state<'active' | 'expired' | 'upcoming'>('active');
	let formFeatured = $state(false);
	let formErrors = $state<string[]>([]);

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
		formStatus = item.status;
		formFeatured = item.featured || false;
		formContributorName = item.contributor?.name || '';
		formContributorUrl = item.contributor?.url || '';
		formErrors = [];
	}

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

	function addTag(tag: string) {
		const trimmed = tag.trim();
		if (trimmed && !formTags.includes(trimmed)) {
			formTags = [...formTags, trimmed];
		}
		tagInput = '';
	}

	function removeTag(index: number) {
		formTags = formTags.filter((_, i) => i !== index);
	}

	function handleTagInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ',') {
			e.preventDefault();
			if (tagInput.trim()) {
				addTag(tagInput);
			}
		} else if (e.key === 'Backspace' && !tagInput && formTags.length > 0) {
			formTags = formTags.slice(0, -1);
		}
	}

	function generateIssueUrl(): string | null {
		formErrors = [];
		const errors: string[] = [];

		if (!formId.trim()) errors.push('ID wajib diisi');
		else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formId.trim()))
			errors.push('ID harus kebab-case lowercase (contoh: nama-bansos)');
		else if (existingIds.has(formId.trim()))
			errors.push('ID sudah ada di katalog. Gunakan ID yang berbeda.');

		if (!formTitle.trim()) errors.push('Title wajib diisi');

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

		const payload: Record<string, unknown> = {
			id: formId.trim(),
			title: formTitle.trim(),

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
			tags: formTags,
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

	export function reset() {
		formId = '';
		formTitle = '';

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
		formStatus = 'active';
		formFeatured = false;
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
				placeholder="GitHub Copilot Gratis 3 Bulan"
				required
			/>
			<span class="hint">ID akan otomatis terbuat dari title</span>
		</div>

		<div class="form-group">
			<label for="bansos-form-cta-link">CTA Link <span class="required">*</span></label>
			<input
				id="bansos-form-cta-link"
				type="url"
				bind:value={formCtaLink}
				placeholder="https://example.com"
				required
			/>
		</div>

		<div class="form-group full-width">
			<label for="bansos-form-description">Description <span class="required">*</span></label>
			<textarea
				id="bansos-form-description"
				bind:value={formDescription}
				placeholder="Deskripsi singkat tentang bansos ini..."
				rows="2"
				required
			></textarea>
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
			<label id="bansos-form-requirements-label">Requirements <span class="required">*</span></label
			>
			<div class="repeater-list" aria-labelledby="bansos-form-requirements-label">
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
			<span class="hint">Klik tag untuk pilih, atau ketik tag baru lalu tekan Enter</span>
		</div>

		<div class="form-group">
			<label for="bansos-form-validity-type">Masa Berlaku <span class="required">*</span></label>
			<select id="bansos-form-validity-type" bind:value={formValidityType}>
				<option value="uncertain">Tidak Tentu</option>
				<option value="fixed">Batas Waktu</option>
				<option value="forever">Selamanya</option>
			</select>
		</div>

		{#if formValidityType === 'fixed'}
			<div class="form-group">
				<label for="bansos-form-validity-date"
					>Tanggal Berakhir <span class="required">*</span></label
				>
				<input id="bansos-form-validity-date" type="date" bind:value={formValidityDate} required />
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

		<div class="form-group">
			<label for="bansos-form-published-at">Tanggal Publish</label>
			<input id="bansos-form-published-at" type="date" bind:value={formPublishedAt} />
		</div>

		<div class="form-group">
			<label for="bansos-form-status">Status</label>
			<select id="bansos-form-status" bind:value={formStatus}>
				<option value="active">Aktif</option>
				<option value="upcoming">Akan Datang</option>
				<option value="expired">Expired</option>
			</select>
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

		<div class="form-group checkbox-group full-width">
			<label class="checkbox-label">
				<input type="checkbox" bind:checked={formFeatured} />
				<span>Featured (tandai sebagai rekomendasi)</span>
			</label>
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
		font-size: 0.8rem;
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
