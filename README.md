# bansos.dev

[![CI](https://github.com/wauputr4/bansos/actions/workflows/ci.yml/badge.svg)](https://github.com/wauputr4/bansos/actions/workflows/ci.yml)
[![Add Bansos](https://github.com/wauputr4/bansos/actions/workflows/add-bansos.yml/badge.svg)](https://github.com/wauputr4/bansos/actions/workflows/add-bansos.yml)
[![npm bansosdev](https://img.shields.io/npm/v/bansosdev?label=bansosdev&color=10b981)](https://www.npmjs.com/package/bansosdev)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)
[![Built with SvelteKit](https://img.shields.io/badge/Built%20with-SvelteKit-ff3e00)](https://kit.svelte.dev/)
[![Deploy: Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://bansos.dev/)
[![Discord](https://img.shields.io/badge/Discord-Join%20Server-5865F2?logo=discord&logoColor=white)](https://discord.gg/m4WFaQpNGs)
[![Telegram](https://img.shields.io/badge/Telegram-Join%20Channel-0088cc?logo=telegram&logoColor=white)](https://t.me/bansos_dev)

![Bansos Developer Banner](static/og-banner.png)

`Bantuan sosial untuk developer jelata`

**bansos.dev** adalah open-source katalog info bagi-bagi berkah, promo gratisan, dan diskonan tools coding paling legit khusus untuk developer jelata di Indonesia. Dibuat biar portofolio kita-kita tetep menyala walau dompet lagi sekarat. Nyari domain gratis, hosting free-tier, cloud credits, API credits, database gratisan, atau startup credits? Di sini tempat ngumpulnya! 100% Gratisan, No Clickbait, No Ribet. fr fr 🚀

Situs ini dibangun sebagai static SvelteKit site yang super SEO-friendly, data-driven, aman di mode terang/gelap, dan gampang banget buat dikontribusikan lewat CLI atau Pull Request.

## Keyword cepat

`bansos developer`, `promo developer Indonesia`, `domain gratis`, `cloud credits gratis`, `API credits`, `hosting free tier`, `startup credits`, `developer tools gratis`, `open source Indonesia`, `SvelteKit static site`.

## Fitur utama

- Katalog bansos developer yang crawlable dan mudah dicari.
- Listing domain gratis, cloud gratis, hosting free-tier, API credits, database credits, dan benefit startup.
- Halaman detail dengan provider, benefit, syarat klaim, masa berlaku, status aktif/expired, dan link resmi.
- Filter tag dan highlight rekomendasi/terbaru.
- Data terstruktur di [`src/lib/data/bansos.json`](src/lib/data/bansos.json).
- SEO metadata untuk halaman publik, termasuk meta description dan social card pattern.
- Workflow kontribusi via `npx bansosdev add`, GitHub issue, dan Pull Request otomatis.
- Halaman kontribusi publik: [bansos.dev/contribute](https://bansos.dev/contribute).
- Terms and conditions: [bansos.dev/terms](https://bansos.dev/terms).

## Deploy dan Hosting

Situs ini di-deploy dan di-hosting menggunakan **Cloudflare Pages** dengan adapter `@sveltejs/adapter-cloudflare`. Setiap kali ada Pull Request atau push ke branch `main`/`ui-refactor`, Cloudflare secara otomatis memicu build dan mendistribusikan situs statis super cepat beserta seluruh dynamic OG image yang sudah di-prerender.

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
src/lib/data/bansos.json       # data utama listing bansos
src/lib/data/bansos.ts         # helper selector, sorting, dan contributor stats
src/lib/components/            # komponen UI reusable
src/routes/list/               # halaman list dan detail bansos
src/routes/contribute/         # panduan kontribusi publik
scripts/add-bansos.mjs         # script lokal tambah data
packages/bansosdev-cli/        # CLI npx bansosdev
.github/workflows/             # CI, add-entry automation, publish CLI
```

## Cara Menambah Bansos

Ada 3 opsi utama yang bisa kamu pilih untuk mendaftarkan info bansos developer baru, sesuai dengan kenyamananmu:

> [!TIP]
> **Soon: Submisi via Discord & Telegram Bot!**
> Kami sedang membangun integrasi bot agar kamu bisa mengirimkan bansos baru secara otomatis langsung dari server Discord atau channel Telegram tanpa buka GitHub/website.
> Sembari menunggu, yuk gabung ke komunitas kami:
>
> - **[Discord Server](https://discord.gg/m4WFaQpNGs)** untuk ngobrol, diskusi, dan submit via chat (coming soon).
> - **[Telegram Channel](https://t.me/bansos_dev)** untuk dapetin update instan promo developer terbaru langsung di HP-mu.

### 1. Opsi 1: Lewat Web Form (Paling Mudah & Tanpa Coding)

Opsi ini sangat cocok buat kamu yang ingin berbagi info dengan cepat tanpa perlu menyentuh terminal.

1. Buka halaman kontribusi di browser: **[bansos.dev/contribute](https://bansos.dev/contribute)**.
2. Isi formulir informasi bansos secara lengkap (nama bansos, provider, deskripsi, benefit, dll).
3. Klik tombol **Kirim Info**. Sistem akan secara otomatis men-generate halaman Issue GitHub dengan template yang sudah terisi.
4. Klik **Submit new issue** di GitHub. Bot Actions kami akan memproses issue tersebut dan membuatkan Pull Request secara otomatis.

---

### 2. Opsi 2: Lewat Command Line (npx CLI)

Opsi ini ditujukan buat kamu yang lebih suka bermain dengan terminal.
Kamu bisa menjalankan perintah ini untuk menjalankan wizard interaktif di terminalmu:

```bash
npx bansosdev add
```

CLI akan menuntunmu mengisi field demi field, lalu memberikan link instan untuk membuka Issue GitHub. Setelah disubmit, bot otomatis memprosesnya menjadi Pull Request.

_Kamu juga bisa mengirimkan data langsung menggunakan argumen CLI:_

```bash
npx bansosdev add \
  --id contoh-bansos \
  --title "Contoh Bansos Developer" \
  --provider "Example Provider" \
  --description "Deskripsi singkat bansos." \
  --benefits "Benefit satu|Benefit dua" \
  --validity-type fixed \
  --validity-date 2026-06-30 \
  --validity-desc "Berlaku khusus pelajar" \
  --published-at 2026-06-13 \
  --requirements "Buat akun|Klaim program" \
  --cta-link "https://example.com" \
  --contributor-name "Nama Kamu" \
  --contributor-url "https://example.com" \
  --tags "Cloud,Gratisan"
```

### Parameter validity

- `--validity-type` wajib: pilih `fixed`, `uncertain`, atau `forever`.
- `--validity-date` wajib jika `--validity-type fixed`, memakai format `YYYY-MM-DD` (Berfungsi sebagai Tanggal Berakhir).
- `--validity-desc` opsional untuk catatan masa berlaku, kuota, atau syarat khusus.
- `--published-at` opsional untuk tanggal mulai berlaku (start date) dalam format `YYYY-MM-DD`. Default adalah hari ini.
- `--source` opsional untuk sumber verifikasi; bisa berupa URL atau teks biasa.

> **Catatan Otomatisasi:**
>
> - Parameter `provider` akan diekstrak secara otomatis dari domain `cta-link`.
> - Parameter `status` akan dihitung otomatis (`active`, `upcoming`, atau `expired`) berdasarkan tanggal `published-at` dan `validity-date`.

### Cek payload JSON

```bash
npx bansosdev add ... --mode json
```

---

### 3. Opsi 3: Lewat Git Clone (Manual Pull Request)

Opsi ini bagi kamu yang ingin menguji kode secara lokal atau memodifikasi file secara langsung.

1. Clone repositori ini ke komputermu:
   ```bash
   git clone https://github.com/wauputr4/bansos.git
   cd bansos
   npm install
   ```
2. Tambahkan data secara lokal menggunakan helper script:

   ```bash
   npm run add:bansos -- \
     --id contoh-bansos \
     --title "Contoh Bansos Developer" \
     --provider "Example Provider" \
     --description "Deskripsi singkat bansos." \
     --benefits "Benefit satu|Benefit dua" \
     --validity-type fixed \
     --validity-date 2026-06-30 \
     --requirements "Buat akun|Klaim program" \
     --cta-link "https://example.com" \
     --contributor-name "Nama Kamu" \
     --contributor-url "https://example.com" \
     --tags "Cloud,Gratisan"
   ```

   Script ini akan memvalidasi data dan menyimpannya di file data terstruktur `src/lib/data/bansos.json`.

   Argumen `--benefits` dan `--requirements` dipisahkan dengan `|`.
   Argumen `--tags` dipisahkan dengan koma.

3. Buat branch baru, tambahkan commit, push ke fork, dan kirim Pull Request (PR) ke repositori utama.

---

### Maintainer mode (Khusus Admin / Maintainer)

Jika punya token maintainer, gunakan mode direct:

```bash
BANSOSDEV_GITHUB_TOKEN=ghp_xxx npx bansosdev add ... --mode direct
```

Token perlu punya akses repository yang cukup untuk memicu workflow. Mode ini membuat Pull Request otomatis; merge ke `main` akan memicu deploy Cloudflare Pages.

Detail lengkap CLI lihat [docs/bansosdev-cli.md](docs/bansosdev-cli.md).

## Panduan kualitas listing

Listing yang baik sebaiknya menyertakan:

- Link resmi provider atau halaman program.
- Benefit yang spesifik, misalnya nominal credit, durasi, atau batas kuota.
- Syarat klaim yang jelas.
- Status aktif, expired, atau upcoming.
- Tag yang membantu pencarian, misalnya `Cloud`, `Domain`, `AI Credits`, `Startup`, atau `No Credit Card`.
- Nama dan URL kontributor.

## Kontribusi

- Kirim data lewat CLI, buka issue dari URL yang muncul, lalu tunggu PR otomatis dari bot.
- Jika lebih nyaman, tambahkan melalui branch dan Pull Request manual.
- Baca panduan kontribusi lengkap di [CONTRIBUTING](https://github.com/wauputr4/bansos?tab=contributing-ov-file).

## Kode etik komunitas

Ikuti [Code of Conduct](CODE_OF_CONDUCT.md).

## Sponsor & Dukungan

Proyek `bansos.dev` dibangun secara gratis oleh komunitas. Jika proyek ini membantumu menghemat budget developer-mu, silakan pertimbangkan untuk mendukung proyek ini melalui [GitHub Sponsors](https://github.com/sponsors/wauputr4).

> [!NOTE]
> **Soon:** Kami berencana menghadirkan fitur di mana donatur/pengunjung bisa mengirimkan dukungan (donasi) langsung ke masing-masing kontributor yang mendaftarkan/menulis listing bansos tersebut.

## Lisensi

MIT. Lihat [LICENSE](LICENSE).

## Contributors

<a href="https://github.com/wauputr4/bansos/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=wauputr4/bansos" alt="Kontributor bansos.dev" />
</a>
