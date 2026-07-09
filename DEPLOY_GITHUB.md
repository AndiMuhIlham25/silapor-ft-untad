# Deploy SILAPOR ke GitHub + GitHub Pages

## Bagian 1 — Simpan source ke GitHub (backup)

1. Buat repo baru di github.com (mis. nama: `silapor-ft-untad`).
   - Untuk backup source: pilih **Private**.
   - Untuk pakai GitHub Pages gratis: repo harus **Public**.
2. Di folder project, jalankan:
   ```bash
   git init
   git add .
   git commit -m "SILAPOR FT UNTAD"
   git branch -M main
   git remote add origin https://github.com/andimuhilham25/silapor-ft-untad.git
   git push -u origin main
   ```
   (ganti USERNAME dengan username GitHub-mu)

`node_modules` & `dist` sudah diabaikan lewat `.gitignore`, jadi tidak ikut ter-upload.

## Bagian 2 — Bikin app-nya online (GitHub Pages)

Pilih SATU cara.

### Cara A — Otomatis via GitHub Actions (disarankan)
Sudah disiapkan file `.github/workflows/deploy.yml`. Tinggal:
1. Push project ke repo (Bagian 1). Repo harus **Public** (akun gratis).
2. Di repo → **Settings → Pages → Build and deployment → Source = GitHub Actions**.
3. Setiap `git push` ke branch `main`, situs otomatis ke-build & online.
4. URL muncul di: repo → tab **Actions** (job Deploy) atau **Settings → Pages**.
   Formatnya: `https://andimuhilham25.github.io/silapor-ft-untad//`

### Cara B — Manual via paket gh-gages (cepat)
1. Pastikan remote sudah di-set (Bagian 1).
2. Jalankan:
   ```bash
   npm install
   npm run deploy
   ```
   Ini build lalu push folder `dist` ke branch `gh-pages`.
3. Di repo → **Settings → Pages → Source = Deploy from a branch → Branch: gh-pages / (root)** → Save.
4. Tunggu 1-2 menit, buka 'https://andimuhilham25.github.io/silapor-ft-untad/'.

## Penting soal keamanan (ingat!)
- GitHub Pages **selalu publik** — situs & seluruh isi frontend bisa dilihat siapa saja
  (termasuk `config.js` berisi `APPS_SCRIPT_URL` & `TOKEN`). Itu WAJAR; frontend memang publik.
- Keamanan nyata tetap di **Apps Script** (hash password, SALT, verifikasi) — tak ikut ke browser.
- Yang menjaga dari spam: honeypot yang sudah dipasang di form.
- Jangan taruh data/kunci sensitif baru di frontend hanya karena "kelihatan aman".
- Kalau ingin source privat TAPI situs online: butuh GitHub Pro (Pages dari repo privat),
  atau simpan source di repo privat + deploy situs ke tempat lain.

## Update setelah deploy
- Cara A: cukup `git add . && git commit -m "update" && git push`. Otomatis re-deploy.
- Cara B: `npm run deploy` lagi.
