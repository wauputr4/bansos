# Staging MVP dinamis — bukan produksi

## Hasil lokal dan batas bukti

Data baru, pemilik numerik GitHub, sesi (hash token), usulan/revisi, komentar, dan audit berada di D1 Wrangler. Katalog repo masih menjadi fallback. Panduan ini mencakup alur lokal dan staging; status persiapan produksi dicatat terpisah dalam checklist produksi. Tes lokal tidak membuktikan OAuth hosted, CDN, atau binding staging.

Jalankan validator, lint, Svelte check, build, lalu dua tes pada server demo khusus lokal:

```sh
node scripts/test-submission-validation.mjs
node scripts/test-discord-outbox.mjs
BANSOS_SMOKE_URL=http://127.0.0.1:5198 node scripts/smoke-dynamic-local.mjs
BANSOS_SMOKE_URL=http://127.0.0.1:5198 node scripts/test-dynamic-security.mjs
```

Server demo memerlukan `BANSOS_LOCAL_DEMO=1 OWNER_GITHUB_ID=1`; jangan mengaktifkannya di hosted environment. Server OAuth asli di port 5197 tetap terpisah dengan demo dimatikan dan ID pemilik sungguhan. Jangan menjalankan tes demo terhadap staging/produksi.

## Alur dan izin yang wajib diterima

- Pengguna hanya mengelola listing yang `owner_github_id`-nya sama dengan ID sesi. Listing repo tidak otomatis diklaim berdasarkan username; admin menautkannya ke akun yang sudah login melalui editor katalog.
- Edit listing terbit menjadi usulan revisi. Konten publik dan Featured tetap utuh sampai admin setuju. Versi katalog mencegah revisi lama menimpa edit admin atau memulihkan listing terarsip.
- Pemilik dapat membatalkan usulan dan mengarsipkan listingnya. Admin dapat menghapus secara soft-delete dan memulihkan listing melalui arsip. Slug yang pernah dipublikasikan tetap dicadangkan.
- Komentar baru memakai sesi GitHub yang sama, teks biasa maksimal 2000 karakter. Penulis atau admin bisa menghapus; admin bisa memulihkan. Sumber Giscus lama tetap di GitHub Discussions. Migrasi `0005` dan importer satu arah menyalin komentar/balasan beserta identitas, waktu, dan tautan sumber ke D1 tanpa menghapus GitHub atau membuat akun login. Tanpa binding DB, widget Giscus lama tetap tersedia sebagai fallback. Lihat [checklist produksi](./production-readiness.md).
- Request mutasi wajib Origin sama, dibatasi 32 KB, query parameter terikat, dan rate limit per akun 30 mutasi/menit serta 5 komentar/menit. User terblokir ditolak. Antrean maksimal 3 usulan/revisi aktif dihitung di SQL INSERT agar aman terhadap request bersamaan.
- Mutasi dan audit berada dalam batch D1 atomik. Sesi kedaluwarsa dibersihkan saat login; bucket rate limit lama dibersihkan bertahap. Halaman dinamis memakai no-store agar approval/arsip tidak tertahan cache.

## Setup terisolasi

1. Pastikan Wrangler login pada akun Cloudflare yang dimaksud. Token kedaluwarsa harus diotorisasi ulang oleh pemilik; jangan menaruh token ke repo/chat.
2. Buat **proyek Pages baru** `bansos-dynamic-staging` dan **D1 baru** bernama sama. Jangan mengubah binding, secret, domain, atau deploy proyek Pages `bansos` produksi.
3. Salin `wrangler.staging.example.jsonc` menjadi `wrangler.staging.jsonc` (ignored). Ganti kedua placeholder ID dengan ID D1 staging baru yang sama. Ini sengaja merupakan satu proyek staging terpisah: environment production/preview di proyek ini keduanya tetap staging, bukan bansos.dev.
4. Terapkan migrasi eksplisit hanya ke D1 staging: `npx wrangler d1 migrations apply bansos-dynamic-staging --remote --config wrangler.staging.jsonc`. Periksa nama dan UUID sebelum menyetujui. Untuk database lama, periksa duplikasi slug pending/needs_changes sebelum migrasi 0003; jangan menghapus data untuk memaksa migrasi.
5. Buat OAuth App staging terpisah dari lokal/produksi, homepage `https://bansos-dynamic-staging.pages.dev/`, callback persis `https://bansos-dynamic-staging.pages.dev/auth/github/callback/`. Tanpa wildcard atau scope repo/email. Masukkan `GITHUB_CLIENT_ID` dan `GITHUB_CLIENT_SECRET` sebagai secret Pages **staging project**. Kredensial lokal tidak dipakai ulang.
6. Tetapkan `OWNER_GITHUB_ID` numerik pemilik, `BANSOS_LOCAL_DEMO=0`, `BANSOS_ENV=staging`, `DISCORD_NOTIFICATIONS_ENABLED=0`, dan `DISCORD_ADMIN_NOTIFICATIONS_ENABLED=0`. Staging juga diblokir di kode dari kedua transport Discord nyata. Aktifkan Cloudflare Access bila tersedia untuk membatasi tester. Jangan mengaktifkan aturan Cache Everything pada route dinamis. Jangan memberikan binding/secret ini ke preview PR fork yang belum dipercaya.
7. Setelah diizinkan deploy staging, build dan deploy artefak lokal ke proyek staging saja. Ini dapat dilakukan tanpa git push; jangan menganggap larangan push sebagai izin deploy produksi. Untuk CI PR berikutnya, batasi branch preview yang dipercaya dan pertahankan proyek/D1 staging terpisah.

