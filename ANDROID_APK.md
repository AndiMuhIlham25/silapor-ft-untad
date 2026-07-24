# Membuat APK Android Asli untuk SILAPOR

## Kenapa aplikasi terpasang masih terlihat seperti browser?

Ada **dua** kemungkinan, dan keduanya sudah/akan diatasi:

**A. Pemasangan dari browser menghasilkan pintasan, bukan aplikasi.**
Chrome hanya membuat aplikasi sungguhan (WebAPK) bila manifest lolos semua syarat.
Sebelumnya `start_url` dan `scope` bernilai relatif (`"."`) — ini sering gagal
divalidasi, sehingga Chrome hanya membuat **pintasan**, dan pintasan selalu
terbuka dengan address bar. **Sudah diperbaiki** menjadi `"/"` (absolut).

Setelah perbaikan ini di-deploy, pasang ulang dari HP:
1. Hapus dulu ikon lama dari layar utama
2. Buka situs di **Chrome** (bukan browser dalam aplikasi WA/IG)
3. Menu ⋮ → pilih **"Install app" / "Pasang aplikasi"** — bukan "Tambahkan ke layar utama"
4. Tunggu beberapa detik (Chrome perlu waktu membuat WebAPK)
5. Buka dari ikon → address bar seharusnya hilang total

**B. Ingin berkas APK sungguhan** (bisa dibagikan/di-upload ke Play Store) →
lanjut ke bagian di bawah.

---

## Cara 1 — PWABuilder (paling mudah, tanpa perkakas)

1. Buka **https://www.pwabuilder.com**
2. Masukkan alamat situs → **Start**
3. Setelah dianalisis, pilih **Package For Stores → Android**
4. Isi:
   - Package ID: `id.ac.untad.ft.silapor`
   - App name: `SILAPOR`
   - Signing key: **Create new** (biarkan PWABuilder yang membuat)
5. **Download** → berisi:
   - `app-release-signed.apk` → bisa langsung dipasang di HP
   - `app-release-bundle.aab` → untuk Play Store
   - `assetlinks.json` → **penting, jangan dilewat**
   - `signing.keystore` + `signing-key-info.txt` → **SIMPAN BAIK-BAIK**

6. **Pasang assetlinks.json** (langkah yang paling sering terlewat):
   Buka `assetlinks.json` hasil unduhan, salin nilai `sha256_cert_fingerprints`,
   lalu tempelkan ke berkas `public/.well-known/assetlinks.json` di proyek ini
   menggantikan tulisan `GANTI_DENGAN_...`. Lalu `git push`.

   > **Kalau langkah ini dilewat, APK akan menampilkan bilah alamat di bagian atas** —
   > persis keluhan "masih seperti browser". Assetlinks inilah yang membuktikan
   > bahwa APK dan situs milik pihak yang sama, sehingga Android menyembunyikan
   > bilah alamat.

7. Tunggu deploy selesai, lalu pasang APK-nya di HP → tampil layar penuh.

---

## Cara 2 — Bubblewrap CLI (di komputer sendiri)

Berkas `twa-manifest.json` di proyek ini **sudah disiapkan**, tinggal jalankan.

Prasyarat: Node.js + JDK 17.

```bash
npm install -g @bubblewrap/cli
cd folder-proyek-ini
bubblewrap init --manifest https://ALAMAT-SITUS/manifest.webmanifest
bubblewrap build
```

Bubblewrap akan mengunduh Android SDK sendiri saat pertama kali dijalankan.
Hasilnya: `app-release-signed.apk` + berkas `assetlinks.json`
(langkah 6 di atas tetap wajib dilakukan).

---

## Yang perlu dipahami (jujur)

- APK hasil TWA **tetap menjalankan situs yang sama** di dalamnya — tapi tanpa
  antarmuka browser, punya ikon sendiri, muncul di daftar aplikasi, bisa dibagikan
  sebagai berkas, dan bisa diunggah ke Play Store. Untuk sistem pengaduan seperti
  ini, itu sudah setara aplikasi asli.
- Keunggulannya: setiap `git push` langsung memperbarui isi aplikasi **tanpa**
  pengguna perlu memasang ulang APK.
- Yang **tidak** didapat dari TWA: akses perangkat tingkat dalam (misalnya
  notifikasi latar belakang penuh). Untuk itu perlu Capacitor + Firebase.
- **Simpan keystore baik-baik.** Kalau hilang, aplikasi di Play Store tidak bisa
  diperbarui lagi dan harus diterbitkan ulang sebagai aplikasi baru.
- Untuk Play Store: gunakan akun developer **institusi/fakultas**, bukan pribadi.

---

## Ringkasan berkas terkait

| Berkas | Fungsi |
|---|---|
| `public/.well-known/assetlinks.json` | Bukti kepemilikan domain — **wajib diisi** agar bilah alamat hilang |
| `twa-manifest.json` | Konfigurasi siap pakai untuk Bubblewrap |
| `vite.config.js` | Manifest PWA (`id`, `start_url`, `scope` sudah absolut) |
