# Bukti deployment staging — 27 Oktober 2026

> Catatan awal di bawah merupakan snapshot deployment pertama, bukan status akhir.
> OAuth hosted kini telah dikonfigurasi dan diuji. Lihat
> [hasil E2E staging](staging-e2e-2026-10-27.md) untuk deployment terakhir,
> bukti aktual, pembersihan sesi, dan batas acceptance yang masih terbuka.

## Target dan provenance

- Project terpisah: `bansos-dynamic-staging`, akun Cloudflare Penadigital00.
- URL stabil: https://bansos-dynamic-staging.pages.dev/contribute/
- Deployment: `19bd34e1-1d48-440e-b4d1-1069224f8497`.
- URL immutable: https://19bd34e1.bansos-dynamic-staging.pages.dev
- Branch deployment `staging` adalah branch utama **project staging**, bukan deploy project produksi `bansos`.
- Upload manual dari artefak lokal, bukan GitHub Actions atau bukti checks PR #239. PR GitHub masih draft pada `26b1dfe10780df74d8097108a5cc75bdb0c0bf3d`; perubahan fitur belum di-push.
- Worker SHA-256: `8c408f434987a032c74d4b7d7f06e02d55f157b770a77843b66f435e34f8aafe`. Salinan upload dan output build lokal memiliki hash sama. Local HEAD `262300b` memiliki WIP fitur yang belum di-commit.
- Empat listing dari #240/#244 sudah diintegrasikan ke simulasi lokal/staging: Codex Relay, FreeModel.in, Moyuu API Relay, dan CurlShot; validator katalog dasar 129 listing.

## Isolasi

D1 baru dengan nama project yang sama, bukan database produksi. Empat migrasi berhasil di remote. Ekspor skema dari D1 staging berhasil dipulihkan pada SQLite kosong (10 tabel, 0 akun). Ini uji skema/backup awal, bukan acceptance pemulihan data produksi.

Wrangler Pages menolak `--config` dengan nama custom. Upload memakai direktori sementara terpisah yang hanya berisi artefak build dan salinan konfigurasi staging bernama `wrangler.jsonc`. File `.env.local` tidak disalin. Pages tidak menerima `account_id` dalam konfigurasi; akun dipilih eksplisit dengan `CLOUDFLARE_ACCOUNT_ID` pada proses upload. Jangan mengganti konfigurasi lokal atau memakai nama project produksi untuk mengatasi kendala ini.

`.env.local`, `.env.staging.local`, dan konfigurasi nyata staging di-ignore Git dan permission 600. File contoh tidak mengandung secret/database UUID. Kredensial OAuth lokal tidak dipakai ulang untuk hosted.

## Verifikasi lulus

- Build Vite/adapter Cloudflare berhasil (7m27s); worker berhasil dikompilasi dan dijalankan lokal.
- Validator 129 listing, Svelte 0 error/0 warning, ESLint seluruh repo, Prettier seluruh repo, dan diff whitespace lulus.
- Dua E2E lokal pada worker terbaru lulus: guest gate, submit, minta revisi, edit, approve, publikasi tanpa rebuild, pemilik/admin, IDOR, stale edit, pembatalan, arsip/hapus/pulihkan, komentar/XSS/identitas, ban/unban, race, rate limit, CSRF, logout, dan cache privat.
- Event Discord tidak ada sebelum approve; initial publication/revisi masing-masing membuat satu event. Persetujuan ulang ditolak tanpa event ganda. Tiga event uji lokal tercatat, seluruhnya attempts=0 karena transport staging dimatikan.
- Uji transport memakai mock: sukses, 429/backoff, error tersanitasi, SSRF ditolak, mention kosong, lease concurrent satu kiriman, dan event sent tidak dikirim ulang. Tidak ada request jaringan ke Discord.
- Secret OAuth lokal tidak ditemukan dalam 29 artefak client JS/JSON/HTML maupun worker bundle yang diperiksa.
- Hosted: root, katalog, Terms, Privacy, empat listing baru, dan Vyce HTTP 200; header noindex dan no-store, tanpa script Google Analytics. Relay memuat bonus $5; Vyce tetap expired.
- Hosted guest admin/dashboard redirect 303; guest submit 303 ke login; POST lintas-origin 403; demo login 404; callback OAuth state palsu 400.
- UI Contribute staging dibuka dan diperiksa di browser: banner staging, login gate, tautan Terms/Privacy, tab lama AI Agent/Git Clone/Email/CLI tidak tampil. Screenshot `/tmp/bansos-dynamic-staging-20261027.jpg`.
- Dev lokal kembali berjalan di http://127.0.0.1:5197/. Worker demo pengujian 5198 sudah dihentikan.
- Produksi root dan Vyce masih HTTP 200, Vyce expired, tanpa banner staging. Project/binding/domain/secret produksi tidak diubah dalam deploy ini; WIP checkout utama tetap utuh.

## Belum lulus / tindak lanjut

OAuth hosted belum dikonfigurasi: `GITHUB_CLIENT_ID` dan `GITHUB_CLIENT_SECRET` staging masih kosong; endpoint login mengembalikan 503 secara tertutup. Isi OAuth App staging baru dalam `.env.staging.local` (ignored), lalu upload kedua key sebagai secret **hanya project staging** dan redeploy. Gunakan URL stabil, bukan hash preview, untuk alur OAuth agar state cookie dan callback berada pada host yang sama. Jangan menganggap login hash preview lintas-host sudah didukung.

Selanjutnya uji dua identitas GitHub sungguhan, cookie Secure/HttpOnly/SameSite, submit sampai approve, komentar dan ownership hosted, cold start, fault D1, recovery data berisi fixture, serta rollback. Runtime Discord tetap dimatikan sesuai pilihan pemilik; pengiriman nyata produksi membutuhkan secret runtime tersendiri dan enable flag. Retry setelah kegagalan masih manual melalui admin, belum memakai scheduler.

Sebelum produksi: keputusan retention/penghapusan permanen, pembatasan akses staging dan preview tepercaya, WAF/flood protection pra-login, alarm kuota/error, backup/restore/rollback berisi data, serta pemetaan ownership listing repo. Privacy/Terms bukan sertifikasi hukum atau jaminan approval GitHub. Staging guest sehat bukan persetujuan merge atau rilis produksi.
