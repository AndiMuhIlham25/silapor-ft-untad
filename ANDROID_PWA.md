# SILAPOR sebagai Aplikasi Android

## Tahap 1 — PWA (SUDAH AKTIF)

Aplikasi kini bisa dipasang di HP tanpa Play Store.

### Cara mahasiswa/admin memasang

**Android (Chrome):**
1. Buka alamat SILAPOR di Chrome.
2. Tunggu ±3 detik → muncul banner **"Pasang SILAPOR di HP kamu"** → tekan **Pasang**.
   (Kalau banner tidak muncul: menu ⋮ → **Tambahkan ke layar utama / Install app**.)
3. Ikon SILAPOR muncul di layar utama, terbuka layar penuh tanpa address bar.

**iPhone (Safari):**
Tombol Bagikan → **Add to Home Screen**. (iOS tidak mendukung banner otomatis.)

**Desktop (Chrome/Edge):** ikon ⊕ di ujung address bar.

### Yang didapat
- Ikon + splash screen berlogo UNTAD
- Tampil layar penuh (standalone), terasa seperti aplikasi
- Shortcut cepat: tekan-lama ikon → **Buat Aduan** / **Lacak Aduan**
- Aset (tampilan, logo, font) di-cache → buka lebih cepat, hemat kuota
- Update otomatis: cukup `git push`, semua HP dapat versi terbaru tanpa install ulang

### Yang TIDAK didapat (jujur)
- **Data tetap butuh internet.** Yang di-cache hanya tampilan; aduan & status selalu
  diambil langsung dari Apps Script agar tidak pernah basi.
- **Belum ada push notification** ke HP saat aplikasi tertutup. Notifikasi aduan baru
  hanya muncul selama dashboard admin terbuka.
- Belum ada di Play Store (lihat Tahap 2).

---

## Tahap 2 — TWA / APK Play Store (NANTI)

PWA di atas adalah **prasyarat** TWA, jadi tidak ada yang terbuang.

### Syarat
1. Situs sudah HTTPS + PWA valid ✔ (sudah terpenuhi)
2. Akun **Google Play Console** — biaya $25 sekali seumur hidup.
   Disarankan pakai akun **institusi/fakultas**, bukan pribadi, agar aplikasi tidak
   ikut hilang bila pengelola berganti.
3. File verifikasi domain `assetlinks.json` di `public/.well-known/assetlinks.json`

### Langkah ringkas
1. Buka **pwabuilder.com** → masukkan URL SILAPOR → **Package for Stores → Android**.
2. Unduh paket → berisi `.aab` (untuk Play Store) + `assetlinks.json`.
3. Salin `assetlinks.json` ke `public/.well-known/assetlinks.json` → `git push`
   (ini membuktikan APK dan situs milik pihak yang sama; tanpa ini address bar
   akan tetap terlihat di dalam aplikasi).
4. Upload `.aab` ke Play Console → isi deskripsi, ikon, screenshot → submit review.

### Alternatif tanpa Play Store
PWABuilder juga menghasilkan `.apk` yang bisa langsung dibagikan (sideload) —
cocok untuk uji coba internal fakultas sebelum publikasi resmi.

---

## Tahap 3 — Push Notification (OPSIONAL, paling kompleks)

Agar admin dapat notifikasi di HP walau aplikasi tertutup:
- Butuh **Firebase Cloud Messaging (FCM)**
- Apps Script mengirim POST ke FCM setiap ada aduan baru
- Perlu menyimpan token perangkat tiap admin

Ini proyek tersendiri. Bila hanya perlu tanda saat dashboard terbuka, fitur yang
sudah ada (banner + suara + judul tab) sudah mencukupi.
