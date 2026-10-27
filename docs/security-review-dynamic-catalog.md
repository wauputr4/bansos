# Audit lokal #239 — 27 Oktober 2026

Bagian awal dokumen ini merekam audit lokal pertama, bukan status terakhir staging/produksi. Bukti hosted dan dua akun ada pada laporan `staging-release-candidate-2026-10-27.md`; persiapan rilis ada pada `production-readiness.md`.

## Perubahan yang diverifikasi

- Hak admin dihitung dari ID pemilik konfigurasi saat ini, bukan role lama dalam database. Dev membaca konfigurasi konsisten dengan route OAuth; demo dapat dimatikan walau contoh binding lokal mengaktifkannya.
- Ownership listing memakai ID GitHub numerik, diisi dari usulan saat approve atau dipetakan admin. Username/form input tidak bisa mengambil alih listing.
- Edit listing terbit menjadi revisi termoderasi; konten dan Featured publik belum berubah sampai approval. Versi dan state menjadi syarat SQL sehingga stale edit/approve, arsip, ban, pembatalan, serta pergantian pemilik tidak dapat diabaikan oleh request lama.
- Unique index antrean dan INSERT dengan batas COUNT melindungi duplikasi serta batas tiga usulan dari race. Lima submit paralel hanya menghasilkan tiga antrean; dua request ditolak 429.
- Mutasi penting dan audit dalam batch D1 atomik; audit memakai hasil mutasi, bukan dicatat saat perubahan ditolak. Soft-delete menyimpan tombstone agar data repo tidak muncul kembali. Restore tersedia di UI admin.
- Komentar memakai identitas sesi, bukan field `github_id`; Svelte merendernya sebagai teks. Penulis/admin dapat soft-delete; admin dapat restore. Komentar lama Giscus tidak dimutasi.
- Origin sama diwajibkan untuk POST, request dibatasi 32 KB pada header dan stream sebelum parsing; payload form rusak ditolak 400, atau 415 bila Content-Type lebih dulu ditolak framework. Rate limit berbasis D1 berlaku per akun, termasuk batas komentar. Sesi/bucket kedaluwarsa dibersihkan.
- `no-store` berlaku untuk respons dinamis D1 karena adapter lama memiliki Cache API. Tanpa ini, anonimitas bukan alasan aman untuk meng-cache katalog yang dapat berubah tanpa rebuild.
- OAuth memakai state, PKCE, cookie HttpOnly/SameSite, Secure di HTTPS, dan timeout server-side. Secret lokal tidak ditemukan pada 56 artefak client yang diperiksa.

## Bukti dan batas

Validator data: 129 listing lolos setelah empat listing #240/#244 digabungkan ke simulasi lokal. Svelte check: 0 error/0 warning. Lint/Prettier lolos. Migrasi 0003 berhasil pada D1 lokal yang sudah berisi data; seluruh migrasi juga lolos pada SQLite kosong. Skrip `smoke-dynamic-local.mjs`, `test-dynamic-security.mjs`, dan `test-submission-validation.mjs` menyimpan uji regresi yang dapat diulang.

OAuth GitHub asli: submit sebagai kontributor, akses admin 403, login ulang sebagai pemilik, approve, dan publikasi langsung sudah diuji menggunakan **satu akun bergantian role konfigurasi lokal**. Kasus IDOR, komentar, ban, dan race diuji dengan akun demo lokal berbeda. Itu belum membuktikan dua identitas GitHub hosted atau isolasi database remote.

Data uji hanya di D1 lokal; fixture otomatis disembunyikan/diarsipkan, bukan dihapus permanen. Fixture OAuth asli tetap tersedia agar pemilik bisa melihat demo.

## Gate yang tersisa

