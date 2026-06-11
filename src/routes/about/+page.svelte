<svelte:head>
	<title>Tentang bansos.dev</title>
	<meta name="description" content="Tentang bansos.dev, katalog bantuan sosial untuk developer jelata." />
</svelte:head>

<main class="page-wrapper">
	<section class="container content-shell">
		<p class="eyebrow">Tentang</p>
		<h1 class="text-gradient">Bantuan sosial untuk developer jelata.</h1>
		<p>
			`bansos.dev` adalah katalog kecil buat ngumpulin promo, credit, diskon, dan program gratisan
			yang relevan buat developer. Fokusnya simpel: bantu developer hemat budget saat belajar,
			eksperimen, bikin portofolio, atau ship side project.
		</p>
		<p>
			Semua daftar disimpan sebagai data terstruktur, jadi mudah dicari, difilter lewat tag, dan
			dikontribusikan lewat GitHub.
		</p>
		<a href="/list" class="btn-primary">Lihat List Bansos</a>
	</section>
</main>

<style>
	.page-wrapper {
		padding-block: 2rem 3rem;
	}

	.content-shell {
		max-width: 46rem;
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

	.btn-primary {
		width: fit-content;
		margin-top: 0.5rem;
	}
</style>
