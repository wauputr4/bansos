# Kandidat rilis staging dan persiapan produksi — 27 Oktober 2026

Ini rekaman **snapshot staging awal** sebelum persiapan deploy yang diizinkan pemilik, bukan bukti head PR terbaru. Saat snapshot ini diuji, PR masih draft pada `26b1dfe10780df74d8097108a5cc75bdb0c0bf3d`. PR kemudian dipush dan dibuka untuk review; jangan memakai hasil snapshot lama sebagai acceptance perbaikan baru.

Snapshot akhir: https://d324f827.bansos-dynamic-staging.pages.dev, URL stabil https://bansos-dynamic-staging.pages.dev. Worker SHA-256 `832c7b57cdbe4d7e2aca7cc12e8159d0706b09480100a697ed9681fa60d778ff`. Build akhir 8m38s, deploy worker sukses, rerun tes dua akun pada snapshot ini lulus. Svelte check sebelumnya 0 error/0 warning; ESLint, Prettier, validator 129 listing, tes input, mock Discord, dan tes lima migrasi/impor/IDOR lulus.

Smoke snapshot akhir: root/katalog/Contribute/Terms/Privacy HTTP 200, guest admin 303, demo 404; respons no-store/noindex. Statistik D1 menampilkan Vyce tiga komentar. Tidak ada deploy aplikasi MVP ke domain produksi.

## Implementasi

- API statistik dan badge detail membaca jumlah komentar D1 native + impor Discussions, bukan Giscus, bila DB aktif. Penghapusan/pemulihan ikut mengubah jumlah. Jalur tanpa DB tetap memakai integrasi lama.
- Komentar impor disimpan terpisah agar teks lama lebih dari 2.000 karakter tidak terpotong dan penulis historis tidak dibuatkan akun login. Identitas numerik, username, waktu, hubungan parent dan URL sumber dipertahankan; body ditampilkan sebagai teks aman.
- Penulis terautentikasi dapat menghapus salinan miliknya berdasarkan ID numerik, bukan username. Admin dapat menghapus/memulihkan. Import ulang tidak menggandakan data atau membatalkan moderasi lokal. GitHub tidak dimutasi.
- Lonceng admin membaca endpoint privat setiap 60 detik saat halaman aktif. Ini polling in-app, bukan push eksternal. Discord privat untuk usulan baru baru merupakan rekomendasi, belum diaktifkan.
- Counter dashboard tidak lagi menghitung usulan withdrawn sebagai menunggu review dan memasukkan needs_changes.
- README Indonesia/Inggris mengikuti arsitektur D1, login/moderasi, jalur komentar, serta batas preview/static fallback. Panduan produksi ada pada `production-readiness.md`.

## Migrasi dan snapshot

- D1 produksi baru `bansos-production` dibuat terpisah dari staging. Binding Production `DB` disimpan melalui Brave setelah izin spesifik pemilik; tidak memicu deploy saat disimpan.
- Lima migrasi diterapkan, termasuk `0005_legacy_comments.sql`. Akun/sesi/fixture staging tidak disalin.

Pembaruan setelah snapshot awal: `0006_admin_notifications.sql` juga sudah diterapkan pada staging dan produksi sesudah backup. Ini wajib untuk kode outbox privat terbaru; lima migrasi awal saja tidak cukup. Webhook/flag approved publik dan permohonan privat telah disiapkan pemilik, tetapi pengiriman produksi belum diuji. Status dan gate terkini ada di `production-readiness.md`.

- Ekspor GitHub: 24 diskusi listing, 53 komentar termasuk 16 balasan. Diskusi sambutan umum dikecualikan. Dua diskusi yang menunjuk slug sama digabung pada listing tanpa menggandakan node komentar.
- Snapshot SHA-256: `42c944f5ebbb3e8f59e729a00299007f123fba27b4a924c235eaae8380294716`.
- Verifikasi staging dan produksi membandingkan seluruh teks, ID penulis, waktu, relasi balasan, dan URL: sama persis dengan snapshot. Panjang komentar maksimum 3.162 karakter; tidak ada parent hilang.
- Ekspor D1 produksi setelah impor: 57.159 byte, SHA-256 `90d04881e0be1a8a3508e6fb554ea36f18edff8fe7a4f2100db59b223e72d545`. File privat tersimpan di `.local-private/` dan tidak masuk Git.
- Restore diuji pada D1 remote baru yang tidak terikat Pages: 24 diskusi, 53 komentar, 16 balasan, 0 user/sesi/usulan, foreign key bersih, dan perbandingan seluruh baris komentar cocok. Database restore-test kemudian dihapus; backup, D1 produksi, dan staging dipertahankan.

## Dua akun sungguhan

GitHub OAuth telah membuat dua identitas nyata di D1: wauputr4 (admin, 103489788), penadigital00 (user, 167214031). Brave mengonfirmasi sesi akun kedua. Role staging tidak diganti selama tes dua akun.

`scripts/test-staging-two-accounts.mjs --staging-only` menguji endpoint aplikasi dengan sesi acak sementara maksimal sepuluh menit pada dua akun tersebut, atas izin pemilik. Tidak menyalin cookie browser, token tidak dicetak/disimpan; ledger pemulihan hanya memuat hash di direktori privat dan dibersihkan setelah sukses.