1. **Lulus lokal:** build terakhir sukses dan Cloudflare Worker berhasil dikompilasi/dijalankan secara lokal. Kedua skrip E2E lulus pada worker terbaru, termasuk penolakan Content-Type 415 dan no-store pada respons D1 anonim. Secret OAuth tidak ditemukan pada 56 artefak client maupun bundle worker. Ini bukan bukti deployment hosted.
2. Pemilik kemudian mengizinkan deploy staging dan menyelesaikan otorisasi ulang CLI. Project Pages dan D1 baru `bansos-dynamic-staging` telah dibuat; empat migrasi berhasil pada database remote terpisah. Ekspor skema staging juga berhasil dipulihkan pada SQLite kosong. Ini bukan bukti pemulihan data produksi. Deployment dan OAuth hosted tetap gate terpisah; produksi tidak diubah.
3. Pada staging terisolasi: dua akun GitHub sungguhan, callback stabil, Secure cookie, cold start, cache invalidation, fault/error D1, migrasi, export/restore, rollback, dan pembatasan akses preview harus dibuktikan.
4. Sebelum produksi: WAF/pra-login flood protection, alarm kuota/error, kebijakan retention data soft-delete/komentar, pemetaan ownership katalog lama, dan rencana pemulihan. Belum ada sertifikasi keamanan menyeluruh atau izin rilis produksi.

Lihat [runbook staging](./staging-dynamic-catalog.md). Tidak ada push atau merge atas perubahan lokal ini.

## Tambahan hardening staging

Privacy Policy dan Terms mendokumentasikan profil GitHub, sesi, atribusi publik, komentar, moderasi, soft-delete, distribusi Discord, dan permintaan privasi manual. Analitik dimatikan pada seluruh mode D1 dan staging; query/hash URL tidak dikirim sebagai page location. Header DENY, nosniff, referrer-policy, dan permissions-policy membatasi framing dan kapabilitas browser. Staging memakai noindex dan banner, bukan pengganti kontrol akses.

Event Discord dicatat atomik dengan approval di outbox D1. Transport dibatasi ke webhook HTTPS Discord, mention dimatikan, timeout/redacted error/backoff/lease tersedia, serta retry admin. Uji mock lulus tanpa kiriman nyata, termasuk disabled staging, concurrent delivery, 429, dan kegagalan transport. Delivery tidak mengklaim exactly-once dan belum memiliki scheduler retry; percobaan pertama otomatis saat approval, retry berikutnya manual. Secret Actions lama tidak otomatis tersedia di runtime Pages.

## Pemeriksaan dependensi sebelum rilis

Audit registry npm resmi menemukan 17 paket terdampak (10 high, 6 moderate, 1 low) pada lockfile sebelumnya. Pembaruan dalam rentang versi yang sudah dideklarasikan memperbarui SvelteKit ke 2.70.3, devalue 5.9.4, Vite 8.3.5, dan Wrangler 4.153.0 beserta dependensi transitif terkait. Audit ulang: **0 critical/high; 3 moderate dan 2 low masih ada**. Ini bukan klaim bebas kerentanan.

- Advisori devalue GHSA-j22f-vq7h-c4qm dan SvelteKit GHSA-29g2-3rmr-qm68 sudah berada di atas versi perbaikannya. Build dan acceptance staging harus diulang sesudah pembaruan lockfile.
- Moderate tersisa berasal dari esbuild lama yang dibawa adapter/i18n (termasuk penandaan transitif kedua paket). Aplikasi tidak menjalankan server esbuild tersebut; Vite pengembangan hanya bind loopback, bukan layanan produksi. Jangan membuka dev server ke jaringan publik.
- Low SvelteKit/cookie masih memerlukan upgrade major framework untuk audit bersih. Nama/path cookie aplikasi adalah konstanta, bukan input pengguna; redirect action aplikasi menggunakan tujuan internal tetap, selain redirect OAuth ke GitHub yang dirakit server. Endpoint publik dinamis tidak menggunakan header cache-control dari konten pengguna. Kondisi ini mengurangi keterjangkauan, bukan meniadakan advisori framework. Upgrade major harus menjadi pekerjaan terpisah dengan acceptance lengkap, bukan `npm audit fix --force` menjelang deploy.

Antrean privat migrasi 0006 diuji untuk atomisitas, pemisahan webhook publik/privat, pin ID kanal, pembatalan usulan yang tidak lagi pending, lease, dan redaksi error. Privacy Policy Indonesia/Inggris menjelaskan pengiriman ringkasan permohonan ke moderator privat. Staging memblokir kedua transport bahkan bila flag aktif.
