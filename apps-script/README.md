# Router Aduan → Spreadsheet per Admin (Google Apps Script)

Menerima aduan dari frontend SILAPOR FT, lalu **otomatis menulisnya ke
spreadsheet admin yang tepat** berdasarkan prodi & kategori masalah.

## Konsep "area" (untuk admin merangkap)

- **area** = unit logis: `sipil`, `informatika`, `persuratan`, dst.
- Tiap area menunjuk ke **satu** `spreadsheetId`.
- **Admin merangkap** = beberapa area menunjuk ke **ID yang sama**.
  Contoh default: `informatika` dan `persuratan` pakai ID sama, karena admin
  Informatika juga pegang Persuratan. Kalau dipindah, cukup ganti 1 ID.

Aturan routing:
1. Kalau kategori termasuk **fungsional** (mis. Persuratan) → ke area fungsi itu, apa pun prodinya.
2. Selain itu → ke area **prodi** pelapor.

## Langkah pasang

1. Buat spreadsheet untuk tiap admin. Salin **ID**-nya dari URL:
   `https://docs.google.com/spreadsheets/d/`**`<ID>`**`/edit`
2. Buka `script.google.com` → New project → tempel isi `Code.gs`.
3. Isi `AREA_SHEET` dengan ID tiap area. Untuk yang merangkap, pakai ID sama.
4. Sesuaikan `PRODI_AREA` & `KATEGORI_FUNGSIONAL` bila perlu.
5. Samakan `TOKEN` di `Code.gs` dengan `TOKEN` di `src/config.js`.
6. **Deploy** → New deployment → **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Deploy → salin URL `.../exec`
7. Tempel URL itu ke `src/config.js` → `APPS_SCRIPT_URL`.
8. Tes GET: buka URL `/exec` di browser → harus muncul
   `{"ok":true,"service":"SILAPOR FT router"}`.

## Catatan
- Tiap kategori jadi **tab** sendiri di dalam sheet admin (otomatis dibuat).
  Mau 1 tab saja? Ganti `tabName` jadi `"Aduan"` di `Code.gs`.
- `TOKEN` di sini **bukan keamanan kuat** — hanya menyaring spam acak. Karena
  Web App "Anyone", jangan taruh data super sensitif tanpa lapisan lain.
- Kalau butuh baca-balik data ke dashboard (bukan hanya nulis), tambahkan
  fungsi `doGet` yang mengembalikan isi sheet (mis. via `gviz`/range) —
  pola yang sama seperti dashboard nilai.

## Kolom Catatan & link spreadsheet

- Sheet aduan sekarang punya kolom **Catatan** (kolom J / ke-10). Admin bisa
  mengisinya dari aplikasi (tombol **Catatan** di panel admin), tersimpan ke sheet.
- Di panel admin muncul tombol **Spreadsheet** yang membuka spreadsheet area
  admin tersebut (URL diambil server-side dari `AREA_SHEET`).

## Cara memberi admin akses ke spreadsheet-nya

Router menulis pakai akun kamu (pemilik script), jadi aplikasi tetap jalan.
Supaya admin bisa **membuka & kontrol** spreadsheet-nya sendiri:

1. Buka spreadsheet area admin tersebut di Google Sheets.
2. Klik **Share / Bagikan**.
3. Tambahkan **email Google admin** itu sebagai **Editor** (atau Viewer bila
   hanya boleh lihat).
4. Ulangi untuk tiap spreadsheet. Yang merangkap otomatis dapat satu sheet yang
   sama (mis. IT + Persuratan).

Tombol "Spreadsheet" di panel admin akan membuka URL itu; admin baru bisa masuk
setelah kamu share ke akun Google mereka.

## Manajemen Admin (baru)

Data admin kini disimpan di **spreadsheet khusus** (bukan di kode), agar admin
bisa edit profil & password sendiri, dan Super Admin bisa mengelola semuanya.

### Setup
1. Buat 1 spreadsheet khusus admin, tempel link-nya ke `ADMIN_SHEET` di `Code.gs`.
2. Di editor Apps Script, jalankan **`setupAdmins()`** SEKALI. Ini membuat tab
   "Admins" berisi 1 Super Admin + 5 admin awal.
3. Deploy ulang (New version).

### Akun awal (ganti password setelah login)
| Username | Password | Role |
|----------|----------|------|
| superadmin | (diberikan terpisah) | Super Admin |
| admin1 | (diberikan terpisah) | Admin (Sipil, Geologi) |
| admin2 | (diberikan terpisah) | Admin (Arsitektur, PWK) |
| admin3 | (diberikan terpisah) | Admin (Mesin, Elektro) |
| admin4 | (diberikan terpisah) | Admin (Informatika, Persuratan, Operator) |
| admin5 | (diberikan terpisah) | Admin (Umum) |

