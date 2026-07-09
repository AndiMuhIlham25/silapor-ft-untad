# Menyimpan SILAPOR ke GitHub dengan aman

Tujuan: punya backup/versi kode di GitHub, tanpa membocorkan hal sensitif.

## Prinsip penting
- **Frontend itu selalu publik** begitu disajikan ke browser (F12 bisa lihat).
  Yang menjaga keamanan adalah: rahasia TIDAK ditaruh di frontend, melainkan di
  server (Code.gs / Apps Script yang jalan di Google).
- `src/config.js` berisi `TOKEN` yang IKUT ter-bundle ke browser. Itu bukan
  kunci rahasia — anggap publik. Karena itu:
  - Untuk backup source, pakai **repo PRIVATE**.
  - Keamanan nyata tetap di sisi Apps Script (hash password, SALT, verifikasi).

## Langkah (repo PRIVATE, sebagai penyimpanan awal)
1. Buat repo baru di GitHub → pilih **Private**.
2. Di folder project, pastikan `.gitignore` mengabaikan `node_modules` dan `dist`.
3. Jalankan:
   ```bash
   git init
   git add .
   git commit -m "SILAPOR FT UNTAD - initial"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMA-REPO.git
   git push -u origin main
   ```
4. Selesai — kode tersimpan aman di repo private.

## Jangan commit hal ini
- Link/ID spreadsheet asli, URL /exec Apps Script, dan `Code.gs` yang sudah berisi
  SALT + password → sebaiknya JANGAN di repo publik. Kalau repo private, boleh,
  tapi tetap hati-hati siapa yang punya akses.
- Kalau nanti repo mau dijadikan publik, kosongkan dulu `APPS_SCRIPT_URL` &
  ganti SALT/password, dan simpan Code.gs asli di tempat privat.

## Catatan GitHub Pages
- GitHub Pages akun gratis butuh repo **publik**, dan situs yang terbit **publik**.
- Situs (frontend) publik itu wajar — asalkan rahasia tetap di Apps Script.
- Jangan menaruh data/kunci sensitif di frontend hanya karena "kelihatannya aman".

## Naik level nanti (opsional)
Kalau butuh menyembunyikan LOGIKA (bukan cuma data), pindah ke backend nyata
(FastAPI/Node + database + JWT). Di situ logika jalan di server, tak dikirim ke
browser sama sekali.
