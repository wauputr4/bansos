# Status cutover — 27 Oktober 2026

## Snapshot kode yang diuji

- Perbaikan runtime: `0d716e842527ef6ef67e1bdcef2d7b559d9b79a9` pada PR #239. Commit dokumentasi/helper tes berikutnya tidak mengubah runtime yang diuji.
- Staging immutable: https://08978f2b.bansos-dynamic-staging.pages.dev. Alias stabil https://bansos-dynamic-staging.pages.dev diarahkan melalui **branch `staging`**, bukan `main`.
- Worker SHA-256: `713f80cd179c9d68777df60c09b1c74877a21c8f6165775de39c43f637ea42d2`. Build 5m25s. Scan 239 artefak tidak menemukan nilai OAuth lokal/staging yang dikenal.
- Validator: 129 listing. Svelte check 0 error/0 warning; ESLint dan Prettier lulus. Unit validator, enam migrasi/outbox, impor/count/IDOR, katalog/profil, status upcoming, dan isolasi payload rusak lulus.
- Worker lokal: smoke dan security E2E lulus, termasuk perubahan usulan setelah halaman admin dibuka yang ditolak 409. Harness diperbaiki agar menoleransi atribut/id kartu dan kelas CSS tambahan; kegagalan assertion sebelumnya bukan acceptance lulus.
- Hosted dua identitas OAuth: admin/contributor separation, private dashboard, usulan/publikasi tanpa rebuild, approval stale-version 409, komentar/count/IDOR, revisi termoderasi, arsip/hapus/pulihkan, serta visibilitas profil lulus. Antrean privat tercatat atomik dengan `attempts=0`: tidak ada transport Discord staging. Sesi sementara dibersihkan dan fixture disembunyikan secara recoverable.

Uji pertama sesudah upload sempat mengenai alias snapshot lama karena deployment dilakukan ke branch `main` yang merupakan **Preview** dalam project staging. Hasil itu tidak dipakai sebagai acceptance; deploy branch `staging` dan pengujian ulang di atas yang menjadi bukti. Kedua lingkungan tetap memakai D1 staging, tidak produksi.

## Perbaikan review

- Approval, edit usulan, dan keputusan moderasi menyertakan versi yang benar-benar ditampilkan kepada admin; perubahan berikutnya membatalkan keputusan lama. Versi diverifikasi lagi dalam transaksi publikasi.
- Profil kontributor membaca katalog D1, sehingga edit/hapus/arsip konsisten dengan detail. Rekomendasi detail dibatasi tiga item server-side, bukan mengirim seluruh katalog sebagai page data.
- Tanggal publikasi D1 tidak mengaktifkan status upcoming. Perilaku legacy repo tetap dipertahankan. Overlay rusak diabaikan secara fail-closed, tanpa menghidupkan konten repo lama atau mencetak payload.
- Importer melewatkan komentar minimized dan balasan parent minimized. Snapshot terbaru tetap 24 diskusi, 53 komentar/16 balasan, isi/identitas sama persis dengan snapshot sebelumnya; produksi diverifikasi ulang cocok. Snapshot baru SHA-256 `05cb290eb45a676ba906bbb7466290e8bcf17183436920ab98d6d26765ec8393`. Perubahan moderasi sumber sesudah snapshot masih memerlukan rekonsiliasi terpisah.
- Demo lokal memakai prioritas konfigurasi yang sama dengan hooks; hosted tetap 404. Direktori ledger privat dibuat sebelum penulisan dan cleanup toleran terhadap file yang belum dibuat.

## Produksi disiapkan, belum dirilis

- Keenam migrasi telah diterapkan ke D1 produksi terpisah setelah backup diverifikasi. Tidak menyalin akun/sesi/fixture staging. Ada 53 komentar historis; akun/sesi/usulan/listing dinamis belum menerima data publik.
- Pemilik menyimpan webhook approved dan moderator sebagai Secret terpisah. Kedua flag produksi `1`; staging tetap diblokir. Nama webhook privat dan kanal `moderator-only` diverifikasi di Brave. Nilai secret/ID kanal yang disimpan sebagai Secret tidak dibuka; pin kanal diperiksa aplikasi sebelum pengiriman.
- Notifikasi produksi nyata **belum diuji** sampai kode benar-benar dirilis. Antrean memiliki lease/backoff dan retry manual, tanpa scheduler; delivery at-least-once.
- Root/katalog/Vyce produksi HTTP 200; Vyce tetap expired. Deploy lama produksi `be4b98cb-a26b-4ad2-aac6-6a547a4f4bce`, main `97015bf`, dipertahankan sebagai rollback kode. Pertahankan D1 dan seluruh write baru saat rollback; jangan drop tabel.
- Pembaruan dependensi kompatibel menghilangkan high/critical pada audit npm. Masih 3 moderate/2 low yang didokumentasikan; jangan menyebut audit bersih atau keamanan tersertifikasi.

## Gate yang belum selesai

Head PR terakhir masih membutuhkan checks/review terbaru. CodeRabbit mencapai kuota OSS (neutral, bukan hijau), dan branch membutuhkan satu approval valid terhadap push terakhir. Tidak memakai admin bypass atau mengubah proteksi. Belum ada merge/deploy MVP produksi, belum ada smoke OAuth/Discord produksi, dan belum ada tag/release. WAF/pra-login, alarm error/kuota, retention operasional, serta review token lama tetap harus ditangani sebagai gate operasional yang tercatat dalam checklist, bukan dianggap selesai oleh tes staging.