> **Keamanan password:** password awal digenerate acak & kuat (diberikan terpisah,
> jangan disimpan di repo). SALT juga sudah diacak. Setiap admin WAJIB ganti
> password sendiri lewat tombol Profil setelah login pertama.

### Kemampuan
- **Setiap admin**: tombol "Profil" → edit Nama/Email/NIP/No. Telp + ganti password sendiri.
- **Super Admin**: tombol "Kelola Admin" → tambah/edit/hapus admin, atur jabatan,
  role, dan **area** (prodi opsional sesuai jabatan). Super Admin melihat & mengelola
  aduan dari SEMUA area.
- Prodi tidak lagi paten: tiap admin diberi area sesuai jabatannya (bisa kosong dari
  prodi, mis. hanya "persuratan").

## Model 1 spreadsheet, tab per prodi (update)

- Semua aduan masuk ke **satu spreadsheet** (`ADUAN_LINK` di Code.gs).
- **Tab dibagi per prodi/area**, bukan per kategori. Jadi SIGA-8, Nilai, KRS, dll
  untuk satu prodi berada di **satu tab** yang sama (kategori jadi kolom).
- Admin di aplikasi hanya melihat tab prodi yang menjadi areanya. Saat Super Admin
  mengganti area/jabatan admin, tampilannya **langsung** ikut berubah (tanpa ubah kode).
- Mau memisah sebagian ke spreadsheet lain? Ganti nilai area tertentu di `AREA_SHEET`
  dari `ADUAN_LINK` menjadi link lain.

⚠️ Karena semua tab ada di satu file: **jangan share file spreadsheet ini ke tiap
admin** untuk akses langsung (mereka akan melihat SEMUA tab). Cukup lewat aplikasi —
aplikasi sudah membatasi tiap admin hanya ke tab areanya. Isolasi antar-admin
dijaga oleh aplikasi, bukan oleh Google Sheets.

## Update: 1 tab per ADMIN (bukan per prodi)

- Tab di spreadsheet aduan sekarang **per admin** (nama tab = username admin,
  mis. `admin1`). Admin yang mencakup beberapa prodi → semua aduannya masuk ke
  satu tab admin itu. Jumlah tab = jumlah admin.
- Saat aduan masuk, router mencari admin (non-super) yang **memegang area/prodi**
  aduan itu, lalu menulis ke tab admin tersebut. Bila tidak ada yang memegang,
  masuk ke admin pemegang "umum" (atau tab `umum`).
- Di aplikasi: admin biasa hanya melihat tab-nya sendiri; Super Admin melihat
  semua tab. Ganti jabatan/area lewat Super Admin langsung mengubah tujuan aduan
  BERIKUTNYA (aduan lama tetap di tab admin yang menanganinya).
- Catatan: sebaiknya tiap area/prodi dipegang **satu admin utama** agar tujuan
  tab jelas. Bila satu area dipegang >1 admin, aduan diarahkan ke admin pertama.

## Memisahkan data admin ke spreadsheet sendiri (WAJIB untuk keamanan)

Data admin (berisi hash password) HARUS di spreadsheet terpisah dari aduan.
Router kini menolak setupAdmins() bila ADMIN_SHEET sama dengan spreadsheet aduan.

### Cara memisahkan tanpa kehilangan data (disarankan)
1. Buat **spreadsheet baru** khusus admin (mis. "SILAPOR - Data Admin").
2. Di file aduan lama, klik kanan tab **"Admins"** → **Salin ke** → spreadsheet baru tadi.
3. Di spreadsheet baru, pastikan nama tab hasil salinan tetap **"Admins"**
   (rename bila jadi "Salinan Admins").
4. Di `Code.gs`, set `ADMIN_SHEET` = link spreadsheet baru.
5. **Hapus tab "Admins" dari file aduan** lama.
6. Jalankan `checkSetup()` di editor → cek Execution log harus:
   `ADMIN_SHEET terpisah dari aduan: true | Tab Admins ada: true | Jumlah admin: 6`
7. Deploy ulang (New version).

### Atau cara cepat (reset ke akun default)
1. Buat spreadsheet baru, set linknya ke `ADMIN_SHEET`.
2. Jalankan `setupAdmins()` (membuat ulang 6 akun default — nama/edit sebelumnya hilang).
3. Hapus tab "Admins" dari file aduan lama. Deploy ulang.
