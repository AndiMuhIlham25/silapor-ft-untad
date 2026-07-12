// Jam layanan aduan (zona WITA / Asia/Makassar, GMT+8)
// Senin–Kamis: 08.00–16.00 · Jumat: 08.00–16.30 · Sabtu–Minggu: tutup

export function witaNow() {
  const d = new Date();
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + 8 * 3600000);
}

export function statusJamLayanan() {
  const w = witaNow();
  const day = w.getDay(); // 0=Min, 1=Sen, ... 5=Jum, 6=Sab
  const mins = w.getHours() * 60 + w.getMinutes();
  let open = false, jamHari = "";
  if (day >= 1 && day <= 4) { open = mins >= 480 && mins < 960; jamHari = "08.00–16.00"; }
  else if (day === 5)       { open = mins >= 480 && mins < 990; jamHari = "08.00–16.30"; }
  else                      { open = false; jamHari = "libur akhir pekan"; }
  return { open, day, jamHari };
}

export const JADWAL_TEKS = "Senin–Kamis 08.00–16.00 · Jumat 08.00–16.30";