Bindings dan konfigurasi preview mengikuti dokumentasi [Cloudflare bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Wrangler Pages configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), dan [branch controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/).

## Acceptance hosted sebelum demo produksi

- `/auth/demo/` mengembalikan 404. Guest tidak bisa submit/comment/mutasi admin.
- Dua identitas GitHub sungguhan: kontributor dan pemilik. Verifikasi callback, cookie Secure/HttpOnly/SameSite, 403 non-admin, submit, revisi, approve, dan reload guest melihat data baru tanpa rebuild.
- Uji edit milik sendiri, IDOR dengan user kedua, pembatalan, arsip, soft-delete/restore, komentar/IDOR/XSS, ban/unban, rate limit, dan request lintas-origin.
- Pastikan teks berisi HTML tampil sebagai teks; token/secret tidak ada pada HTML, log, artefak client, atau network browser selain pertukaran OAuth server-side yang semestinya.
- Uji worker hasil build (bukan hanya Vite), cold start, error D1, refresh setelah approval/restore, serta migrasi fresh dan upgrade. Ambil snapshot/export D1 staging sebelum uji restore. Untuk produksi, siapkan backup, retention komentar yang dihapus, WAF/rate limit pra-login, kuota/alarm, dan rollback kode + skema.

## Privasi dan notifikasi runtime

- `/privacy/` mendokumentasikan identitas GitHub, sesi, kontribusi/komentar, soft delete, audit, pihak ketiga, serta permintaan penghapusan manual melalui kontak pengelola. `/terms/` mencakup akun, moderasi, dan izin publikasi/notifikasi. Ini penyesuaian teknis/transparansi, bukan jaminan persetujuan GitHub atau pendapat hukum.
- Analitik dimatikan seluruhnya pada mode D1 dan staging; tidak mengirim URL akun/callback/query OAuth ke Analytics. Staging memakai banner dan header noindex. Header noindex bukan autentikasi atau pengganti Cloudflare Access.
- Approval memasukkan event `listing:version` dalam batch D1 yang sama dengan publikasi dan audit. Sesudah commit, server mencoba mengirim Discord dengan timeout. Webhook tidak dikirim ke client/log; hanya URL HTTPS Discord yang diterima, tanpa mention/ping dari input pengguna.
- Kegagalan menghasilkan antrean pending dan backoff; admin dapat retry dari bagian Notifikasi. Belum ada cron/scheduler retry otomatis: initial attempt berjalan saat approval, retry manual merupakan fallback. Lease mencegah kiriman paralel; kehilangan acknowledgment setelah Discord menerima pesan tetap dapat menghasilkan duplikat (at-least-once, bukan exactly-once).
- Produksi kelak memerlukan secret runtime `DISCORD_WEBHOOK_URL` dan `DISCORD_NOTIFICATIONS_ENABLED=1`; secret GitHub Actions tidak otomatis tersedia di Pages. Workflow notifikasi berbasis merge main tetap ada. Jangan memasukkan webhook produksi ke staging; uji transport memakai mock tanpa akses jaringan.
- Migrasi `0006` menambahkan outbox privat untuk permohonan/revisi. Webhook dan flag `DISCORD_ADMIN_*` terpisah dari pengumuman approved. ID kanal privat wajib cocok dengan metadata webhook sebelum POST; tidak mengirim deskripsi/sumber/referral yang belum ditinjau. Usulan yang tidak lagi pending dibatalkan saat dispatch. Retry kedua antrean tetap manual admin; staging tidak melakukan GET/POST ke webhook.
- `.env.staging.local` dan `wrangler.staging.jsonc` di-ignore Git dan permission 600. Isi kredensial tidak di-push; upload secret hanya ke project staging melalui CLI tanpa mencetak nilainya. Jangan menyalin `.env.local` lokal ke hosted staging.

## Status setup 27 Oktober 2026

Project Pages `bansos-dynamic-staging` dan D1 dengan nama sama telah dibuat atas izin pemilik, terpisah dari project produksi `bansos`. Keenam migrasi telah diterapkan pada D1 staging. Konfigurasi nyata tersimpan lokal (ignored); konfigurasi contoh tidak berisi database ID atau secret. Deployment dan OAuth hosted harus diverifikasi terpisah; laporan snapshot sebelumnya tidak membuktikan kode notifikasi privat terbaru sampai diuji ulang.

Siap diuji staging tidak berarti siap produksi. Jangan merge #239 atau menerima write produksi sebelum acceptance hosted selesai, ownership listing repo dipetakan, serta backup/restore dan rollback diverifikasi. Resource dan env produksi yang disiapkan tidak berarti kode sudah dirilis; lihat checklist produksi dan catatan deploy aktual.
