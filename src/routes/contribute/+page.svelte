<svelte:head>
	<title>Kontribusi bansos.dev</title>
	<meta name="description" content="Cara menambahkan daftar bansos developer ke bansos.dev." />
</svelte:head>

<main class="page-wrapper">
	<section class="container content-shell">
		<p class="eyebrow">Kontribusi</p>
		<h1 class="text-gradient">Punya info bansos? Jangan dinikmati sendirian.</h1>
		<p>
			Info baru bisa ditambahkan lewat Pull Request. Isi minimalnya: nama program, provider,
			benefit, syarat klaim, masa berlaku, link official, tag, dan nama kontributor.
		</p>

		<div class="command-box">
			<p>Contoh tambah item via script:</p>
			<code>npm run add:bansos -- --id contoh-bansos --title "Contoh Bansos" --provider "Provider" --description "Deskripsi singkat" --benefits "Benefit 1|Benefit 2" --validity "Berlaku sampai ..." --requirements "Daftar akun|Klaim program" --cta-link "https://example.com" --tags "Cloud,Gratisan"</code>
		</div>

		<div class="actions">
			<a href="https://github.com/wauputr4/bansos" target="_blank" rel="noopener noreferrer" class="btn-primary">
				Buka GitHub
			</a>
			<a href="/list" class="btn-secondary">Lihat Contoh Data</a>
		</div>
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
		background: rgba(255, 255, 255, 0.04);
		padding: 1rem;
	}

	code {
		display: block;
		overflow-x: auto;
		color: var(--text-primary);
		font-size: 0.82rem;
		line-height: 1.6;
		white-space: nowrap;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}
</style>
