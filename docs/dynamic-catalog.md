# Katalog dinamis (MVP lokal)

MVP ini menambahkan login GitHub, pengajuan listing oleh user, persetujuan admin, serta publikasi langsung dari D1. Listing lama tetap dibaca dari berkas repo; listing yang disetujui atau diedit admin disimpan di D1 sebagai overlay. Jadi belum ada migrasi penuh dari katalog statis.

## Menjalankan lokal

1. Salin `wrangler.example.jsonc` menjadi `wrangler.jsonc`. Berkas ini diabaikan Git; contoh ID database hanya untuk simulasi lokal, **jangan dipakai untuk produksi**.
2. Jalankan `npm install`, lalu `npm run db:migrate:local`.
3. Jalankan `npm run build`, lalu `npm run dev:dynamic`.
4. Buka `http://127.0.0.1:5197/auth/demo/?as=user` untuk simulasi user dan `http://127.0.0.1:5197/auth/demo/?as=admin` untuk simulasi pemilik. Demo hanya hidup di hostname lokal apabila `BANSOS_LOCAL_DEMO=1`.

Alurnya: pengunjung membuka `/contribute/`, lalu masuk lewat tombol akun di navbar agar form terbuka. Di UI, jalur AI Agent, Git Clone, Email, npx CLI, Discord, dan Telegram dinonaktifkan; usulan baru dikirim lewat Form setelah login. User memantau status atau mengirim revisi di `/dashboard/`. Admin meninjau di `/admin/`, menyetujui, mengedit, atau mengarsipkan. Listing disetujui langsung muncul pada `/list/`, halaman detail, provider, dan sitemap tanpa build konten baru. Fitur Featured tidak bisa diajukan oleh user; hanya admin yang dapat mengaktifkannya.

Untuk uji otomatis lokal, jalankan `node scripts/smoke-dynamic-local.mjs` saat server hidup. Skrip memakai slug uji unik, lalu mengarsipkan listingnya; datanya tetap berada di D1 lokal untuk audit.

## Sebelum produksi

- Buat database D1 sungguhan, ikat sebagai `DB` pada proyek Cloudflare Pages, dan terapkan migrasi ke database tersebut. Konfigurasi contoh dan `BANSOS_LOCAL_DEMO` tidak boleh dipakai di produksi.
- Buat GitHub OAuth App dengan callback produksi `https://bansos.dev/auth/github/callback/`. Simpan `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`, dan `OWNER_GITHUB_ID` sebagai environment/secrets sesuai kebijakan Cloudflare. Nilai `OWNER_GITHUB_ID` harus ID numerik akun pemilik.
- Uji OAuth asli, moderasi, pembatasan spam, backup/restore D1, dan seluruh halaman dinamis pada lingkungan staging. Build dan preview lokal saja belum membuktikan kesiapan produksi.
- Mode ekspor snapshot statis, OG image khusus listing dinamis, dan profil kontributor internal untuk user baru belum tersedia.
