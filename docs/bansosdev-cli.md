# bansosdev CLI

`bansosdev` adalah CLI untuk submit bansos ke situs [bansos.dev](https://bansos.dev).

## Cara kerja singkat

- Mode default: `issue`.
  CLI menghasilkan URL GitHub Issue dengan payload JSON. Issue yang valid akan dibuatkan Pull Request otomatis oleh GitHub Actions.
- `--mode direct`: maintainer trigger `workflow_dispatch` ke repo untuk membuat Pull Request otomatis.
- `--mode json`: cetak payload JSON saja (untuk validasi).

## Contributor (tanpa token)

```bash
npx bansosdev add \
  --id contoh-bansos \
  --title "Contoh Bansos Developer" \
  --provider "Example Provider" \
  --description "Deskripsi singkat bansos." \
  --benefits "Benefit satu|Benefit dua" \
  --validity-type "uncertain" \
  --validity-desc "Berlaku sampai slot habis" \
  --published-at "2026-06-13" \
  --requirements "Buat akun|Klaim program" \
  --cta-link "https://example.com" \
  --contributor-name "Nama Kamu" \
  --contributor-url "https://example.com" \
  --tags "Cloud,Gratisan"
```

## Maintainer (otomatis ke repo)

```bash
BANSOSDEV_GITHUB_TOKEN=ghp_xxx npx bansosdev add \
  --mode direct \
  --id contoh-bansos \
  --title "Contoh Bansos Developer" \
  --provider "Example Provider" \
  --description "Deskripsi singkat bansos." \
  --benefits "Benefit satu|Benefit dua" \
  --validity-type "fixed" \
  --validity-date "2026-06-30" \
  --requirements "Buat akun|Klaim program" \
  --cta-link "https://example.com" \
  --contributor-name "Nama Kamu" \
  --contributor-url "https://example.com" \
  --tags "Cloud,Gratisan"
```

Token GitHub untuk `--mode direct`:

- Repo scope: `wauputr4/bansos`
- Permission minimum: `contents: write`, `pull-requests: write`, `workflows: write`.
- Simpan di environment lokal / CI secret sebagai `BANSOSDEV_GITHUB_TOKEN`.

Contoh lengkap dengan validasi:

```bash
npx bansosdev add ... --mode json
npx bansosdev add ... --mode direct
```

## Trusted publishing npm

CLI package `bansosdev` terpasang lewat npm trusted publishing.

1. Pastikan workflow `Publish CLI` ada dan berhasil mem-publish versi sebelumnya.
2. Jika perlu setup pertama:
   - Publish versi awal manual
   - Tambah `Trusted Publisher` di npm dengan repository `wauputr4/bansos` dan workflow `publish-cli.yml`
3. Setelah itu publish otomatis memakai GitHub Actions.

Rujukan:

- npm trusted publishing: https://docs.npmjs.com/trusted-publishers/
- npm `bin` field: https://docs.npmjs.com/cli/v10/configuring-npm/package-json
- GitHub `workflow_dispatch`: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions
- GitHub workflow permissions: https://docs.github.com/actions/reference/authentication-in-a-workflow
