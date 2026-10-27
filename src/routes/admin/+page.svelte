<script lang="ts">
	import { resolve } from '$app/paths';
	import SubmissionFields from '$lib/components/SubmissionFields.svelte';
	let { data, form } = $props();
	let catalogQuery = $state('');
	const catalogMatches = $derived(
		data.catalog.filter((item) =>
			`${item.title} ${item.id}`.toLowerCase().includes(catalogQuery.toLowerCase())
		)
	);
</script>

<svelte:head
	><title>Moderasi | bansos.dev</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<main class="container admin-page">
	<header class="page-intro">
		<div>
			<p class="eyebrow">ADMIN / MODERASI</p>
			<h1>Pusat moderasi</h1>
			<p>
				Tinjau usulan, kelola akun, dan perbarui katalog. Persetujuan langsung menerbitkan listing.
			</p>
		</div>
		<a class="back-link" href={resolve('/dashboard/')}>← Dashboard kontributor</a>
	</header>
	{#if form?.message}<p class="notice" role="alert">{form.message}</p>{/if}
	<section id="notifications" class="review-section">
		<h2>Notifikasi Discord</h2>
		<p>
			Pengumuman approved: {data.discordEnabled ? 'aktif' : 'dimatikan'}. Notifikasi admin privat: {data.reviewDiscordEnabled
				? 'aktif'
				: 'dimatikan'}. Retry mengikuti jeda percobaan.
		</p>
		{#each data.notifications as notification (`${notification.kind}:${notification.event_key}`)}
			<form method="POST" action="?/retryNotification" class="user-row">
				<span
					>{notification.kind === 'review' ? 'Usulan privat' : 'Listing approved'} · {notification.listing_id}
					· {notification.state} · {notification.attempts} percobaan {notification.last_error ||
						''}</span
				>
				<input type="hidden" name="key" value={notification.event_key} />
				<input type="hidden" name="kind" value={notification.kind} />
				<button
					type="submit"
					disabled={!(notification.kind === 'review'
						? data.reviewDiscordEnabled
						: data.discordEnabled)}>Coba kirim ulang</button
				>
			</form>
		{/each}
	</section>
	<div class="summary-grid">
		<div>
			<span class="metric-icon"><i class="fa-regular fa-clock"></i></span><strong
				>{data.pending.length}</strong
			><span>Perlu ditinjau</span>
		</div>
		<div>
			<span class="metric-icon"><i class="fa-solid fa-users"></i></span><strong
				>{data.users.length}</strong
			><span>Akun terbaru</span>
		</div>
		<div>
			<span class="metric-icon"><i class="fa-solid fa-list"></i></span><strong
				>{data.catalog.length}</strong
			><span>Listing katalog</span>
		</div>
	</div>
	<div class="admin-grid">
		<section class="review-section">
			<div class="section-heading">
				<div>
					<p class="eyebrow">ANTREAN</p>
					<h2>Review usulan</h2>
				</div>
				<span class="count">{data.pending.length} item</span>
			</div>
			{#if !data.pending.length}<div class="empty-state">
					<i class="fa-solid fa-circle-check"></i>
					<h3>Semua beres</h3>
					<p>Belum ada usulan yang perlu ditinjau.</p>
				</div>{/if}
			<div class="review-list">
				{#each data.pending as entry (entry.id)}
					<details class="review-card" id={`submission-${entry.id}`}>
						<summary
							><span class="review-icon"><i class="fa-solid fa-gift"></i></span><span
								class="review-title"
								><strong>{entry.payload.title}</strong><small
									>@{entry.login} · {entry.payload.provider}</small
								></span
							><span class="status"
								>{entry.state === 'needs_changes' ? 'Perlu revisi' : 'Menunggu'}</span
							><i class="fa-solid fa-chevron-down caret"></i></summary
						>
						<div class="review-body">
							<p>{entry.payload.description}</p>
							<div class="source-links">
								<a href={entry.payload.source} target="_blank" rel="noopener noreferrer"
									>Sumber resmi <i class="fa-solid fa-arrow-up-right-from-square"></i></a
								><a href={entry.payload.ctaLink} target="_blank" rel="noopener noreferrer"
									>Link klaim <i class="fa-solid fa-arrow-up-right-from-square"></i></a
								>
							</div>
							<h3>Benefit diajukan</h3>
							<ul>
								{#each entry.payload.benefits as benefit, index (index)}<li>{benefit}</li>{/each}
							</ul>
							<details class="edit-panel">
								<summary><i class="fa-solid fa-pen"></i> Edit isi sebelum menyetujui</summary>
								<form method="POST" action="?/editSubmission">
									<input type="hidden" name="reviewVersion" value={entry.review_version} />
									<input type="hidden" name="submissionId" value={entry.id} /><SubmissionFields
										value={entry.payload}
										idPrefix={`review-${entry.id}`}
									/><button class="secondary-action">Simpan edit admin</button>
								</form>
							</details>
							{#if entry.state === 'pending'}<div class="decision-row">
									<form method="POST" action="?/approve">
										<input type="hidden" name="reviewVersion" value={entry.review_version} />
										<input type="hidden" name="id" value={entry.id} /><button class="primary-action"
											><i class="fa-solid fa-check"></i> Setujui & terbitkan</button
										>
									</form>
								</div>
								<form method="POST" action="?/moderate" class="moderate-form">
									<input type="hidden" name="reviewVersion" value={entry.review_version} />
									<input type="hidden" name="id" value={entry.id} /><label
										for={`review-note-${entry.id}`}>Catatan untuk kontributor</label
									><textarea
										id={`review-note-${entry.id}`}
										name="note"
										required
										placeholder="Jelaskan bagian yang perlu diperbaiki atau alasan penolakan."
									></textarea>
									<div class="decision-row">
										<button name="state" value="needs_changes" class="secondary-action"
											>Minta revisi</button
										><button name="state" value="rejected" class="danger-action"
											>Tolak usulan</button
										>
									</div>
								</form>{/if}
						</div>
					</details>
				{/each}
			</div>
		</section>
		<aside class="side-section">
			<div class="section-heading">
				<div>
					<p class="eyebrow">KOMUNITAS</p>
					<h2>Akun terbaru</h2>
				</div>
			</div>
			<div class="user-list">
				{#each data.users as user (user.github_id)}<div class="user-row">
						<span class="user-avatar">{user.login.slice(0, 1).toUpperCase()}</span><span
							class="user-name"
							><strong>@{user.login}</strong><small
								>{user.role === 'admin'
									? 'Admin'
									: user.banned_at
										? 'Diblokir'
										: 'Kontributor'}</small
							></span
						>{#if user.role !== 'admin'}<form method="POST" action="?/user">
								<input type="hidden" name="githubId" value={user.github_id} /><button
									name="action"
									value={user.banned_at ? 'unban' : 'ban'}
									class="user-action">{user.banned_at ? 'Pulihkan' : 'Ban'}</button
								>
							</form>{/if}
					</div>{/each}
			</div>
			<div class="policy-note">
				<i class="fa-solid fa-shield-halved"></i>
				<p>Featured tetap keputusan admin. Periksa kebijakan donasi sebelum mengaktifkannya.</p>
			</div>
		</aside>
	</div>
	<section class="catalog-section">
		<div class="section-heading">
			<div>
				<p class="eyebrow">KATALOG</p>
				<h2>Edit atau arsipkan listing</h2>
			</div>
		</div>
		<p>Perubahan tersimpan di D1 tanpa rebuild.</p>
		<div class="catalog-picker">
			<label for="catalog-query">Cari listing</label><input
				id="catalog-query"
				bind:value={catalogQuery}
				placeholder="Ketik judul atau slug…"
			/><label for="catalog-select">Pilih hasil</label><select
				id="catalog-select"
				onchange={(event) => {
					if (event.currentTarget.value)
						location.href = `/admin/?item=${encodeURIComponent(event.currentTarget.value)}#catalog`;
				}}
				><option value="">Pilih listing…</option>{#each catalogMatches as item (item.id)}<option
						value={item.id}
						selected={data.selected?.id === item.id}>{item.title}</option
					>{/each}</select
			>
		</div>
		{#if data.selected}<div class="catalog-editor" id="catalog">
				<div class="catalog-editor-head">
					<span class="eyebrow">SEDANG DIEDIT</span>
					<h3>{data.selected.title}</h3>
					<a
						href={resolve('/list/[id]', { id: data.selected.id })}
						target="_blank"
						rel="noopener noreferrer">Lihat publik ↗</a
					>
				</div>
				<form method="POST" action="?/edit">
					<input type="hidden" name="version" value={data.selectedVersion} />
					<label for="owner-id">Pemilik listing (ID GitHub yang sudah login)</label>
					<select id="owner-id" name="ownerId"
						><option value="">Belum ditautkan</option
						>{#each data.users as user (user.github_id)}<option
								value={user.github_id}
								selected={data.selectedOwner === user.github_id}
								>@{user.login} ({user.github_id})</option
							>{/each}</select
					>
					<input type="hidden" name="originalId" value={data.selected.id} /><SubmissionFields
						value={data.selected}
						allowExpired
						idPrefix={`catalog-${data.selected.id}`}
					/><label class="featured-toggle"
						><input type="checkbox" name="featured" checked={data.selected.featured} /> Tampilkan sebagai
						Featured</label
					><button class="primary-action">Simpan perubahan</button>
				</form>
				<form method="POST" action="?/delete" class="archive-form">
					<input type="hidden" name="id" value={data.selected.id} /><button
						class="danger-action"
						onclick={(event) => {
							if (!confirm('Hapus listing dari publik? Data tetap tersimpan dan dapat dipulihkan.'))
								event.preventDefault();
						}}>Hapus listing (dapat dipulihkan)</button
					>
				</form>
				<form method="POST" action="?/archive" class="archive-form">
					<input type="hidden" name="id" value={data.selected.id} /><button class="danger-action"
						>Arsipkan dari katalog</button
					>
				</form>
			</div>{/if}
	</section>
	<section class="catalog-section">
		<h2>Arsip &amp; listing dihapus</h2>
		{#each data.hidden as item (item.id)}<div class="user-row">
				<span>{item.title} — {item.deleted ? 'Dihapus' : 'Arsip'}</span>
				<form method="POST" action="?/restore">
					<input type="hidden" name="id" value={item.id} /><button class="secondary-action"
						>Pulihkan listing</button
					>
				</form>
			</div>{:else}<p>Belum ada arsip.</p>{/each}
	</section>
	<section class="catalog-section" id="comments">
		<h2>Moderasi komentar (100 terbaru)</h2>
		{#each data.comments as comment (`${comment.source}:${comment.id}`)}<article
				class="review-card"
			>
				<p>@{comment.login} · {comment.listing_id}</p>
				{#if comment.source_url}<a
						href={comment.source_url}
						target="_blank"
						rel="noopener noreferrer">Sumber GitHub Discussions</a
					>{/if}
				<p style="white-space: pre-wrap; overflow-wrap: anywhere">{comment.body}</p>
				<form method="POST" action={comment.deleted_at ? '?/restoreComment' : '?/deleteComment'}>
					<input type="hidden" name="id" value={comment.id} /><input
						type="hidden"
						name="source"
						value={comment.source}
					/><button class="danger-action"
						>{comment.deleted_at ? 'Pulihkan komentar' : 'Hapus komentar'}</button
					>
				</form>
			</article>{:else}<p>Belum ada komentar.</p>{/each}
	</section>
</main>

<style>
	.admin-page {
		max-width: 78rem;
		padding-block: 3rem 5rem;
	}
	.page-intro,
	.section-heading {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.eyebrow {
		color: var(--color-accent);
		font-size: 0.72rem;
		font-weight: 850;
		letter-spacing: 0.1em;
	}
	h1 {
		margin: 0.3rem 0 0.5rem;
		color: var(--text-primary);
		font-size: clamp(2rem, 4vw, 3rem);
	}
	h2 {
		margin: 0.2rem 0 0;
		color: var(--text-primary);
		font-size: 1.35rem;
	}
	h3 {
		color: var(--text-primary);
	}
	p,
	small {
		color: var(--text-secondary);
	}
	.page-intro p:last-child {
		max-width: 45rem;
		line-height: 1.6;
	}
	.back-link {
		color: var(--color-accent);
		font-size: 0.85rem;
		font-weight: 700;
	}
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin: 2rem 0 2.75rem;
	}
	.summary-grid > div {
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: 0.85rem;
		align-items: center;
		border: 1px solid var(--border-color);
		border-radius: 0.9rem;
		background: var(--bg-secondary);
		padding: 1.1rem 1.25rem;
	}
	.summary-grid strong {
		color: var(--text-primary);
		font-size: 1.8rem;
		line-height: 1;
	}
	.summary-grid div > span:last-child {
		grid-column: 2;
		color: var(--text-secondary);
		font-size: 0.8rem;
	}
	.metric-icon {
		display: grid;
		grid-row: span 2;
		place-items: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.65rem;
		background: var(--color-accent-glow);
		color: var(--color-accent);
	}
	.admin-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(16rem, 20rem);
		gap: 1.5rem;
		align-items: start;
	}
	.section-heading {
		margin-bottom: 1rem;
	}
	.count {
		color: var(--text-muted);
		font-size: 0.8rem;
	}
	.review-list,
	.user-list {
		display: grid;
		gap: 0.75rem;
	}
	.review-card,
	.empty-state,
	.user-list,
	.policy-note,
	.catalog-section {
		border: 1px solid var(--border-color);
		border-radius: 0.9rem;
		background: var(--bg-secondary);
	}
	.review-card > summary {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 1rem;
		cursor: pointer;
		list-style: none;
	}
	.review-card > summary::-webkit-details-marker {
		display: none;
	}
	.review-icon {
		display: grid;
		place-items: center;
		flex: none;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 0.6rem;
		background: var(--color-accent-glow);
		color: var(--color-accent);
	}
	.review-title {
		display: grid;
		gap: 0.2rem;
		flex: 1;
		min-width: 0;
	}
	.review-title strong {
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}
	.review-title small {
		font-size: 0.75rem;
	}
	.status {
		border-radius: 100px;
		padding: 0.25rem 0.5rem;
		background: rgba(245, 158, 11, 0.13);
		color: #f59e0b;
		font-size: 0.7rem;
		font-weight: 800;
		white-space: nowrap;
	}
	.caret {
		font-size: 0.7rem;
		color: var(--text-muted);
	}
	details[open] > summary .caret {
		transform: rotate(180deg);
	}
	.review-body {
		padding: 1.2rem;
		border-top: 1px solid var(--border-color);
	}
	.review-body > p {
		line-height: 1.6;
	}
	.source-links,
	.decision-row {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin: 1rem 0;
	}
	.source-links a {
		font-size: 0.82rem;
		color: var(--color-accent);
		font-weight: 700;
	}
	.review-body ul {
		padding-left: 1.3rem;
		color: var(--text-secondary);
		line-height: 1.6;
	}
	.primary-action,
	.secondary-action,
	.danger-action,
	.user-action {
		border: 0;
		border-radius: 0.6rem;
		padding: 0.7rem 0.9rem;
		font: inherit;
		font-size: 0.82rem;
		font-weight: 750;
		cursor: pointer;
	}
	.primary-action {
		background: var(--color-accent);
		color: #06130f;
	}
	.secondary-action,
	.user-action {
		border: 1px solid var(--border-color);
		background: color-mix(in srgb, var(--text-primary) 4%, transparent);
		color: var(--text-primary);
	}
	.danger-action {
		border: 1px solid rgba(239, 68, 68, 0.4);
		background: rgba(239, 68, 68, 0.1);
		color: #ef7777;
	}
	.edit-panel {
		border: 1px solid var(--border-color);
		border-radius: 0.7rem;
		padding: 1rem;
		margin: 1rem 0;
	}
	.edit-panel > summary {
		color: var(--color-accent);
		cursor: pointer;
		font-size: 0.85rem;
		font-weight: 700;
	}
	.edit-panel form {
		margin-top: 1rem;
	}
	.edit-panel button {
		margin-top: 1.25rem;
	}
	.moderate-form {
		border-top: 1px solid var(--border-color);
		padding-top: 1.1rem;
	}
	.moderate-form label,
	.catalog-picker label {
		display: block;
		color: var(--text-primary);
		font-size: 0.8rem;
		font-weight: 700;
		margin-bottom: 0.4rem;
	}
	textarea,
	input:not([type='checkbox']):not([type='hidden']),
	select {
		width: 100%;
		border: 1px solid var(--border-color);
		border-radius: 0.6rem;
		background: var(--bg-primary);
		color: var(--text-primary);
		padding: 0.75rem;
		font: inherit;
	}
	textarea {
		min-height: 5rem;
		resize: vertical;
	}
	.user-list {
		padding: 0.4rem 0.9rem;
	}
	.user-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.7rem 0;
	}
	.user-row + .user-row {
		border-top: 1px solid var(--border-color);
	}
	.user-avatar {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		flex: none;
		border-radius: 50%;
		background: var(--color-accent-glow);
		color: var(--color-accent);
		font-size: 0.8rem;
		font-weight: 800;
	}
	.user-name {
		display: grid;
		flex: 1;
		min-width: 0;
		gap: 0.1rem;
		font-size: 0.78rem;
	}
	.user-name strong {
		overflow-wrap: anywhere;
		color: var(--text-primary);
	}
	.user-name small {
		font-size: 0.7rem;
	}
	.user-action {
		padding: 0.4rem 0.55rem;
		font-size: 0.7rem;
	}
	.policy-note {
		display: flex;
		gap: 0.7rem;
		margin-top: 1rem;
		padding: 1rem;
		font-size: 0.78rem;
		line-height: 1.5;
	}
	.policy-note i {
		color: var(--color-accent);
	}
	.empty-state {
		display: grid;
		justify-items: center;
		text-align: center;
		padding: 2.5rem 1rem;
	}
	.empty-state i {
		color: var(--color-accent);
		font-size: 2rem;
	}
	.empty-state h3 {
		margin: 1rem 0 0;
	}
	.empty-state p {
		margin-top: 0.35rem;
	}
	.catalog-section {
		margin-top: 2.5rem;
		padding: clamp(1.2rem, 3vw, 2rem);
	}
	.catalog-picker {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem 1rem;
		margin-top: 1.5rem;
	}
	.catalog-picker label:nth-of-type(2) {
		grid-column: 2;
		grid-row: 1;
	}
	.catalog-picker select {
		grid-column: 2;
		grid-row: 2;
	}
	.catalog-editor {
		margin-top: 2rem;
		border-top: 1px solid var(--border-color);
		padding-top: 1.5rem;
	}
	.catalog-editor-head {
		margin-bottom: 1.5rem;
	}
	.catalog-editor-head h3 {
		margin: 0.35rem 0;
	}
	.catalog-editor-head a {
		font-size: 0.8rem;
		color: var(--color-accent);
	}
	.featured-toggle {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin: 1.5rem 0;
		color: var(--text-primary);
		font-size: 0.85rem;
		font-weight: 700;
	}
	.archive-form {
		border-top: 1px solid var(--border-color);
		margin-top: 1.5rem;
		padding-top: 1.5rem;
	}
	.notice {
		border: 1px solid #f59e0b;
		border-radius: 0.7rem;
		padding: 0.9rem 1rem;
	}
	@media (max-width: 55rem) {
		.admin-grid {
			grid-template-columns: 1fr;
		}
		.side-section {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1rem;
		}
		.side-section .section-heading {
			grid-column: 1 / -1;
		}
		.policy-note {
			margin-top: 0;
		}
	}
	@media (max-width: 38rem) {
		.summary-grid {
			gap: 0.5rem;
		}
		.summary-grid > div {
			display: grid;
			grid-template-columns: 1fr;
			padding: 0.8rem;
		}
		.metric-icon {
			display: none;
		}
		.summary-grid div > span:last-child {
			grid-column: 1;
		}
		.summary-grid strong {
			font-size: 1.4rem;
		}
		.side-section,
		.catalog-picker {
			grid-template-columns: 1fr;
		}
		.side-section .section-heading,
		.catalog-picker label:nth-of-type(2),
		.catalog-picker select {
			grid-column: 1;
			grid-row: auto;
		}
		.status {
			display: none;
		}
	}
</style>
