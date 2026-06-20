<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<svelte:head>
	<title>Syarat dan Ketentuan bansos.dev</title>
	<meta
		name="description"
		content="Syarat dan ketentuan penggunaan bansos.dev sebagai katalog promo, credit, diskon, dan program gratisan untuk developer."
	/>
	<link rel="canonical" href="https://bansos.dev/terms/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://bansos.dev/terms/" />
	<meta property="og:title" content="Syarat dan Ketentuan bansos.dev" />
	<meta
		property="og:description"
		content="Syarat dan ketentuan penggunaan bansos.dev sebagai katalog promo, credit, diskon, dan program gratisan untuk developer."
	/>
	<meta property="og:image" content="https://bansos.dev/og.png" />

	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://bansos.dev/terms/" />
	<meta property="twitter:title" content="Syarat dan Ketentuan bansos.dev" />
	<meta
		property="twitter:description"
		content="Syarat dan ketentuan penggunaan bansos.dev sebagai katalog promo, credit, diskon, dan program gratisan untuk developer."
	/>
	<meta property="twitter:image" content="https://bansos.dev/og.png" />
</svelte:head>

<main class="page-wrapper">
	<section class="container content-shell">
		<p class="eyebrow">Terms and Conditions</p>
		<h1 class="text-gradient">Syarat dan ketentuan bansos.dev.</h1>
		<p class="lead">
			Dengan memakai bansos.dev, kamu setuju bahwa situs ini adalah katalog komunitas untuk
			menemukan info promo, credit, diskon, dan program gratisan yang relevan buat developer.
		</p>

		<section class="terms-section">
			<h2>1. Informasi bersifat referensi</h2>
			<p>
				Daftar bansos dikurasi dari sumber publik atau kontribusi komunitas. Kami berusaha menjaga
				data tetap akurat, tapi detail program seperti masa berlaku, kuota, syarat klaim, benefit,
				dan link dapat berubah sewaktu-waktu oleh penyedia program.
			</p>
		</section>

		<section class="terms-section">
			<h2>2. Bukan afiliasi resmi</h2>
			<p>
				bansos.dev bukan perwakilan resmi dari provider yang tercantum, kecuali dinyatakan secara
				eksplisit. Semua merek, nama produk, dan logo tetap menjadi milik pemiliknya masing-masing.
			</p>
		</section>

		<section class="terms-section">
			<h2>3. Gunakan link resmi</h2>
			<p>
				Sebelum klaim program, cek ulang detailnya di halaman resmi provider. Keputusan untuk
				mendaftar, mengirim data, memasukkan kartu pembayaran, atau memakai layanan pihak ketiga
				sepenuhnya menjadi tanggung jawab pengguna.
			</p>
		</section>

		<section class="terms-section">
			<h2>4. Kontribusi komunitas &amp; Aturan Link Referral</h2>
			<p>
				Kontribusi harus menyertakan informasi yang benar, sumber resmi, dan tidak menyesatkan.
				Kontributor dilarang keras mengirim spam, link berbahaya, atau program palsu.
			</p>
			<p style="margin-top: 0.5rem;">
				<strong>Kebijakan Link Referral:</strong> Siapa pun diperbolehkan memasukkan link referral
				milik mereka sendiri saat mengajukan program bansos baru. Namun,
				<strong
					>dilarang keras menimpa atau mengganti (replace) link referral milik kontributor lain</strong
				> yang sudah terdaftar sebelumnya demi menjaga sportivitas dan menghargai kontributor pertama
				program tersebut (gentleman's agreement).
			</p>
		</section>

		<section class="terms-section">
			<h2>5. Perubahan konten</h2>
			<p>
				Maintainer dapat memperbarui, menolak, menyunting, menandai expired, atau menghapus listing
				jika informasinya tidak valid, sudah tidak relevan, berisiko menyesatkan, atau tidak sesuai
				dengan tujuan bansos.dev.
			</p>
		</section>

		<section class="terms-section">
			<h2>6. Batas tanggung jawab</h2>
			<p>
				bansos.dev disediakan apa adanya. Kami tidak menjamin setiap program masih aktif, tersedia
				untuk semua pengguna, atau memberikan benefit sesuai ekspektasi. Kerugian akibat penggunaan
				layanan pihak ketiga berada di luar tanggung jawab bansos.dev.
			</p>
		</section>

		<div class="actions">
			<a href={resolve('/list')} class="btn-primary">Lihat List Bansos</a>
			<a href={resolve('/contribute')} class="terms-link">Kontribusi info baru</a>
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

	.lead,
	p {
		color: var(--text-secondary);
	}

	.lead {
		font-size: 1.05rem;
	}

	.terms-section {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		border: 1px solid var(--border-color);
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.04);
		padding: 1rem;
	}

	.terms-section h2 {
		margin: 0;
		color: var(--text-primary);
		font-size: 1.05rem;
		line-height: 1.25;
	}

	.terms-section p {
		margin: 0;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.terms-link {
		color: var(--color-accent);
		font-weight: 800;
	}
</style>
