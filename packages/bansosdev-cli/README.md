# bansosdev

CLI untuk menambahkan entri bansos ke repo [bansos.dev](https://bansos.dev).

> [!WARNING]
> Submit publik melalui CLI sedang dinonaktifkan. Gunakan AI Agent, email, atau
> Git clone sesuai panduan kontribusi di README utama. CLI ini tetap tersedia
> untuk validasi payload lokal dengan `--mode json`.

Lihat bantuan CLI:

```bash
npx bansosdev --help
```

## Validasi payload

```bash
npx bansosdev add \
  --id contoh-bansos \
  --title "Contoh Bansos Developer" \
  --provider "Provider" \
  --description "Deskripsi singkat" \
  --benefits "Benefit 1|Benefit 2" \
  --validity-type fixed \
  --validity-date 2026-06-30 \
  --validity-desc "Berlaku khusus akun baru" \
  --published-at 2026-06-13 \
  --requirements "Daftar akun|Klaim program" \
  --cta-link "https://example.com" \
  --contributor-name "Nama Kamu" \
  --contributor-url "https://example.com" \
  --tags "Cloud,Gratisan" \
  --mode json
```

### Parameter Masa Berlaku (Validity)

Data validity menggunakan format terstruktur untuk mempermudah filter dan tampilan UI:

- `--validity-type`: **(Wajib)** Enum: `fixed` | `uncertain` | `forever`.
- `--validity-date`: **(Wajib jika type=fixed)** Format ISO `YYYY-MM-DD`. Sistem akan otomatis men-set status menjadi expired jika waktu lokal server melebihi tanggal ini.
- `--validity-desc`: _(Opsional)_ Deskripsi/catatan tambahan yang akan di-render sebagai tooltip pada UI.
- `--source`: _(Opsional)_ Sumber verifikasi; bisa berupa URL atau teks biasa.

Contoh input `forever` (tanpa date):

```bash
npx bansosdev add ... --validity-type forever --validity-desc "Berlaku selamanya" --mode json
```

```bash
npx bansosdev add ... --mode json
```

Mode `issue` dan `direct` belum aktif sampai workflow kontribusi publik diaktifkan kembali.

## Catatan status

Gunakan `--status active` untuk entry yang masih berlaku, dan `--status expired` untuk yang sudah berakhir.