Lulus: admin dan endpoint notifikasi ditolak 403 bagi kontributor, approve sendiri ditolak, dashboard mengisolasi pemilik, usulan belum approved tidak publik, approve admin menerbitkan tanpa rebuild, IDOR edit/arsip/komentar ditolak, pemalsuan author diabaikan, count berubah saat hapus/pulihkan, revisi menunggu approval, serta arsip/pulihkan berjalan. Komentar legacy staging juga diuji hapus/pulihkan admin tanpa mengubah GitHub. Fixture disembunyikan dan komentar fixture soft-deleted pada akhir tes.

Harness awal sempat gagal karena koneksi Cloudflare timeout; tidak dilaporkan sebagai bug aplikasi. Assertion POST awal juga salah karena Accept default memicu respons JSON form action berstatus HTTP 200; diperbaiki memakai `Accept: text/html` seperti alur browser. Dua usulan fixture pending dari run awal kemudian dibatalkan melalui endpoint dashboard, bukan SQL konten. Sesi uji dibersihkan; tidak boleh menganggap run gagal sebagai acceptance lulus.

Pemeriksaan akhir: tidak ada sesi uji singkat, fixture publik, atau usulan fixture aktif tersisa. Seluruh 53 komentar legacy tetap terlihat sesudah uji hapus/pulihkan. D1 produksi tetap 0 user/sesi/usulan/listing dinamis; hanya skema dan arsip komentar asli yang disiapkan. Backup/export dan snapshot tidak masuk Git. WIP Sitequ/MiMo checkout utama tidak berubah.

## Audit repo public dan permission

- 443 file terlacak diperiksa: tidak ada file env/config privat terlacak, tidak ada kecocokan secret OAuth lokal/staging yang dikenal, dan tidak ada pola token GitHub/private key/webhook Discord kuat yang ditemukan. Ini bukan scan seluruh riwayat atau seluruh secret produksi.
- Scan output build memeriksa 238 file; tidak menemukan nilai OAuth lokal/staging yang dikenal. Client Secret produksi hanya dimasukkan pemilik ke Cloudflare, tidak dibaca untuk scan.
- URL `.env.local`, `.env.staging.local`, `wrangler.staging.jsonc`, dan snapshot privat yang diuji tidak tersedia publik (404 akhir; beberapa URL staging terlebih dulu redirect kanonis 308).
- GitHub Secret Scanning dan Push Protection aktif; 0 alert terbuka saat dicek. Deteksi tidak mencakup semua jenis secret dan bukan jaminan tidak pernah bocor.
- Aplikasi login memakai `read:user`, tanpa repo/email. Hak admin mengikuti OWNER_GITHUB_ID server-side.
- Instalasi GitHub Cloudflare dibatasi satu repo: `wauputr4/bansos`. App provider tetap memiliki read/write administration, checks, code, deployments, pull requests; jangan menyebutnya read-only. Scope provider tidak diubah.
- GitHub CLI operasional memiliki scope gist, read:org, repo, workflow. Wrangler OAuth operasional memiliki user:read, offline_access, account:read, d1:write, pages:write pada akun Penadigital00. Keduanya lebih luas daripada login aplikasi; tidak diberikan kepada pengguna situs. Penyempitan/rotasi/pencabutan perlu keputusan pemilik, bukan dilakukan diam-diam.
- Preview project utama tidak memiliki binding DB produksi atau OAuth produksi. TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID lama ditemukan lalu dihapus hanya dari konfigurasi Preview melalui Brave atas izin eksplisit pemilik. Sesudah Save, kedua nama tidak ada dan tidak ada perubahan belum tersimpan; hanya metadata kategori Giscus tersisa. Production tidak diubah dalam penghapusan ini. Ini berlaku untuk deploy berikutnya: deployment Preview lama belum dihapus dan token Telegram sebenarnya tidak dirotasi/dicabut, sehingga jangan menganggap semua salinan deployment historis sudah bebas token.
- CF_API_TOKEN produksi lama tersimpan terenkripsi, tetapi scope token tersebut belum diverifikasi. Status account enforce_twofactor=false hanya berarti kebijakan akun tidak mewajibkan 2FA; bukan bukti bahwa pengguna tidak memakai 2FA.
- Proteksi main tetap membutuhkan satu approval terbaru; admin enforcement false. Tidak diubah dalam persiapan ini.

## Konfigurasi produksi yang diperiksa lewat Brave

Pemilik mendaftarkan OAuth App produksi terpisah dan mengisi env sendiri. Nama GITHUB_CLIENT_ID/GITHUB_CLIENT_SECRET/OWNER_GITHUB_ID sudah ada; Client Secret bertipe Secret, owner juga disimpan sebagai Secret sehingga nilainya tidak dibuka. Callback, BANSOS_ENV=production, demo=0, dan Discord=0 diperiksa sebagai teks. Belum ada tes login domain produksi karena kode MVP belum dirilis.

Runtime Discord approved belum dikirim nyata dalam tes staging. Produksi kelak membutuhkan secret webhook dan flag enable, terpisah dari webhook workflow merge main. Jangan mengaktifkan sebelum tujuan kanal benar.

## Putusan

Fungsi inti dan migrasi sudah terbukti di staging; ini layak dilanjutkan ke review PR/rencana cutover. Bukan persetujuan merge/deploy otomatis. Sebelum membuka write publik: keputusan secret Preview, review permission token operasional, WAF/pembatasan pra-login, alarm kuota/error, retention dan ownership katalog repo, serta runbook rollback kode/skema dan smoke domain produksi masih perlu ditutup. Jangan menyebut semua gate prod sudah selesai hanya karena staging lulus.
