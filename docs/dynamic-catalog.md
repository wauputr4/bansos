# Katalog dinamis (MVP lokal)

MVP ini menambahkan login GitHub, pengajuan listing oleh user, persetujuan admin, serta publikasi langsung dari D1. Listing lama tetap dibaca dari berkas repo; listing yang disetujui atau diedit admin disimpan di D1 sebagai overlay. Jadi belum ada migrasi penuh dari katalog statis.

## Menjalankan lokal

1. Salin `wrangler.example.jsonc` menjadi `wrangler.jsonc`. Berkas ini diabaikan Git; contoh ID database hanya untuk simulasi lokal, **jangan dipakai untuk produksi**.
2. Jalankan `npm install`, lalu `npm run db:migrate:local`.
3. Jalankan `npm run build`, lalu `npm run dev:dynamic`.
4. Buka `http://127.0.0.1:5197/auth/demo/?as=user` untuk simulasi user dan `http://127.0.0.1:5197/auth/demo/?as=admin` untuk simulasi pemilik. Demo hanya hidup di hostname lokal apabila `BANSOS_LOCAL_DEMO=1`.

Untuk iterasi UI dengan hot reload, setelah migrasi jalankan `BANSOS_LOCAL_DEMO=1 npm run dev -- --host 127.0.0.1 --port 5197 --strictPort` sebagai alternatif langkah build dan `dev:dynamic`. Konfigurasi Vite memasang proxy platform Wrangler hanya pada mode dev, memakai binding D1 lokal dari `wrangler.jsonc`. Jangan menjalankan kedua server di port yang sama. Uji build/worker tetap diperlukan sebelum rilis; mode dev bukan bukti deploy siap produksi.

Jalankan build dan dev secara bergantian: hentikan dev sebelum build penuh dan hidupkan lagi sesudahnya agar HMR tidak menulis ulang manifest yang sedang dibangun.

Untuk OAuth GitHub asli lokal, simpan client ID/secret aplikasi lokal pada `.env.local` (ignored), callback `http://127.0.0.1:5197/auth/github/callback/`, `OWNER_GITHUB_ID` numerik, dan `BANSOS_LOCAL_DEMO=0`. Jangan kirim secret ke chat atau memakai kredensial ini di staging/produksi. Saat menguji kontributor dengan akun pemilik yang sama, kosongkan owner ID hanya pada konfigurasi lokal, lalu login ulang setelah mengaktifkannya kembali. Ini bukan pengganti tes dua akun GitHub terpisah.

Alurnya: pengunjung membuka `/contribute/`, lalu masuk lewat tombol akun di navbar agar form terbuka. AI Agent, Email, Git Clone, dan npx CLI tidak ditampilkan; Discord dan Telegram tetap dinonaktifkan. Usulan baru dikirim lewat Form setelah login. Bagian isi listing dan klaim dapat dibuka-tutup; field opsional tersembunyi secara default pada usulan baru. User dapat merevisi/membatalkan usulan, mengajukan edit listing miliknya untuk review, serta mengarsipkan listingnya. Admin dapat menyetujui, mengedit, menautkan pemilik numerik, mengarsipkan, soft-delete, dan memulihkan listing. Listing disetujui langsung muncul pada katalog tanpa build konten baru. Featured hanya ditentukan admin. Komentar baru memakai sesi GitHub dan D1; penulis/admin bisa menghapus dan admin bisa memulihkan. Lihat [panduan staging dan acceptance](./staging-dynamic-catalog.md).

Untuk uji otomatis lokal, jalankan `node scripts/smoke-dynamic-local.mjs` saat server hidup. Skrip memakai slug uji unik, lalu mengarsipkan listingnya; datanya tetap berada di D1 lokal untuk audit. Migrasi `0002` mencegah slug aktif ganda; form usulan dibatasi 32 KB. Uji ini memakai akun demo, bukan OAuth GitHub asli.

