# bansosdev

CLI untuk menambahkan entri bansos ke repo [bansos.dev](https://bansos.dev).

## Mode contributor

Default mode adalah `issue`.

```bash
npx bansosdev add \
  --id contoh-bansos \
  --title "Contoh Bansos Developer" \
  --provider "Provider" \
  --description "Deskripsi singkat" \
  --benefits "Benefit 1|Benefit 2" \
  --validity "Berlaku sampai 30 Juni 2026" \
  --requirements "Daftar akun|Klaim program" \
  --cta-link "https://example.com" \
  --contributor-name "Nama Kamu" \
  --contributor-url "https://example.com" \
  --tags "Cloud,Gratisan"
```

Mode ini akan mengembalikan URL issue GitHub untuk di-review maintainer.

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
