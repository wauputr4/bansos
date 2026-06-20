# bansos.dev

[![CI](https://github.com/wauputr4/bansos/actions/workflows/ci.yml/badge.svg)](https://github.com/wauputr4/bansos/actions/workflows/ci.yml)
[![Add Bansos](https://github.com/wauputr4/bansos/actions/workflows/add-bansos.yml/badge.svg)](https://github.com/wauputr4/bansos/actions/workflows/add-bansos.yml)
[![npm bansosdev](https://img.shields.io/npm/v/bansosdev?label=bansosdev&color=10b981)](https://www.npmjs.com/package/bansosdev)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981.svg)](LICENSE)
[![Built with SvelteKit](https://img.shields.io/badge/Built%20with-SvelteKit-ff3e00)](https://kit.svelte.dev/)
[![Deploy: Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://bansos.dev/)

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

## Tech stack

- [SvelteKit](https://kit.svelte.dev/) static site
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- GitHub Actions untuk CI dan workflow kontribusi data
- `bansosdev` CLI untuk submit listing baru

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

## Cara menambah bansos

Ada dua cara:

### 1. Via CLI

Jalankan ini, nanti CLI akan mengembalikan URL issue GitHub yang siap dikirim.
Kalau payload valid, GitHub Actions akan membuat Pull Request otomatis dari issue tersebut:

```bash
npx bansosdev add \
  --id contoh-bansos \
  --title "Contoh Bansos Developer" \
  --provider "Provider" \
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
  --tags "Cloud,Gratisan" \
  --status active
```

### Parameter validity

- `--validity-type` wajib: pilih `fixed`, `uncertain`, atau `forever`.
- `--validity-date` wajib jika `--validity-type fixed`, memakai format `YYYY-MM-DD`.
- `--validity-desc` opsional untuk catatan masa berlaku, kuota, atau syarat khusus.
- `--published-at` opsional untuk tanggal publikasi entry dalam format `YYYY-MM-DD`.
- `--source` opsional untuk sumber verifikasi; bisa berupa URL atau teks biasa.

### Cek payload JSON

```bash
npx bansosdev add ... --mode json
```

### Lokal

```bash
npm run add:bansos -- \
  --id contoh-bansos \
  --title "Contoh Bansos Developer" \
  --provider "Provider" \
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

Argumen `--benefits` dan `--requirements` dipisahkan dengan `|`.
Argumen `--tags` dipisahkan dengan koma.

### 2. Maintainer mode

Jika punya token maintainer, gunakan mode direct:

```bash
BANSOSDEV_GITHUB_TOKEN=ghp_xxx npx bansosdev add ... --mode direct
```

Token perlu punya akses repository yang cukup untuk memicu workflow. Mode ini membuat Pull Request otomatis; merge ke main akan memicu deploy otomatis ke Cloudflare Pages.

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
