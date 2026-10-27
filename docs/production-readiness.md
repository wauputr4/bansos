# Persiapan produksi MVP D1

Dokumen ini adalah checklist rilis, bukan bukti keberhasilan deploy. Pemilik telah mengizinkan persiapan rilis PR #239; checks, persetujuan branch, dan bukti produksi tetap harus diperiksa pada head terbaru.

## Resource yang telah disiapkan

- Project Pages produksi tetap `bansos`, domain `bansos.dev`.
- D1 baru `bansos-production`, terpisah dari `bansos-dynamic-staging`; binding Production `DB` telah disimpan atas persetujuan pemilik. Berlaku pada deploy berikutnya, bukan deploy otomatis saat menyimpan binding.
- Keenam migrasi `0001`–`0006` telah diterapkan pada produksi dan staging. Migrasi keenam untuk antrean notifikasi privat diterapkan sesudah backup produksi diverifikasi (57.159 byte, SHA-256 `90d04881e0be1a8a3508e6fb554ea36f18edff8fe7a4f2100db59b223e72d545`). Migrasi kelima diperlukan untuk salinan komentar Discussions. Jangan deploy kode terbaru ke database yang belum menerima `0006`, walaupun pengiriman Discord dimatikan.
- Produksi tidak menerima akun, sesi, usulan, atau fixture dari staging. Data repo tetap katalog dasar; tidak perlu memasukkan semua listing repo ke D1.
- OAuth App produksi `bansos.dev` telah disiapkan di Brave dan didaftarkan oleh pemilik. Homepage `https://bansos.dev`, callback `https://bansos.dev/auth/github/callback/`, wildcard/device flow mati.
- Snapshot satu arah memuat 24 diskusi listing dan 53 komentar (16 balasan). Diskusi sambutan umum tidak termasuk. Snapshot diverifikasi terhadap staging sebelum diimpor ke produksi.

## Env yang diisi pemilik di Cloudflare Production

| Nama                                  | Jenis / nilai                                                     |
| ------------------------------------- | ----------------------------------------------------------------- |
| `GITHUB_CLIENT_ID`                    | Client ID OAuth App produksi, server-side                         |
| `GITHUB_CLIENT_SECRET`                | Secret, jangan public/VITE                                        |
| `GITHUB_CALLBACK_URL`                 | `https://bansos.dev/auth/github/callback/`                        |
| `OWNER_GITHUB_ID`                     | `103489788` — wauputr4                                            |
| `BANSOS_LOCAL_DEMO`                   | `0`                                                               |
| `BANSOS_ENV`                          | `production`                                                      |
| `DISCORD_NOTIFICATIONS_ENABLED`       | `0` selama persiapan; `1` setelah webhook runtime siap            |
| `DISCORD_WEBHOOK_URL`                 | Secret runtime untuk pengumuman listing approved, bila diaktifkan |
| `DISCORD_APPROVED_CHANNEL_ID`         | `1518282972359430286` — kanal publik `info-bansos`                |
| `DISCORD_ADMIN_NOTIFICATIONS_ENABLED` | `1` hanya setelah webhook privat dan ID kanal siap                |
| `DISCORD_ADMIN_WEBHOOK_URL`           | Secret terpisah untuk permohonan baru di kanal privat moderator   |
| `DISCORD_ADMIN_CHANNEL_ID`            | `1517926770651959306` — kanal privat `moderator-only`             |

Nilai secret tidak boleh masuk Git, README, screenshot, atau chat. Jangan menghapus env lama yang tidak terkait. Secret webhook GitHub Actions tidak otomatis tersedia pada runtime Pages. Jangan menggunakan app/secret OAuth staging untuk produksi. Preview PR tidak boleh memperoleh binding/secret produksi.

## Komentar dan atribusi

`legacy_discussions` menyimpan metadata/isi diskusi asli; `legacy_comments` menyimpan komentar dan balasan dengan GitHub node ID unik, ID numerik penulis, username historis, tanggal asli, relasi parent, serta URL sumber. Tidak dibuat akun login untuk penulis historis. Komentar lama tidak dibatasi 2.000 karakter dan ditampilkan sebagai teks aman, bukan HTML mentah.

Penghapusan di bansos.dev adalah soft-delete pada salinan D1, tidak menghapus sumber GitHub. Penulis yang login hanya bisa menghapus bila ID GitHub numeriknya cocok; admin bisa hapus/pulihkan. Reimport tidak menggandakan komentar atau menghidupkan ulang komentar yang dihapus lokal. Snapshot adalah salinan satu waktu, bukan sinkronisasi dua arah.

