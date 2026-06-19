<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Tentang bansos.dev - Open Source Katalog Promo Developer Indonesia</title>
	<meta
		name="description"
		content="bansos.dev adalah proyek open-source katalog promo developer Indonesia untuk menemukan domain gratis, cloud credits, API credits, hosting free-tier, dan benefit startup."
	/>
	<meta
		name="keywords"
		content="bansos.dev, katalog promo developer, open source Indonesia, domain gratis, cloud credits gratis, API credits, hosting free tier, startup credits, SvelteKit"
	/>
</svelte:head>

<main class="page-wrapper">
	<section class="container content-shell">
		<p class="eyebrow">Tentang</p>
		<h1 class="text-gradient">Open-source katalog promo developer Indonesia.</h1>
		<p>
			`bansos.dev` adalah katalog bantuan sosial untuk developer jelata: tempat ngumpulin program
			gratisan, voucher, credit, diskon, dan benefit startup yang relevan buat developer Indonesia.
			Fokusnya simpel: bantu developer hemat budget saat belajar, eksperimen, bikin portofolio, atau
			ship side project.
		</p>
		<p>
			Daftar di dalamnya mencakup domain gratis, hosting free-tier, cloud credits, API credits,
			database credits, program startup, dan promo tools coding lain yang bisa diklaim dari sumber
			resmi provider.
		</p>

		<div class="info-grid">
			<section class="info-card">
				<h2><i class="fa-solid fa-magnifying-glass"></i> Mudah ditemukan</h2>
				<p>
					Setiap listing disimpan sebagai data terstruktur, punya tag, status aktif/expired, masa
					berlaku, provider, benefit, dan langkah klaim supaya gampang dicari dari halaman list
					maupun mesin pencari.
				</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-code-branch"></i> Open source</h2>
				<p>
					Repo `wauputr4/bansos` dibangun sebagai SvelteKit static site yang bisa diaudit, difork,
					dan dikontribusikan lewat GitHub. Data utama tersimpan di `src/lib/data/bansos.json`.
				</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-terminal"></i> Kontribusi via CLI</h2>
				<p>
					Kontributor bisa menambahkan program baru lewat `npx bansosdev add`. Payload yang valid
					akan masuk ke issue dan dapat diproses menjadi Pull Request otomatis.
				</p>
			</section>
			<section class="info-card">
				<h2><i class="fa-solid fa-shield-heart"></i> Kurasi komunitas</h2>
				<p>
					Setiap entry sebaiknya memakai link resmi, deskripsi jujur, dan catatan masa berlaku yang
					jelas. Tujuannya bukan clickbait, tapi katalog praktis buat developer yang lagi hemat
					budget.
				</p>
			</section>
		</div>

		<div class="actions">
			<a href={resolve('/list')} class="btn-primary">Lihat List Bansos</a>
			<a href={resolve('/contribute')} class="about-link">Cara Kontribusi</a>
		</div>

		<section
			class="sponsor-section"
			style="margin-top: 3rem; display: flex; flex-direction: column; gap: 1rem; align-items: center; text-align: center;"
		>
			<h2 style="font-size: var(--font-size-h2); color: var(--text-primary);">
				<i class="fa-solid fa-heart" style="color: #ea4335;"></i> Dukung Proyek Ini
			</h2>
			<p style="max-width: 32rem; color: var(--text-secondary); margin: 0 auto;">
				bansos.dev sepenuhnya gratis dan dibangun oleh komunitas. Jika proyek ini membantumu
				menghemat budget, pertimbangkan untuk mendukung kelangsungan proyek ini.
			</p>
			<div
				class="sponsor-card-wrapper"
				style="width: 100%; max-width: 600px; overflow: hidden; border-radius: 12px; border: 1px solid var(--border-color); background: rgba(255,255,255,0.02); display: flex; justify-content: center; padding: 1rem; margin-top: 0.5rem;"
			>
				<iframe
					src="https://github.com/sponsors/wauputr4/card"
					title="Sponsor wauputr4"
					height="225"
					width="600"
					style="border: 0; width: 100%;"
				></iframe>
			</div>
		</section>
	</section>
</main>

<style>
	.page-wrapper {
		padding-block: 2rem 3rem;
	}

	.content-shell {
		max-width: 56rem;
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

	.info-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.info-card {
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		padding: 1rem;
	}

	.info-card h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0 0 0.5rem;
		color: var(--text-primary);
		font-size: 1.05rem;
		line-height: 1.25;
	}

	.info-card h2 i {
		color: var(--color-accent);
	}

	.info-card p {
		margin: 0;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.about-link {
		color: var(--color-accent);
		font-weight: 800;
	}

	@media (min-width: 48rem) {
		.info-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
