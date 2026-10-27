<script lang="ts">
	/* eslint-disable svelte/no-navigation-without-resolve -- Imported provenance URLs are validated absolute GitHub URLs, not internal routes. */
	import { resolve } from '$app/paths';
	import type { ListingComment } from '$lib/server/comments';
	let {
		comments,
		viewer,
		message
	}: { comments: ListingComment[]; viewer: App.Locals['user']; message?: string } = $props();
</script>

<section id="comments" aria-label="Komentar komunitas">
	<h2>Komentar komunitas</h2>
	<p>Identitas mengikuti akun GitHub. Menampilkan hingga 50 komentar terbaru.</p>
	{#if message}<p role="alert">{message}</p>{/if}
	{#if viewer && !viewer.banned_at}
		<form method="POST" action="?/comment">
			<label for="comment-body">Komentar sebagai @{viewer.login}</label>
			<textarea
				id="comment-body"
				name="body"
				required
				maxlength="2000"
				rows="4"
				placeholder="Bagikan pengalaman klaim atau laporkan masalah…"
			></textarea>
			<button>Kirim komentar</button>
		</form>
	{:else if viewer?.banned_at}
		<p>Akun diblokir dan tidak dapat berkomentar.</p>
	{:else}
		<a href={resolve('/auth/github/')}>Masuk dengan GitHub untuk berkomentar</a>
	{/if}
	{#each comments as comment (`${comment.source}:${comment.id}`)}
		<article class:reply={!!comment.parent_source_id}>
			<header>
				<a href={`https://github.com/${comment.login}`} rel="nofollow">@{comment.login}</a><time
					>{comment.created_at} UTC</time
				>
			</header>
			{#if comment.source === 'github'}
				<p class="provenance">
					Diimpor dari <a
						href={comment.source_url || 'https://github.com/wauputr4/bansos/discussions'}
						target="_blank"
						rel="noopener noreferrer nofollow">GitHub Discussions</a
					>.
					{#if comment.parent_source_id}
						Balasan untuk @{comment.parent_login || 'penulis komentar'};
						<a
							href={comment.source_url || 'https://github.com/wauputr4/bansos/discussions'}
							target="_blank"
							rel="noopener noreferrer">lihat utas asli</a
						>.{/if}
				</p>
			{/if}
			<p class="body">{comment.body}</p>
			{#if viewer && !viewer.banned_at && (viewer.role === 'admin' || viewer.github_id === comment.github_id)}
				<form method="POST" action="?/deleteComment">
					<input type="hidden" name="id" value={comment.id} />
					<input type="hidden" name="source" value={comment.source} />
					<button
						class="danger"
						onclick={(event) => {
							if (!confirm('Hapus komentar ini? Admin dapat memulihkannya.'))
								event.preventDefault();
						}}>Hapus komentar</button
					>
				</form>
			{/if}
		</article>
	{:else}<p>Belum ada komentar.</p>{/each}
</section>

<style>
	section {
		padding: 1.5rem;
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		background: var(--bg-secondary);
	}
	h2,
	label {
		color: var(--text-primary);
	}
	p,
	time {
		color: var(--text-secondary);
	}
	form {
		display: grid;
		gap: 0.75rem;
	}
	textarea {
		width: 100%;
		box-sizing: border-box;
		resize: vertical;
		background: var(--bg-primary);
		color: var(--text-primary);
		border: 1px solid var(--border-color);
		border-radius: 0.65rem;
		padding: 0.85rem;
		font: inherit;
	}
	button {
		justify-self: start;
		background: var(--color-accent);
		border: 0;
		border-radius: 0.5rem;
		padding: 0.7rem 1rem;
		font: inherit;
		cursor: pointer;
		color: #06130f;
	}
	a {
		color: var(--color-accent);
	}
	article {
		padding-block: 1rem;
		border-top: 1px solid var(--border-color);
		margin-top: 1rem;
	}
	header {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.body {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.reply {
		margin-left: 1rem;
		padding-left: 1rem;
		border-left: 2px solid var(--border-color);
	}
	.provenance {
		font-size: 0.8rem;
	}
	.danger {
		background: transparent;
		border: 1px solid #ef7777;
		color: #ef7777;
	}
</style>
