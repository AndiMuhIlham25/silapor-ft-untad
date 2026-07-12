/* =========================================================================
   Data konfigurasi SILAPOR FT.
   File ini yang kamu sesuaikan. Untuk mapping tujuan spreadsheet,
   lihat apps-script/Code.gs (bagian AREA_SHEET / PRODI_AREA / KATEGORI_FUNGSIONAL).
   ========================================================================= */

/* Daftar prodi FT Untad (11 prodi). Sesuaikan bila perlu. */
export const PRODI = [
  "Teknik Sipil (S1)",
  "Teknik Arsitektur (S1)",
  "Teknik Elektro (S1)",
  "Teknik Mesin (S1)",
  "Teknik Informatika (S1)",
  "Teknik Geologi (S1)",
  "Perencanaan Wilayah & Kota (S1)",
  "Teknik Lingkungan (S1)",
  "Sistem Informasi (S1)",
  "Teknik Rekayasa Jalan dan Jembatan (D4)",
  "Teknik Rekayasa Manufaktur (D4)",
  "Teknik Rekayasa Listrik (D4)",
  "Teknik Sipil (S2)",
  "Teknologi Informasi (S2)",
  "Arsitektur (S2)",
];

/* Kategori masalah.
   fungsional:true = ditangani admin lintas-prodi (mis. persuratan),
   routing-nya diarahkan ke area fungsi, bukan ke prodi pelapor. */
export const KATEGORI = [
  { id: "SIGA-8", label: "SIGA-8 / Sistem Akademik", desc: "Error login, data tidak sinkron, gagal input di SIGA-8.", roles: ["Mahasiswa","Dosen","Operator Prodi/Jurusan"], c: "#1d4ed8" },
  { id: "Nilai", label: "Nilai", desc: "Nilai belum masuk, salah input, konversi bermasalah.", roles: ["Mahasiswa","Dosen"], c: "#0891b2" },
  { id: "Jadwal & KRS", label: "Jadwal & KRS", desc: "Bentrok jadwal, KRS gagal disetujui, matkul hilang.", roles: ["Mahasiswa","Operator Prodi/Jurusan"], c: "#7c3aed" },
  { id: "Akses Akun", label: "Akses Akun", desc: "Lupa password, akun terkunci, email kampus bermasalah.", roles: ["Mahasiswa","Dosen","Operator Prodi/Jurusan"], c: "#db2777" },
  { id: "Data Mahasiswa", label: "Data Mahasiswa", desc: "Ubah biodata, status aktif/cuti, sinkron PDDikti.", roles: ["Mahasiswa","Operator Prodi/Jurusan"], c: "#059669" },
  { id: "Persuratan", label: "Persuratan", desc: "Surat aktif kuliah, keterangan, legalisir, dll (lintas prodi).", roles: ["Mahasiswa","Operator Prodi/Jurusan"], c: "#ea580c", fungsional: true },
  { id: "Lainnya", label: "Layanan Lainnya", desc: "Kendala akademik lain di luar kategori di atas.", roles: ["Mahasiswa","Dosen","Operator Prodi/Jurusan"], c: "#d97706" },
];

export const ROLES = ["Mahasiswa", "Dosen", "Operator Prodi/Jurusan"];
export const PRIORITAS = ["Rendah", "Sedang", "Urgent"];



/* Daftar area untuk penugasan admin (Super Admin) */
export const AREAS = [
  { id: "sipil_s1", label: "Teknik Sipil (S1)" },
  { id: "arsitektur_s1", label: "Teknik Arsitektur (S1)" },
  { id: "elektro_s1", label: "Teknik Elektro (S1)" },
  { id: "mesin_s1", label: "Teknik Mesin (S1)" },
  { id: "informatika_s1", label: "Teknik Informatika (S1)" },
  { id: "geologi_s1", label: "Teknik Geologi (S1)" },
  { id: "pwk_s1", label: "Perencanaan Wilayah & Kota (S1)" },
  { id: "lingkungan_s1", label: "Teknik Lingkungan (S1)" },
  { id: "si_s1", label: "Sistem Informasi (S1)" },
  { id: "trjj_d4", label: "Teknik Rekayasa Jalan dan Jembatan (D4)" },
  { id: "trm_d4", label: "Teknik Rekayasa Manufaktur (D4)" },
  { id: "trl_d4", label: "Teknik Rekayasa Listrik (D4)" },
  { id: "sipil_s2", label: "Teknik Sipil (S2)" },
  { id: "ti_s2", label: "Teknologi Informasi (S2)" },
  { id: "arsitektur_s2", label: "Arsitektur (S2)" },
  { id: "persuratan", label: "Persuratan (fungsional)" },
  { id: "operator", label: "Operator / SIGA-8 (fungsional)" },
  { id: "umum", label: "Umum" },
];
