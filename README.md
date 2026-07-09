# SILAPOR FT UNTAD — Sistem Pengaduan Layanan Akademik

Web pengaduan pelayanan sistem akademik Fakultas Teknik Universitas Tadulako.
Tampilan bergaya dashboard "Satu Data" (mirip project DTSEN Sulteng): tema terang,
kartu indikator gradient, donut & bar chart, tabel monitoring. Fungsi utama:
form aduan → dashboard update **real-time**.

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

Build produksi:

```bash
npm run build
npm run preview
```

## Struktur folder

```
src/
  components/        Komponen UI
    Header.jsx        Navbar + logo
    Hero.jsx          Hero + panel preview live
    Indikator.jsx     4 kartu statistik gradient (count-up)
    Layanan.jsx       Grid kategori kendala (klik → prefill form)
    Alur.jsx          4 tahap proses aduan
    FormAduan.jsx     Form pengaduan + validasi
    Dashboard.jsx     Donut status, bar kategori, tabel + filter + aksi
    Donut.jsx         Donut chart SVG murni (tanpa library)
    Toast.jsx         Notifikasi sukses
  data/
    seed.js           KATEGORI, ROLES, PRIORITAS, ALUR, SEED_ADUAN
                      >> INI file yang kamu ganti saat sambung data asli
  hooks/
    useCountUp.js     Animasi angka naik
  utils/
    meta.js           Warna badge status & prioritas
  App.jsx             Shell utama: semua state (aduan, form, filter) di sini
  App.css             Semua styling
  index.css           Reset + import font
  main.jsx            Entry point React
```

## Catatan penting sebelum masuk data & produksi

Saat ini semua data masih **placeholder (dummy)** dan hanya hidup di state React —
begitu halaman di-refresh, kembali ke seed. Untuk versi produksi:

1. **Persistensi butuh backend.** Ganti `useState(SEED_ADUAN)` di `App.jsx` dengan
   pemanggilan API (fetch/axios) ke endpoint kamu. Fungsi `submit`, `setStatus`,
   dan `remove` tinggal diarahkan ke `POST/PATCH/DELETE` endpoint.

2. **Data aduan bersifat pribadi** (nama, NIM/NIP, isi keluhan). **Jangan** simpan
   di frontend atau di file `src/`. Semua yang ada di `src/` ikut terkirim ke
   browser siapa pun yang membuka DevTools. Simpan di database di balik API
   ber-autentikasi.

3. **Rekomendasi arsitektur:** FastAPI + PostgreSQL (pola yang sama seperti DTSEN),
   dengan role-based access untuk operator/admin. Frontend ini tinggal memanggil
   endpoint-nya. Hindari Google Sheets sebagai penyimpanan data aduan karena
   rawan kebocoran dan rate-limit.

---

## Panel Admin (login)

- Halaman aduan publik: `http://localhost:5173/`
- Panel admin: `http://localhost:5173/#admin` (atau klik "Admin" di header)

**Keamanan:** verifikasi login dilakukan di **Apps Script (server-side)**, bukan
di frontend. Password disimpan sebagai **hash SHA-256 di `Code.gs`** (aman karena
server-side). JANGAN menaruh password/hash di file `src/`.

### Setup admin (di Code.gs)
1. Buat hash password: di editor Apps Script jalankan `makeHash("passwordku")`,
   lalu buka **Execution log** untuk menyalin hash-nya.
2. Tempel hash itu ke `ADMINS[...].pass`.
3. Atur `areas` tiap admin (1 admin bisa pegang beberapa area).
4. Ganti `SALT` dengan string rahasiamu sendiri sebelum membuat hash.

### 5 admin default (contoh, silakan ubah)
| Username | Pegang area |
|----------|-------------|
| admin1 | Sipil, Geologi |
| admin2 | Arsitektur, PWK |
| admin3 | Mesin, Elektro |
| admin4 | Informatika, Persuratan, Operator |
| admin5 | Umum |

Setelah login, admin hanya melihat & mengubah status aduan dari area yang ia pegang.
Perubahan status tersimpan kembali ke spreadsheet.

### Mode demo (tanpa Apps Script)
Kalau `APPS_SCRIPT_URL` masih kosong, panel admin jalan dalam mode demo:
login `admin1`…`admin5` dengan password **demo**, data dari contoh lokal.
Ini hanya untuk melihat tampilan — auth asli baru aktif setelah Apps Script dipasang.
