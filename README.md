# Bansos.dev

`Bantuan sosial untuk developer jelata`

Website statis berisi daftar program bantuan dan promo untuk developer, dirancang SEO-friendly.

## Fitur

- Landing page + daftar bansos yang mudah dinavigasi.
- Konten SEO: meta tag, OG/Twitter card, dan JSON-LD.
- Data terstruktur di [`src/lib/data/bansos.json`](src/lib/data/bansos.json).
- UI modular, filter tag, dan highlight terbaru.
- Workflow otomatis untuk menambah data lewat CLI.
- Halaman kontribusi publik: [bansos.dev/contribute](https://bansos.dev/contribute).

## Menjalankan proyek

```bash
npm install
npm run dev
npm run build
```

## Cara menambah bansos

Ada dua cara:

### 1) Via CLI (disarankan untuk kontribusi umum)

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

### Penjelasan Parameter Validity (Masa Berlaku)

Agar format UI seragam, input masa berlaku (validity) kini menggunakan format terstruktur:

- `--validity-type` **(Wajib)**: Pilih salah satu dari `fixed` (ada batas waktu), `uncertain` (tidak menentu), atau `forever` (selamanya).
- `--validity-date` **(Wajib jika type=fixed)**: Tanggal kadaluarsa promo dalam format `YYYY-MM-DD` (contoh: `2026-06-30`). Sistem akan otomatis menandai bansos sebagai `expired` jika melewati tanggal ini.
- `--validity-desc` _(Opsional)_: Tambahan catatan khusus terkait masa berlaku (contoh: "Selama kuota masih ada"). Teks ini akan muncul sebagai _tooltip_ saat label masa berlaku di-hover.
- `--published-at` _(Opsional)_: Tanggal publikasi entry dalam format `YYYY-MM-DD`. Jika kosong, CLI/script akan mengisi tanggal hari ini.

### Cek payload

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

### 2) Maintainer mode (langsung push via trusted workflow)

Jika punya token maintainer, gunakan mode direct:

```bash
BANSOSDEV_GITHUB_TOKEN=ghp_xxx npx bansosdev add ... --mode direct
```

> Perlu `BANSOSDEV_GITHUB_TOKEN` dengan scope yang cukup (`contents: write`, `workflows: write`).

Detail lengkap CLI lihat [docs/bansosdev-cli.md](docs/bansosdev-cli.md).

## Kontribusi

- Kirim data lewat CLI (cara utama), buka issue dari URL yang muncul, lalu tunggu PR otomatis dari bot.
- Jika lebih nyaman, tambahkan melalui branch + PR manual.
- Lihat panduan kontribusi lengkap di [CONTRIBUTING](https://github.com/wauputr4/bansos?tab=contributing-ov-file).

## Kode etik komunitas

- Ikuti [Code of Conduct](CODE_OF_CONDUCT.md).

## Lisensi

MIT. Lihat [LICENSE](https://github.com/wauputr4/bansos?tab=License-1-ov-file).

## Contributors

<a href="https://github.com/wauputr4/bansos/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=wauputr4/bansos" alt="Kontributor bansos.dev" />
</a>
