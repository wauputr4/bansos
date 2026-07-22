# Kontribusi

Terima kasih sudah jadi bagian dari komunitas **Bansos.dev** 🙌

## 1) Cara kontribusi utama

Submit publik yang aktif saat ini adalah lewat **AI Agent**, **Email**, atau **Git clone**. Form,
npx CLI publik, dan bot dinonaktifkan sementara karena spam. Untuk AI Agent, install skill resmi dari
[skills.sh/wauputr4/skill-bansos](https://www.skills.sh/wauputr4/skill-bansos). Buka
[bansos.dev/contribute](https://bansos.dev/contribute) untuk template email dan instruksi terbaru.

## 2) Kontribusi langsung via kode

Kalau kamu lebih nyaman kirim via PR:

1. Fork repository ini.
2. Buat branch: `git checkout -b feat/nama-perubahan`.
3. Tambah atau ubah data di `src/lib/data/bansos/<slug>/index.json` (atau jalankan `npm run add:bansos`).
4. Pastikan `contributorSlug` menunjuk profil di
   `src/lib/data/bansos/contributors/<slug>/manifest.json`, dan ID listing tercatat pada
   `contributedBansos` profil tersebut.
5. Opsional: tambahkan `README.md` pada folder profil untuk konten halaman contributor.
   Profil akan tersedia di URL canonical `https://bansos.dev/<slug>/`; slug harus unik dan tidak
   boleh sama dengan route situs atau slug bansos.
6. Jalankan `npm run validate:data`, `npm run check`, dan `npm run lint`, lalu buat PR.

## Kriteria PR yang baik

- Tautan sumber valid (contoh landing page, syarat, dan masa berlaku).
- Nama program, provider, benefit, dan requirements harus jelas.
- Cantumkan identitas kontributor. GitHub direkomendasikan agar avatar profil dapat dimuat otomatis;
  kontributor tanpa GitHub tetap ditampilkan dengan avatar dua inisial.
- Jika perubahan UI, sertakan preview/screenshot di PR.
- Jika terkait SEO/performa, sebutkan dampak yang diharapkan.

## Helper lokal

- `--benefits` dan `--requirements`: dipisah pakai `|`.
- `--tags`: dipisah dengan koma (`,`).
- `--status` bisa `active` / `expired`.
- `npm run add:bansos` mewajibkan `--contributor-slug` untuk atribusi. Saat profil belum ada,
  tambahkan `--contributor-name`; `--contributor-url` bersifat opsional.

## Komunikasi

- Gunakan bahasa yang jelas dan ringkas di deskripsi PR.
- Mention sumber data atau bukti perubahan masa berlaku.
- Hormati alur review dan responsif saat revisi.
