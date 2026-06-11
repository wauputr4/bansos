# Bansos.dev

`Bantuan sosial untuk developer jelata`

Website statis untuk kumpulan promo dan program bantuan (`bansos`) yang dirancang khusus buat developer.

## Fitur

- Landing page dengan konten SEO-friendly.
- Data bansos terstruktur di `src/lib/data/bansos.ts`.
- Komponen UI modular untuk shell, kartu bansos, dan highlight terbaru.
- Filter tag di halaman list.
- Script CLI untuk menambahkan daftar bansos baru.
- Open Graph, Twitter Card, JSON-LD, dan meta tags.
- Open source dan siap kontribusi.

## List bansos awal

### Promo Domain dari Name.com

- Domain yang berlaku: `.DEV` dan `.APP`
- ✅ Tidak perlu kartu kredit
- ✅ Promo code: `DEVWEEK26`
- ✅ Limit 1 domain per akun
- ✅ Berlaku 8–30 Juni 2026
- ⚠️ Tips: cuma bisa 1 akun

> `"Developer butuh dollar!"`

## Menjalankan proyek

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

## Menambahkan bansos baru

Pakai script supaya format data tetap rapi:

```bash
npm run add:bansos -- \
  --id contoh-bansos \
  --title "Contoh Bansos Developer" \
  --provider "Provider" \
  --description "Deskripsi singkat bansos." \
  --benefits "Benefit satu|Benefit dua" \
  --validity "Berlaku sampai 30 Juni 2026" \
  --requirements "Buat akun|Klaim program" \
  --cta-link "https://example.com" \
  --tags "Cloud,Gratisan" \
  --contributor-name "Nama Kamu" \
  --contributor-url "https://example.com"
```

Argumen list seperti `--benefits` dan `--requirements` dipisahkan dengan `|`.
Argumen `--tags` dipisahkan dengan koma.

## Kontribusi

- Fork repo ini.
- Jalankan branch fitur: `git checkout -b feat/nama-fitur`.
- Tambahkan data dengan `npm run add:bansos -- ...`.
- Tambahkan/rapikan halaman sesuai guide komunitas, lalu kirim PR.

Lihat detail lengkap kontribusi di `[CONTRIBUTING](.github/CONTRIBUTING.md)`.

## Lisensi

MIT. Lihat [LICENSE](LICENSE).

## Author

- Wauputra — [`threads.net/@wauputra`](https://www.threads.net/@wauputra)

## Repo

- GitHub: [github.com/wauputr4/bansos](https://github.com/wauputr4/bansos)