Jalankan `node scripts/test-submission-validation.mjs` untuk regresi validator tanpa database. Batas 32 KB diperiksa pada stream request sebelum parsing, termasuk saat `Content-Length` tidak tersedia. Tanggal kalender yang tidak nyata dan URL dengan kredensial ditolak. Pengujian ini tidak menggantikan rate limit di edge maupun uji OAuth staging.

Approval, edit usulan, dan keputusan moderasi membawa `reviewVersion` dari halaman yang ditinjau admin. Jika pengaju mengubah isi sesudah halaman dibuka, keputusan lama ditolak 409 dan admin harus memuat ulang. Profil kontributor memakai katalog D1 yang sama agar arsip/hapus/edit konsisten. Pada listing D1, tanggal publikasi bukan tanggal mulai promo: status upcoming tetap upcoming sampai admin/owner mengajukan perubahan status yang disetujui (atau validitas fixed berakhir). Perilaku tanggal listing repo lama dipertahankan. `node scripts/test-dynamic-catalog.mjs` menguji regresi visibilitas, status, dan isolasi baris rusak.

## Staging lewat GitHub PR Preview

Cloudflare Pages dapat membuat Preview untuk PR GitHub, tetapi Preview baru siap menguji MVP dinamis bila binding `DB`, migrasi D1, dan variabel OAuth khusus Preview telah dikonfigurasi. PR Preview tidak otomatis memiliki D1 terpisah per PR; konfigurasi `preview` berlaku bersama bagi seluruh Preview pada proyek Pages. Jangan mengikat Preview ke D1 produksi. Jangan memberikan secret OAuth atau akses D1 staging kepada kode PR dari kontributor yang belum dipercaya.

Untuk uji OAuth, gunakan URL staging yang stabil (alias branch atau domain staging) dan callback GitHub yang tepat, bukan URL deployment hash yang berubah setiap push. Lebih aman menyiapkan proyek Pages dan D1 staging terpisah untuk pengujian end-to-end, lalu membatasi branch yang boleh deploy ke sana. Tetapkan `OWNER_GITHUB_ID` akun penguji dan kredensial OAuth staging yang terpisah dari produksi. Terapkan migrasi staging secara eksplisit sebelum menguji PR; Preview deployment sendiri bukan migrasi database.

## Sebelum produksi

Lihat [checklist produksi terkini](./production-readiness.md). Terapkan seluruh migrasi `0001`–`0006`: `0005` menambahkan arsip Discussions dan `0006` antrean notifikasi privat permohonan. Empat migrasi awal saja tidak cukup untuk snapshot kode terbaru. README Indonesia/Inggris sudah mengikuti alur login dan moderasi MVP, bukan lagi panduan submit publik lewat email/AI Agent/Git Clone.

- Buat database D1 sungguhan, ikat sebagai `DB` pada proyek Cloudflare Pages, dan terapkan migrasi ke database tersebut. Konfigurasi contoh dan `BANSOS_LOCAL_DEMO` tidak boleh dipakai di produksi.
- Buat GitHub OAuth App dengan callback produksi `https://bansos.dev/auth/github/callback/`. Simpan `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, dan `OWNER_GITHUB_ID` sebagai environment/secrets sesuai kebijakan Cloudflare. Nilai `OWNER_GITHUB_ID` harus ID numerik akun pemilik.
- Uji OAuth asli, moderasi, pembatasan spam, backup/restore D1, dan seluruh halaman dinamis pada lingkungan staging. Build dan preview lokal saja belum membuktikan kesiapan produksi.
- Tambahkan WAF/rate limit pra-login, batas request di edge, serta observabilitas kuota dan error D1. Rate limit per akun di aplikasi dan batas stream 32 KB sudah ada; keduanya bukan pengganti perlindungan trafik di edge.
- Mode ekspor snapshot statis, OG image khusus listing dinamis, dan profil kontributor internal untuk user baru belum tersedia.