```sh
node scripts/import-discussions.mjs --export
node scripts/import-discussions.mjs --apply --target staging
node scripts/import-discussions.mjs --verify --target staging
# Hanya setelah snapshot staging cocok dan pemilik mengizinkan target produksi:
node scripts/import-discussions.mjs --apply --target production
node scripts/import-discussions.mjs --verify --target production
```

Snapshot/SQL berada pada `.local-private/` (ignored, folder 700/file 600). Konfigurasi migrasi produksi lokal juga ignored. CLI memvalidasi nama dan UUID target; tidak membaca cookie browser dan tidak memutasi GitHub. Bila ada komentar baru setelah snapshot, lakukan ekspor baru sebelum cutover dan verifikasi ulang. Update/edit/delete pada sumber setelah impor memerlukan rekonsiliasi terpisah; tidak diam-diam menimpa moderasi D1.

## Notifikasi admin

Navbar admin memiliki lonceng dengan jumlah usulan pending/needs_changes yang belum dibatalkan. Endpoint hanya dapat dibaca admin dan no-store. Browser memperbaruinya setiap 60 detik saat halaman terlihat. Ini notifikasi in-app berbasis polling, **bukan push saat browser ditutup**.

Permohonan baru dan revisi yang dikirim ulang menambahkan event `review:<id>:<versi>` ke `admin_notification_outbox` dalam batch D1 yang sama dengan mutasi dan audit. Sesudah commit, server mencoba mengirim ringkasan judul, provider, username, dan tautan moderasi ke kanal privat yang ID-nya dipin. Deskripsi lengkap, sumber, dan referral usulan tidak ikut dikirim. Event usulan yang sudah diproses, dibatalkan, atau pemiliknya diblokir tidak dikirim saat retry.

Antrean approved dan antrean permohonan memakai webhook, flag, dan tujuan berbeda. Server memverifikasi ID kanal webhook sebelum mengirim; webhook privat yang sama dengan webhook publik ditolak. Staging memblokir kedua transport, walaupun flag keliru diaktifkan. Timeout/kegagalan meninggalkan event untuk retry manual admin dengan lease dan backoff, bukan scheduler. Pengiriman bersifat at-least-once: acknowledgment yang hilang masih bisa menghasilkan duplikat. Menyetel flag ke `0` menghentikan percobaan pengiriman, bukan menghapus event.

## Izin dan secret Preview

Pemilik telah mengizinkan penghapusan TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID dari konfigurasi Preview project utama, dan perubahan telah disimpan lewat Brave. Tidak ada binding D1/OAuth produksi di Preview. Deployment historis dapat tetap memegang konfigurasi lama; penghapusan env bukan rotasi token Telegram. Penghapusan deployment lama atau rotasi token sebenarnya memerlukan langkah tersendiri. Instalasi Cloudflare GitHub dibatasi satu repo bansos, tetapi CLI operasional GitHub/Wrangler dan CF_API_TOKEN lama masih memerlukan review least-privilege sebelum menyebut seluruh akses minimum.

## Gate sebelum merge/deploy

1. Validasi, unit test impor/count/IDOR, lint, Svelte check, build, scan secret, dan hosted staging pada snapshot kode yang sama.
2. Dua identitas OAuth asli: penadigital00 sebagai contributor, wauputr4 sebagai admin; tidak mengubah owner ID untuk simulasi role. Uji usulan, approve, dashboard terisolasi, IDOR listing/komentar, revisi pending, arsip/hapus/pulihkan, dan bersihkan sesi sementara.
3. UI manual mobile dan dialog hapus/pulihkan; count D1 konsisten setelah mutasi dan tidak mengambil count Giscus saat binding DB tersedia.
4. Backup D1 berisi data dan uji restore; verifikasi checksum dan foreign keys. Ekspor dan write diserialkan karena error D1 7500 pernah teramati saat berjalan bersamaan.
5. Ownership listing repo dipetakan eksplisit, retention/penghapusan permanen disepakati, Terms/Privacy final, serta batas trafik pra-login dan alarm error/kuota tersedia. Preview/staging harus dibatasi pada kode/tester tepercaya.
6. Perubahan lokal ditinjau, dipush ke PR #239 hanya setelah instruksi pemilik, dan checks terbaru lulus. Tidak memakai hasil checks head lama.
7. Konfigurasi prod lengkap dan kode/skema rollback disiapkan. Rollback deployment tidak memutar balik database; sebelum menerima write publik, rencanakan cara mempertahankan data baru ketika rollback kode.
8. Setelah rilis: uji login sendiri, submit fixture terkontrol, approve, count komentar, ownership, tidak ada banner/noindex staging pada domain prod, serta Discord approved bila diaktifkan. Bersihkan fixture secara recoverable.

Hasil tes staging harus dibedakan dari verifikasi produksi. D1 siap dan binding tersimpan tidak berarti fitur sudah dideploy atau OAuth produksi sudah teruji.
