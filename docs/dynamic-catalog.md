# Katalog dinamis (MVP lokal)

MVP ini menambahkan login GitHub, pengajuan listing oleh user, persetujuan admin, serta publikasi langsung dari D1. Listing lama tetap dibaca dari berkas repo; listing yang disetujui atau diedit admin disimpan di D1 sebagai overlay. Jadi belum ada migrasi penuh dari katalog statis.

## Menjalankan lokal

1. Salin `wrangler.example.jsonc` menjadi `wrangler.jsonc`. Berkas ini diabaikan Git; contoh ID database hanya untuk simulasi lokal, **jangan dipakai untuk produksi**.
2. Jalankan `npm install`, lalu `npm run db:migrate:local`.
3. Jalankan `npm run build`, lalu `npm run dev:dynamic`.
4. Buka `http://127.0.0.1:5197/auth/demo/?as=user` untuk simulasi user dan `http://127.0.0.1:5197/auth/demo/?as=admin` untuk simulasi pemilik. Demo hanya hidup di hostname lokal apabila `BANSOS_LOCAL_DEMO=1`.

Alurnya: pengunjung membuka `/contribute/`, lalu masuk lewat tombol akun di navbar agar form terbuka. Di UI, jalur AI Agent, Email, Discord, dan Telegram dinonaktifkan; opsi Git Clone dan npx CLI tidak ditampilkan. Usulan baru dikirim lewat Form setelah login. Bagian isi listing dan klaim dapat dibuka-tutup; field opsional tersembunyi secara default pada usulan baru. User memantau status atau mengirim revisi di `/dashboard/`. Admin meninjau di `/admin/`, menyetujui, mengedit, atau mengarsipkan. Listing disetujui langsung muncul pada `/list/`, halaman detail, provider, dan sitemap tanpa build konten baru. Fitur Featured tidak bisa diajukan oleh user; hanya admin yang dapat mengaktifkannya.

Untuk uji otomatis lokal, jalankan `node scripts/smoke-dynamic-local.mjs` saat server hidup. Skrip memakai slug uji unik, lalu mengarsipkan listingnya; datanya tetap berada di D1 lokal untuk audit. Migrasi `0002` mencegah slug aktif ganda; form usulan dibatasi 32 KB. Uji ini memakai akun demo, bukan OAuth GitHub asli.

## Staging lewat GitHub PR Preview

Cloudflare Pages dapat membuat Preview untuk PR GitHub, tetapi Preview baru siap menguji MVP dinamis bila binding `DB`, migrasi D1, dan variabel OAuth khusus Preview telah dikonfigurasi. PR Preview tidak otomatis memiliki D1 terpisah per PR; konfigurasi `preview` berlaku bersama bagi seluruh Preview pada proyek Pages. Jangan mengikat Preview ke D1 produksi. Jangan memberikan secret OAuth atau akses D1 staging kepada kode PR dari kontributor yang belum dipercaya.

Untuk uji OAuth, gunakan URL staging yang stabil (alias branch atau domain staging) dan callback GitHub yang tepat, bukan URL deployment hash yang berubah setiap push. Lebih aman menyiapkan proyek Pages dan D1 staging terpisah untuk pengujian end-to-end, lalu membatasi branch yang boleh deploy ke sana. Tetapkan `OWNER_GITHUB_ID` akun penguji dan kredensial OAuth staging yang terpisah dari produksi. Terapkan migrasi staging secara eksplisit sebelum menguji PR; Preview deployment sendiri bukan migrasi database.

## Sebelum produksi

- Buat database D1 sungguhan, ikat sebagai `DB` pada proyek Cloudflare Pages, dan terapkan migrasi ke database tersebut. Konfigurasi contoh dan `BANSOS_LOCAL_DEMO` tidak boleh dipakai di produksi.
- Buat GitHub OAuth App dengan callback produksi `https://bansos.dev/auth/github/callback/`. Simpan `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, dan `OWNER_GITHUB_ID` sebagai environment/secrets sesuai kebijakan Cloudflare. Nilai `OWNER_GITHUB_ID` harus ID numerik akun pemilik.
- Uji OAuth asli, moderasi, pembatasan spam, backup/restore D1, dan seluruh halaman dinamis pada lingkungan staging. Build dan preview lokal saja belum membuktikan kesiapan produksi.
- Tambahkan rate limit/WAF untuk endpoint kontribusi dan autentikasi, batas request di edge, serta observabilitas kuota dan error D1. Batas tiga usulan pending dan batas form 32 KB bukan pengganti rate limit.
- Mode ekspor snapshot statis, OG image khusus listing dinamis, dan profil kontributor internal untuk user baru belum tersedia.
