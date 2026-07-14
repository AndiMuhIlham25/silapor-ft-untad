/* =========================================================================
   Konfigurasi koneksi ke Google Apps Script (router spreadsheet).
   1. Deploy apps-script/Code.gs sebagai Web App (Anyone).
   2. Tempel URL /exec-nya di APPS_SCRIPT_URL.
   3. Samakan TOKEN di sini dan di Code.gs.
   APPS_SCRIPT_URL WAJIB diisi agar aplikasi berfungsi (kirim aduan,
   login admin, monitoring). Kalau kosong, semua aksi akan gagal.
   ========================================================================= */

export const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzdVf0OTh_-gG5zzT-y7Ubf8zEQ-khnv8jDyHuFjb-IPexNAbKRATOl_B_1bw3-d9w/exec";
export const TOKEN = "silapor-ft-2026"; // ganti dengan token rahasiamu (samakan di Code.gs)
