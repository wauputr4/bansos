# bansosdev

CLI untuk menambahkan entri bansos ke repo [bansos.dev](https://bansos.dev).

Lihat bantuan CLI:

```bash
npx bansosdev --help
```

## Mode contributor

Default mode adalah `issue`.
Issue yang valid akan diproses GitHub Actions menjadi Pull Request otomatis.

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
  --source "https://example.com/source" \
  --contributor-name "Nama Kamu" \
  --contributor-url "https://example.com" \
  --tags "Cloud,Gratisan"
```

### Parameter Masa Berlaku (Validity)

Data validity menggunakan format terstruktur untuk mempermudah filter dan tampilan UI:

- `--validity-type`: **(Wajib)** Enum: `fixed` | `uncertain` | `forever`.
- `--validity-date`: **(Wajib jika type=fixed)** Format ISO `YYYY-MM-DD`. Sistem akan otomatis men-set status menjadi expired jika waktu lokal server melebihi tanggal ini.
- `--validity-desc`: _(Opsional)_ Deskripsi/catatan tambahan yang akan di-render sebagai tooltip pada UI.
- `--source`: _(Opsional)_ Sumber verifikasi; bisa berupa URL atau teks biasa.

Contoh input `forever` (tanpa date):

```bash
npx bansosdev add ... --validity-type forever --validity-desc "Berlaku selamanya"
```

Mode ini akan mencetak URL issue GitHub dengan payload JSON. Setelah issue dibuat,
workflow repo akan mencoba membuat Pull Request otomatis dari payload tersebut.

## Maintainer mode

```bash
BANSOSDEV_GITHUB_TOKEN=ghp_xxx npx bansosdev add ... --mode direct
```

Mode direct memerlukan token dengan permission minimal:

- `contents: write`
- `workflows: write`

## Optional

Perlu cek payload dulu sebelum submit:

```bash
npx bansosdev add ... --mode json
```

## Catatan status

Gunakan `--status active` untuk entry yang masih berlaku, dan `--status expired` untuk yang sudah berakhir.
