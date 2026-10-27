# bansos.dev

[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)
[![Built with SvelteKit](https://img.shields.io/badge/Built%20with-SvelteKit-ff3e00)](https://kit.svelte.dev/)
[![Deploy: Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://bansos.dev/)
[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?logo=discord&logoColor=white)](https://discord.gg/m4WFaQpNGs)
[![Telegram](https://img.shields.io/badge/Telegram-Join%20Channel-0088cc?logo=telegram&logoColor=white)](https://t.me/bansos_dev)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Follow%20Channel-25D366?logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029Vb8ZXgW1Hsq7j1uhRm0G)

![Bansos Developer Banner](static/og-banner.png)

[**🇮🇩 Indonesia (Default)**](README.md) · [**🌐 English**](README.en.md)

---

# 🌏 Bahasa Indonesia (Default)

`Bantuan sosial untuk developer jelata`

**bansos.dev** adalah open-source katalog info bagi-bagi berkah, promo gratisan, dan diskonan tools coding paling legit khusus untuk developer jelata di Indonesia. Dibuat biar portofolio kita-kita tetep menyala walau dompet lagi sekarat. Nyari domain gratis, hosting free-tier, cloud credits, API credits, database gratisan, atau startup credits? Di sini tempat ngumpulnya! 100% Gratisan, No Clickbait, No Ribet. fr fr 🚀

Situs ini memakai SvelteKit di Cloudflare Pages dengan katalog runtime D1, login GitHub, dan persetujuan admin. Data repo tetap menjadi katalog dasar/fallback; listing baru dan perubahan terbit dari D1 tanpa rebuild. Implementasi dinamis sedang diuji di staging dan belum dirilis ke produksi.

## Keyword cepat

`bansos developer`, `promo developer Indonesia`, `domain gratis`, `cloud credits gratis`, `API credits`, `hosting free tier`, `startup credits`, `developer tools gratis`, `open source Indonesia`, `SvelteKit static site`.

## Fitur utama

- Katalog bansos developer yang crawlable dan mudah dicari.
- Listing domain gratis, cloud gratis, hosting free-tier, API credits, database credits, dan benefit startup.
- Halaman detail dengan provider, benefit, syarat klaim, masa berlaku, status aktif/expired, dan link resmi.
- Filter tag dan highlight rekomendasi/terbaru.
- Data per listing di [`src/lib/data/bansos/`](src/lib/data/bansos/).
- SEO metadata untuk halaman publik, termasuk meta description dan social card pattern.
- Form kontribusi setelah login GitHub, dashboard pemilik, dan review admin.
- Komentar berbasis sesi GitHub/D1, arsip Discussions dengan atribusi asli, serta soft-delete/pemulihan.
- Notifikasi permohonan ke Discord privat admin dan pengumuman listing approved ke kanal publik, dengan antrean durable dan retry manual. Staging tidak mengirim pesan nyata.
- Indikator antrean review admin, diperbarui setiap 60 detik saat halaman aktif.
- Halaman kontribusi publik: [bansos.dev/contribute](https://bansos.dev/contribute).
- Terms and conditions: [bansos.dev/terms](https://bansos.dev/terms).

## Deploy dan Hosting

Situs di-host pada **Cloudflare Pages** memakai `@sveltejs/adapter-cloudflare`. Build/deploy tetap diperlukan untuk perubahan kode. Publikasi dan moderasi konten D1 tidak membutuhkan build baru. Preview GitHub tidak otomatis memiliki D1/OAuth; staging dan produksi harus memakai database, OAuth App, serta secret terpisah. Jangan memberi kredensial atau binding produksi kepada kode PR yang belum dipercaya.

Lihat [arsitektur/lokal](docs/dynamic-catalog.md), [staging](docs/staging-dynamic-catalog.md), [hasil E2E](docs/staging-e2e-2026-10-27.md), dan [persiapan produksi](docs/production-readiness.md). Ekspor snapshot statis lengkap belum tersedia; mode tanpa binding DB membaca katalog repo.

## Menjalankan proyek

```bash
npm install
npm run dev
npm run build
```

Validasi lokal:

```bash
npm run check
npm run lint
```

## Struktur penting

```text
src/lib/data/bansos/<slug>/    # index.json + README tiap listing
src/lib/data/bansos/contributors/ # profil kontributor
src/lib/data/bansos.ts         # loader, selector, sorting, dan stats
src/lib/components/            # komponen UI reusable
src/routes/list/               # halaman list dan detail bansos
src/routes/contribute/         # panduan kontribusi publik
scripts/add-bansos.mjs         # script lokal tambah data
packages/bansosdev-cli/        # CLI lama (submit publik dinonaktifkan)
```

Setiap listing wajib memiliki `contributorSlug` yang terhubung dua arah dengan manifest profil.
Avatar diambil otomatis dari GitHub bila tersedia; profil tanpa GitHub tetap tampil memakai dua
inisial. Semua tautan nama kontributor di situs mengarah ke profil internal bansos.dev.
Konten profil dapat disesuaikan melalui `src/lib/data/bansos/contributors/<slug>/README.md`.
Profil publik memakai URL canonical `https://bansos.dev/<slug>/`; validator mencegah slug contributor
bentrok dengan route situs atau shortlink bansos.

## Cara Menambah Bansos

1. Buka [Kontribusi](https://bansos.dev/contribute/) dan login GitHub.
2. Isi informasi program, sumber resmi, syarat, dan validitas; kirim untuk review.
3. Pantau status, revisi, atau batalkan usulan di Dashboard. Listing hanya terbit setelah admin menyetujui.
4. Edit listing milik sendiri kembali melalui review; arsip langsung menyembunyikannya. Featured hanya ditentukan admin.

AI Agent, Email, Git Clone, dan npx CLI tidak ditampilkan sebagai jalur submit publik pada MVP ini. Alat data repo masih tersedia untuk pemeliharaan katalog dasar oleh maintainer; tidak menggantikan alur moderasi user.

Komentar baru disimpan di D1. Komentar Discussions dapat diimpor satu arah melalui `scripts/import-discussions.mjs`: pertahankan penulis numerik, tanggal, hubungan balasan, dan tautan sumber. Import tidak membuat akun login, mengubah GitHub, atau memulihkan komentar yang sudah dihapus lokal. Snapshot privat tidak boleh di-commit.

## Panduan kualitas listing

Listing yang baik sebaiknya menyertakan:

- Link resmi provider atau halaman program.
- Benefit yang spesifik, misalnya nominal credit, durasi, atau batas kuota.
- Syarat klaim yang jelas.
- Status aktif, expired, atau upcoming.
- Tag yang membantu pencarian, misalnya `Cloud`, `Domain`, `AI Credits`, `Startup`, atau `No Credit Card`.
- Nama dan URL kontributor.

## Kontribusi

- Ajukan listing melalui form setelah login GitHub; admin meninjau sebelum publikasi.
- Perubahan kode tetap melalui branch/PR dan review maintainer.
- Baca panduan kontribusi lengkap di [CONTRIBUTING](https://github.com/wauputr4/bansos/blob/main/.github/CONTRIBUTING.md).

## Kode etik komunitas

Ikuti [Code of Conduct](CODE_OF_CONDUCT.md).

## Sponsor & Dukungan

Proyek `bansos.dev` dibangun secara gratis oleh komunitas. Jika proyek ini membantumu menghemat budget developer-mu, silakan kirim dukungan via email ke [me@wau.my.id](mailto:me@wau.my.id).

> [!NOTE]
> **Soon:** Kami berencana menghadirkan fitur di mana donatur/pengunjung bisa mengirimkan dukungan (donasi) langsung ke masing-masing kontributor yang mendaftarkan/menulis listing bansos tersebut.

## Lisensi

MIT. Lihat [LICENSE](LICENSE).

## Disclaimer

bansos.dev adalah **platform komunitas open-source** yang bertujuan membantu sesama developer Indonesia menemukan program bantuan sosial yang sah dan legal dari provider resmi. Kami tidak terafiliasi dengan provider mana pun.

**Kami dengan tegas melarang:**

- Penyalahgunaan informasi bansos untuk tujuan **abuse** atau mengeksploitasi celah kebijakan provider.
- Pelanggaran terhadap **ketentuan layanan (ToS)** platform atau provider pihak ketiga.
- Tindakan yang melanggar **privasi data** individu atau organisasi.
- Segala bentuk **tindakan ilegal** atau melanggar hukum yang berlaku.
- Submit informasi bansos yang **palsu, menyesatkan, atau tidak bisa diklaim**.

Semua informasi yang ditampilkan bersifat **referensi**. Selalu verifikasi langsung ke situs resmi provider sebelum melakukan klaim. Kami tidak bertanggung jawab atas perubahan kebijakan sepihak dari provider, interpretasi manfaat yang keliru, ataupun penyalahgunaan informasi oleh pihak tidak bertanggung jawab.

Dengan menggunakan bansos.dev, Anda menyetujui bahwa platform ini hanyalah **katalog komunitas** dan segala klaim, transaksi, atau interaksi dengan provider sepenuhnya merupakan tanggung jawab pribadi masing-masing pengguna.
