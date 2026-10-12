<script lang="ts">
	import type { SubmissionPayload } from '$lib/server/submission';

	let {
		value = null,
		draft = null,
		allowExpired = false,
		idPrefix = 'submission'
	}: {
		value?: SubmissionPayload | null;
		draft?: Record<string, string> | null;
		allowExpired?: boolean;
		idPrefix?: string;
	} = $props();

	function field(name: string, fallback = '') {
		return draft?.[name] ?? fallback;
	}

	function revealInvalid(event: Event) {
		const section = (event.currentTarget as HTMLElement).closest('details.editor-section');
		if (section instanceof HTMLDetailsElement) section.open = true;
	}
</script>

<div class="editor-sections">
	<section class="editor-section" aria-labelledby={`${idPrefix}-identity-heading`}>
		<div class="section-heading">
			<span class="section-icon"><i class="fa-solid fa-tag" aria-hidden="true"></i></span>
			<div>
				<p class="section-kicker">01 / IDENTITAS</p>
				<h3 id={`${idPrefix}-identity-heading`}>Kenalkan programnya</h3>
				<p>Nama yang jelas membantu pembaca menemukan bansos ini di katalog.</p>
			</div>
		</div>
		<div class="field-grid">
			<div class="field field-wide">
				<label for={`${idPrefix}-title`}>Judul bansos <span class="required">*</span></label>
				<input
					id={`${idPrefix}-title`}
					name="title"
					required
					maxlength="160"
					placeholder="Contoh: Kredit API Gratis untuk Developer"
					value={field('title', value?.title)}
				/>
			</div>
			<div class="field">
				<label for={`${idPrefix}-provider`}>Provider <span class="required">*</span></label>
				<input
					id={`${idPrefix}-provider`}
					name="provider"
					required
					maxlength="100"
					placeholder="Nama penyedia program"
					value={field('provider', value?.provider)}
				/>
			</div>
			<div class="field">
				<label for={`${idPrefix}-id`}>Slug URL <span class="required">*</span></label>
				<input
					id={`${idPrefix}-id`}
					name="id"
					required
					maxlength="90"
					pattern="[a-z0-9]+(-[a-z0-9]+)*"
					placeholder="provider-promo-gratis"
					value={field('id', value?.id)}
					readonly={Boolean(value)}
				/>
				<small
					>{value
						? 'Slug tidak dapat diubah setelah usulan dibuat.'
						: 'Huruf kecil, angka, dan tanda hubung. Tidak bisa diganti setelah dikirim.'}</small
				>
			</div>
			<div class="field field-wide">
				<label for={`${idPrefix}-tags`}>Kategori / tag <span class="required">*</span></label>
				<input
					id={`${idPrefix}-tags`}
					name="tags"
					required
					placeholder="AI Credits, API, Free Tier"
					value={field('tags', value?.tags.join(', '))}
				/>
				<small>Pisahkan setiap tag dengan koma.</small>
			</div>
		</div>
	</section>

	<details class="editor-section" open={Boolean(value || draft)}>
		<summary class="section-heading">
			<span class="section-icon"><i class="fa-solid fa-gift" aria-hidden="true"></i></span>
			<div>
				<p class="section-kicker">02 / ISI LISTING</p>
				<h3 id={`${idPrefix}-content-heading`}>Apa yang didapat dan cara klaimnya?</h3>
				<p>Tulis fakta dari sumber resmi. Admin akan memeriksa sebelum listing terbit.</p>
			</div>
			<i class="fa-solid fa-chevron-down section-chevron" aria-hidden="true"></i>
		</summary>
		<div class="field-grid">
			<div class="field field-wide">
				<label for={`${idPrefix}-description`}
					>Deskripsi singkat <span class="required">*</span></label
				>
				<textarea
					id={`${idPrefix}-description`}
					name="description"
					required
					oninvalid={revealInvalid}
					maxlength="1000"
					rows="4"
					placeholder="Jelaskan program, siapa yang bisa mengklaim, dan manfaat utamanya."
					>{field('description', value?.description)}</textarea
				>
			</div>
			<div class="field field-wide">
				<label for={`${idPrefix}-benefits`}>Benefit <span class="required">*</span></label>
				<textarea
					id={`${idPrefix}-benefits`}
					name="benefits"
					required
					oninvalid={revealInvalid}
					rows="5"
					placeholder="Kredit gratis untuk akun baru; akses API selama masa promo"
					>{field('benefits', value?.benefits.join('\n'))}</textarea
				>
				<small>Satu benefit per baris; tulis nominal atau batas pemakaian bila ada.</small>
			</div>
			<details
				class="optional-fields field-wide"
				open={Boolean(field('requirements', value?.requirements.join('\n')))}
			>
				<summary>Syarat dan langkah klaim <span>opsional</span></summary>
				<div class="field-grid">
					<div class="field field-wide">
						<label for={`${idPrefix}-requirements`}>Syarat dan langkah klaim</label>
						<textarea
							id={`${idPrefix}-requirements`}
							name="requirements"
							rows="5"
							placeholder="Daftar dengan akun baru; verifikasi email; masukkan kode promo"
							>{field('requirements', value?.requirements.join('\n'))}</textarea
						>
						<small
							>Satu langkah atau syarat per baris. Jangan tulis “tanpa syarat” bila registrasi tetap
							wajib.</small
						>
					</div>
				</div>
			</details>
		</div>
	</details>

	<details class="editor-section" open={Boolean(value || draft)}>
		<summary class="section-heading">
			<span class="section-icon"><i class="fa-solid fa-link" aria-hidden="true"></i></span>
			<div>
				<p class="section-kicker">03 / KLAIM & VALIDITAS</p>
				<h3 id={`${idPrefix}-source-heading`}>Beri jalur klaim yang bisa diverifikasi</h3>
				<p>Link sumber dan tanggal berlaku membantu kami meninjau usulan lebih cepat.</p>
			</div>
			<i class="fa-solid fa-chevron-down section-chevron" aria-hidden="true"></i>
		</summary>
		<div class="field-grid">
			<div class="field field-wide">
				<label for={`${idPrefix}-ctaLink`}>Link klaim <span class="required">*</span></label>
				<input
					id={`${idPrefix}-ctaLink`}
					name="ctaLink"
					type="url"
					required
					oninvalid={revealInvalid}
					placeholder="https://provider.com/promo"
					value={field('ctaLink', value?.ctaLink)}
				/>
			</div>
			<div class="field field-wide">
				<label for={`${idPrefix}-source`}>Sumber informasi <span class="required">*</span></label>
				<input
					id={`${idPrefix}-source`}
					name="source"
					type="url"
					required
					oninvalid={revealInvalid}
					placeholder="https://provider.com/announcement"
					value={field('source', value?.source)}
				/>
				<small>Utamakan halaman promo atau pengumuman resmi, bukan halaman depan umum.</small>
			</div>
			<details
				class="optional-fields field-wide"
				open={Boolean(
					field('promoCode', value?.promoCode) ||
					field('validityDate', value?.validity.date) ||
					field('validityDescription', value?.validity.description) ||
					field('validityType', value?.validity.type || 'uncertain') !== 'uncertain' ||
					field('status', value?.status || 'active') !== 'active'
				)}
			>
				<summary>Kode promo, masa berlaku & status <span>opsional</span></summary>
				<div class="field-grid">
					<div class="field">
						<label for={`${idPrefix}-promoCode`}
							>Kode promo <span class="optional">opsional</span></label
						>
						<input
							id={`${idPrefix}-promoCode`}
							name="promoCode"
							placeholder="Contoh: PROMO2026"
							value={field('promoCode', value?.promoCode)}
						/>
					</div>
					<div class="field">
						<label for={`${idPrefix}-validityType`}>Jenis masa berlaku</label>
						<select id={`${idPrefix}-validityType`} name="validityType">
							<option
								value="uncertain"
								selected={field('validityType', value?.validity.type || 'uncertain') ===
									'uncertain'}>Belum pasti</option
							>
							<option
								value="fixed"
								selected={field('validityType', value?.validity.type || 'uncertain') === 'fixed'}
								>Tanggal tertentu</option
							>
							<option
								value="forever"
								selected={field('validityType', value?.validity.type || 'uncertain') === 'forever'}
								>Berlaku terus</option
							>
						</select>
					</div>
					<div class="field">
						<label for={`${idPrefix}-validityDate`}
							>Tanggal terakhir klaim <span class="optional">jika ada</span></label
						>
						<input
							id={`${idPrefix}-validityDate`}
							name="validityDate"
							type="date"
							value={field('validityDate', value?.validity.date)}
						/>
					</div>
					<div class="field">
						<label for={`${idPrefix}-status`}>Status program</label>
						<select id={`${idPrefix}-status`} name="status">
							<option
								value="active"
								selected={field('status', value?.status || 'active') === 'active'}
								>Sedang aktif</option
							>
							<option
								value="upcoming"
								selected={field('status', value?.status || 'active') === 'upcoming'}
								>Akan datang</option
							>
							{#if allowExpired}<option
									value="expired"
									selected={field('status', value?.status || 'active') === 'expired'}
									>Sudah berakhir</option
								>{/if}
						</select>
					</div>
					<div class="field field-wide">
						<label for={`${idPrefix}-validityDescription`}
							>Catatan masa berlaku <span class="optional">opsional</span></label
						>
						<input
							id={`${idPrefix}-validityDescription`}
							name="validityDescription"
							placeholder="Contoh: Selama kuota tersedia"
							value={field('validityDescription', value?.validity.description)}
						/>
					</div>
				</div>
			</details>
		</div>
	</details>
</div>

<style>
	.editor-sections {
		display: grid;
		gap: 1.75rem;
	}
	.editor-section + .editor-section {
		border-top: 1px solid var(--border-color);
		padding-top: 1.75rem;
	}
	.section-heading {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
		margin-bottom: 1.3rem;
	}
	summary.section-heading {
		list-style: none;
		cursor: pointer;
		margin-bottom: 0;
	}
	summary.section-heading::-webkit-details-marker,
	.optional-fields > summary::-webkit-details-marker {
		display: none;
	}
	details.editor-section[open] > .section-heading {
		margin-bottom: 1.3rem;
	}
	.section-chevron {
		margin-left: auto;
		color: var(--text-muted);
		transition: transform 0.2s ease;
	}
	details.editor-section[open] .section-chevron {
		transform: rotate(180deg);
	}
	.section-heading:focus-visible,
	.optional-fields > summary:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 4px;
	}
	.optional-fields {
		border: 1px solid var(--border-color);
		border-radius: 0.65rem;
		padding: 0.85rem 1rem;
		background: color-mix(in srgb, var(--bg-primary) 45%, transparent);
	}
	.optional-fields > summary {
		list-style: none;
		cursor: pointer;
		color: var(--text-primary);
		font-size: 0.84rem;
		font-weight: 700;
	}
	.optional-fields > summary span {
		color: var(--text-muted);
		font-size: 0.72rem;
		font-weight: 500;
	}
	.optional-fields[open] > summary {
		margin-bottom: 1rem;
	}
	.section-icon {
		display: grid;
		place-items: center;
		flex: none;
		width: 2.35rem;
		height: 2.35rem;
		border: 1px solid color-mix(in srgb, var(--color-accent) 28%, var(--border-color));
		border-radius: 0.65rem;
		background: var(--color-accent-glow);
		color: var(--color-accent);
	}
	.section-kicker {
		color: var(--color-accent);
		font-size: 0.68rem;
		font-weight: 800;
		letter-spacing: 0.12em;
	}
	h3 {
		color: var(--text-primary);
		font-size: 1.15rem;
		line-height: 1.35;
		margin: 0.15rem 0 0.25rem;
	}
	.section-heading p:last-child {
		color: var(--text-secondary);
		font-size: 0.84rem;
		line-height: 1.5;
	}
	.field-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}
	.field {
		display: grid;
		align-content: start;
		gap: 0.4rem;
		min-width: 0;
	}
	.field-wide {
		grid-column: 1 / -1;
	}
	label {
		color: var(--text-primary);
		font-size: 0.82rem;
		font-weight: 700;
	}
	.required {
		color: var(--color-accent);
	}
	.optional {
		color: var(--text-muted);
		font-size: 0.72rem;
		font-weight: 500;
	}
	small {
		color: var(--text-muted);
		font-size: 0.75rem;
		line-height: 1.45;
	}
	input,
	textarea,
	select {
		width: 100%;
		min-width: 0;
		border: 1px solid var(--border-color);
		border-radius: 0.65rem;
		background: color-mix(in srgb, var(--bg-primary) 65%, var(--bg-secondary));
		color: var(--text-primary);
		padding: 0.75rem 0.85rem;
		font: inherit;
		font-size: 0.88rem;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}
	input::placeholder,
	textarea::placeholder {
		color: var(--text-muted);
		opacity: 0.8;
	}
	input:focus,
	textarea:focus,
	select:focus {
		border-color: var(--color-accent);
		outline: none;
		box-shadow: 0 0 0 3px var(--color-accent-glow);
	}
	input[readonly] {
		color: var(--text-secondary);
		cursor: not-allowed;
	}
	textarea {
		resize: vertical;
		min-height: 6rem;
		line-height: 1.55;
	}
	@media (max-width: 38rem) {
		.field-grid {
			grid-template-columns: 1fr;
		}
		.field-wide {
			grid-column: auto;
		}
		.section-heading {
			gap: 0.7rem;
		}
	}
</style>
