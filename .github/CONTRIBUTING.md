# Kontribusi

Terima kasih sudah jadi bagian dari komunitas **Bansos.dev** 🙌

## 1) Cara kontribusi utama

1. Jalankan CLI:

```bash
npx bansosdev add --id ... --title ... --provider ... --description ...
```

2. Pastikan payload valid dengan:

```bash
npx bansosdev add ... --mode json
```

3. Klik URL issue yang muncul dari command (atau `mode direct` untuk maintainer) lalu submit.

## 2) Kontribusi langsung via kode

Kalau kamu lebih nyaman kirim via PR:

1. Fork repository ini.
2. Buat branch: `git checkout -b feat/nama-perubahan`.
3. Ubah data melalui `src/lib/data/bansos.ts` (atau jalankan tool internal lokal).
4. Jalankan pengecekan dasar lalu buat PR.

## Kriteria PR yang baik

- Tautan sumber valid (contoh landing page, syarat, dan masa berlaku).
- Nama program, provider, benefit, dan requirements harus jelas.
- Isi field `contributor-name` + `contributor-url` di payload.
- Jika perubahan UI, sertakan preview/screenshot di PR.
- Jika terkait SEO/performa, sebutkan dampak yang diharapkan.

## Batas pengiriman data

- `--benefits` dan `--requirements`: dipisah pakai `|`.
- `--tags`: dipisah dengan koma (`,`).
- `--status` bisa `active` / `expired`.
- Untuk validasi cepat, gunakan `--mode json`.

## Komunikasi

- Gunakan bahasa yang jelas dan ringkas di deskripsi PR.
- Mention sumber data atau bukti perubahan masa berlaku.
- Hormati alur review dan responsif saat revisi.
