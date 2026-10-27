<script lang="ts">
	import { resolve } from '$app/paths';
	import SubmissionFields from '$lib/components/SubmissionFields.svelte';
	let { data, form } = $props();
	const pendingCount = $derived(
		data.submissions.filter(
			(entry) => !entry.withdrawn_at && ['pending', 'needs_changes'].includes(entry.state)
		).length
	);
	const publishedCount = $derived(
		data.submissions.filter((entry) => entry.state === 'published').length
	);
</script>

<svelte:head
	><title>Dashboard Kontributor | bansos.dev</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<main class="container dashboard-page">
	<header class="page-intro">
		<div>
			<p class="eyebrow">RUANG KONTRIBUTOR</p>
			<h1>Usulan saya</h1>
			<p>Halo {data.user.display_name}. Pantau proses review dan perbarui usulan dari sini.</p>
		</div>
		<a class="primary-action" href={resolve('/contribute/')}>+ Usulkan bansos</a>
	</header>
	{#if data.submitted}<div class="success-note" role="status">
			<i class="fa-solid fa-circle-check"></i> Usulan diterima dan masuk antrean review. Terima kasih
			sudah berbagi!
		</div>{/if}
	{#if form?.message}<div class="notice" role="alert">{form.message}</div>{/if}
	<div class="summary-grid">
		<div><strong>{data.submissions.length}</strong><span>Total usulan</span></div>
		<div><strong>{pendingCount}</strong><span>Menunggu review</span></div>
		<div><strong>{publishedCount}</strong><span>Sudah terbit</span></div>
	</div>
	<div class="section-head">
		<div>
			<p class="eyebrow">RIWAYAT</p>
			<h2>Kontribusi terbaru</h2>
		</div>
		{#if data.user.role === 'admin'}<a href={resolve('/admin/')}
				>Buka moderasi <i class="fa-solid fa-arrow-right"></i></a
			>{/if}
	</div>
	{#if !data.submissions.length}<div class="empty-state">
			<i class="fa-regular fa-file-lines"></i>
			<h3>Belum ada usulan</h3>
			<p>Mulai dengan membagikan promo developer yang kamu temukan.</p>
			<a class="primary-action" href={resolve('/contribute/')}>Isi form kontribusi</a>
		</div>{/if}
	<div class="submission-list">
		{#each data.submissions as entry (entry.id)}
			<details class="submission-card">
				<summary
					><span class="item-icon"><i class="fa-solid fa-gift"></i></span><span class="item-title"
						><strong>{entry.payload.title}</strong><small
							>{entry.payload.provider} · Diperbarui {entry.updated_at}</small
						></span
					><span
						class="status"
						class:published={entry.state === 'published'}
						class:needs-changes={entry.state === 'needs_changes'}
						>{entry.withdrawn_at
							? 'Dibatalkan'
							: entry.state === 'pending'
								? 'Menunggu'
								: entry.state === 'published'
									? 'Terbit'
									: entry.state === 'needs_changes'
										? 'Perlu revisi'
										: 'Ditolak'}</span
					><i class="fa-solid fa-chevron-down caret"></i></summary
				>
				<div class="submission-body">
					{#if entry.admin_note}<p class="admin-note">
							<i class="fa-solid fa-comment-dots"></i> Catatan admin: {entry.admin_note}
						</p>{/if}
					<p>{entry.payload.description}</p>
					{#if entry.state === 'published'}<a
							class="text-link"
							href={resolve('/list/[id]', { id: entry.payload.id })}
							>Lihat listing <i class="fa-solid fa-arrow-right"></i></a
						>{/if}
					{#if !entry.withdrawn_at && (entry.state === 'pending' || entry.state === 'needs_changes')}
						<details class="edit-panel">
							<summary><i class="fa-solid fa-pen"></i> Edit dan kirim revisi</summary>
							<form method="POST" action="?/revise">
								<input type="hidden" name="submissionId" value={entry.id} /><SubmissionFields
									value={entry.payload}
									idPrefix={`revision-${entry.id}`}
								/><button class="primary-action">Kirim revisi</button>
							</form>
						</details>
						<form method="POST" action="?/withdraw">
							<input type="hidden" name="id" value={entry.id} /><button
								class="primary-action"
								onclick={(event) => {
									if (!confirm('Batalkan usulan ini?')) event.preventDefault();
								}}>Batalkan usulan</button
							>
						</form>
					{/if}
				</div>
			</details>
		{/each}
	</div>
	<section class="submission-list" aria-label="Listing milik saya">
		<h2>Listing milik saya</h2>
		<p>
			Edit listing terbit perlu persetujuan admin. Arsip langsung menyembunyikan listing. Listing
			lama dari repo harus ditautkan admin ke ID GitHub kamu terlebih dahulu.
		</p>
		{#each data.owned as listing (listing.id)}
			<details class="submission-card">
				<summary
					><strong>{listing.payload.title}</strong><span class="status"
						>{listing.deleted_at
							? 'Dihapus admin'
							: listing.state === 'archived'
								? 'Diarsipkan'
								: 'Terbit'}</span
					></summary
				>
				<div class="submission-body">
					{#if listing.state === 'published' && !listing.deleted_at}
						<a class="text-link" href={resolve('/list/[id]', { id: listing.id })}>Lihat listing</a>
						<details class="edit-panel">
							<summary>Edit listing (review admin)</summary>
							<form method="POST" action="?/editPublished">
								<input type="hidden" name="version" value={listing.version} /><SubmissionFields
									value={listing.payload}
									allowExpired
									idPrefix={`owned-${listing.id}`}
								/><button class="primary-action">Ajukan perubahan</button>
							</form>
						</details>
						<form method="POST" action="?/archive">
							<input type="hidden" name="id" value={listing.id} /><button
								class="primary-action"
								onclick={(event) => {
									if (
										!confirm(
											'Arsipkan listing milikmu dan batalkan revisi yang masih menunggu? Admin dapat memulihkannya.'
										)
									)
										event.preventDefault();
								}}>Arsipkan listing saya</button
							>
						</form>
					{:else}<p>Hubungi admin untuk pemulihan listing.</p>{/if}
				</div>
			</details>
		{:else}<p>Belum ada listing yang ditautkan ke akunmu.</p>{/each}
	</section>
</main>

<style>
	.dashboard-page {
		max-width: 75rem;
		padding-block: 3rem 5rem;
	}
	.page-intro,
	.section-head {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.eyebrow {
		color: var(--color-accent);
		font-size: 0.75rem;
		font-weight: 850;
		letter-spacing: 0.1em;
	}
	h1 {
		color: var(--text-primary);
		font-size: clamp(2rem, 4vw, 3rem);
		margin: 0.35rem 0 0.5rem;
	}
	h2 {
		color: var(--text-primary);
		margin: 0.35rem 0 0;
	}
	p,
	small {
		color: var(--text-secondary);
	}
	.primary-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		border: 0;
		border-radius: 0.65rem;
		background: var(--color-accent);
		color: #06130f;
		padding: 0.8rem 1rem;
		font: inherit;
		font-size: 0.85rem;
		font-weight: 800;
		cursor: pointer;
		text-decoration: none;
	}
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin: 2rem 0 2.75rem;
	}
	.summary-grid div {
		display: grid;
		gap: 0.25rem;
		border: 1px solid var(--border-color);
		border-radius: 0.85rem;
		background: var(--bg-secondary);
		padding: 1.25rem;
	}
	.summary-grid strong {
		color: var(--color-accent);
		font-size: 2rem;
		line-height: 1;
	}
	.summary-grid span {
		color: var(--text-secondary);
		font-size: 0.82rem;
		font-weight: 650;
	}
	.section-head {
		margin-bottom: 1rem;
	}
	.section-head a,
	.text-link {
		color: var(--color-accent);
		font-size: 0.85rem;
		font-weight: 700;
	}
	.submission-list {
		display: grid;
		gap: 1rem;
	}
	.submission-card,
	.empty-state {
		border: 1px solid var(--border-color);
		border-radius: 0.9rem;
		background: var(--bg-secondary);
	}
	.submission-card > summary {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.2rem;
		cursor: pointer;
		list-style: none;
	}
	.submission-card > summary::-webkit-details-marker {
		display: none;
	}
	.item-icon {
		display: grid;
		place-items: center;
		width: 2.6rem;
		height: 2.6rem;
		flex: none;
		border-radius: 0.65rem;
		background: var(--color-accent-glow);
		color: var(--color-accent);
	}
	.item-title {
		flex: 1;
		min-width: 0;
		display: grid;
		gap: 0.25rem;
	}
	.item-title strong {
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}
	.item-title small {
		font-size: 0.76rem;
	}
	.status {
		flex: none;
		border-radius: 100px;
		padding: 0.3rem 0.6rem;
		background: rgba(245, 158, 11, 0.13);
		color: #f59e0b;
		font-size: 0.73rem;
		font-weight: 800;
	}
	.status.published {
		background: var(--color-accent-glow);
		color: var(--color-accent);
	}
	.status.needs-changes {
		background: rgba(239, 68, 68, 0.12);
		color: #ef7777;
	}
	.caret {
		color: var(--text-muted);
		font-size: 0.7rem;
	}
	details[open] > summary .caret {
		transform: rotate(180deg);
	}
	.submission-body {
		padding: 0 1.25rem 1.25rem;
		border-top: 1px solid var(--border-color);
	}
	.submission-body > p {
		margin-top: 1rem;
		line-height: 1.6;
	}
	.admin-note,
	.notice,
	.success-note {
		border: 1px solid #f59e0b;
		border-radius: 0.7rem;
		padding: 0.9rem 1rem;
		margin: 1rem 0;
		color: var(--text-primary);
	}
	.success-note {
		border-color: var(--color-accent);
		background: var(--color-accent-glow);
	}
	.edit-panel {
		margin-top: 1.25rem;
		border: 1px solid var(--border-color);
		border-radius: 0.7rem;
		padding: 1rem;
	}
	.edit-panel > summary {
		color: var(--color-accent);
		font-weight: 700;
		cursor: pointer;
	}
	.edit-panel form {
		margin-top: 1.25rem;
	}
	.edit-panel button {
		margin-top: 1.5rem;
	}
	.empty-state {
		display: grid;
		justify-items: center;
		gap: 0.7rem;
		text-align: center;
		padding: 3rem 1rem;
	}
	.empty-state > i {
		color: var(--color-accent);
		font-size: 2rem;
	}
	.empty-state h3 {
		margin: 0;
		color: var(--text-primary);
	}
	@media (max-width: 40rem) {
		.dashboard-page {
			padding-top: 2rem;
		}
		.summary-grid {
			gap: 0.5rem;
		}
		.summary-grid div {
			padding: 0.8rem;
		}
		.summary-grid strong {
			font-size: 1.5rem;
		}
		.status {
			font-size: 0.65rem;
		}
		.item-icon {
			display: none;
		}
	}
</style>
