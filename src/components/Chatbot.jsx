import React, { useState, useRef, useEffect } from "react";
import AsistenAvatar from "./AsistenAvatar.jsx";

// Basis pengetahuan (rule-based) — cocokkan kata kunci, ambil skor tertinggi
const FAQ = [
  { key: "salam", kw: ["halo", "hai", "hallo", "assalam", "selamat pagi", "selamat siang", "selamat sore", "permisi"],
    a: "Hai! 👋 Aku asisten SILAPOR FT UNTAD. Ada yang bisa dibantu soal pengaduan layanan akademik?" },
  { key: "terima", kw: ["terima kasih", "makasih", "thanks", "thx", "mksh", "trims"],
    a: "Sama-sama! 🙌 Semoga urusannya lancar ya." },
  { key: "ngadu", kw: ["cara ngadu", "cara buat", "cara lapor", "cara mengadu", "buat aduan", "mengadu", "melapor", "ngadu", "kirim aduan", "gimana lapor"],
    a: "Cara buat aduan: di halaman Beranda, isi Nama, NIM/NIP, Prodi, pilih Peran & Kategori, lalu tulis deskripsi kendalamu dan klik Kirim. Kamu juga bisa lampirkan file (pdf/jpg/png, maks 1 MB). Setelah kirim, kamu dapat ID Aduan untuk melacak status." },
  { key: "jam", kw: ["jam", "buka", "tutup", "kapan", "waktu layanan", "jadwal layanan", "hari kerja", "jam berapa"],
    a: "Jam layanan pengaduan (WITA):\n• Senin–Kamis: 08.00–16.00\n• Jumat: 08.00–16.30\n• Sabtu–Minggu: tutup\nDi luar jam itu, form aduan otomatis terkunci." },
  { key: "status", kw: ["status", "cek", "lacak", "pantau", "id aduan", "sudah diproses", "progres", "tindak lanjut", "sampai mana"],
    a: "Untuk cek status: buka menu Hasil Laporan, lalu cari pakai ID Aduan kamu (contoh: ADU-260713-1234) yang kamu terima saat mengirim. Statusnya update langsung (Baru → Diproses → Selesai)." },
  { key: "kategori", kw: ["kategori", "jenis aduan", "masalah apa", "keluhan apa", "pilihan aduan"],
    a: "Kategori aduan: SIGA-8, Nilai, Jadwal & KRS, Akses Akun, Data Mahasiswa, Persuratan, dan Lainnya. Pilihan kategori otomatis menyesuaikan Peran kamu (Mahasiswa / Dosen / Operator Prodi/Jurusan)." },
  { key: "lampiran", kw: ["lampiran", "upload", "unggah", "berkas", "dokumen", "pdf", "foto bukti", "attach"],
    a: "Kamu bisa melampirkan 1 file saat mengisi form — format pdf/jpg/png/webp, ukuran maksimal 1 MB. Cocok untuk scan surat atau screenshot bukti." },
  { key: "siga", kw: ["siga", "siga-8", "siga8", "sistem akademik", "error login siga"],
    a: "Kendala SIGA-8 (gagal login, data tidak sinkron, gagal input) → pilih kategori SIGA-8 saat mengadu. Kategori ini tersedia untuk Mahasiswa, Dosen, maupun Operator Prodi/Jurusan." },
  { key: "nilai", kw: ["nilai", "khs", "ipk", "nilai belum keluar", "salah nilai"],
    a: "Masalah nilai (belum masuk, salah input, konversi) → pilih kategori Nilai. Sebutkan nama mata kuliah & dosennya di deskripsi biar admin cepat menindaklanjuti." },
  { key: "krs", kw: ["krs", "jadwal kuliah", "mata kuliah", "matkul", "bentrok jadwal"],
    a: "Kendala Jadwal & KRS (bentrok, KRS gagal disetujui, matkul hilang) → pilih kategori Jadwal & KRS." },
  { key: "akun", kw: ["password", "lupa password", "akun terkunci", "reset", "tidak bisa login", "email kampus"],
    a: "Lupa password / akun bermasalah → pilih kategori Akses Akun saat mengadu. Jelaskan akun apa (SIGA-8 / email kampus) di deskripsi." },
  { key: "surat", kw: ["surat", "legalisir", "keterangan aktif", "persuratan", "ttd"],
    a: "Urusan surat (keterangan aktif kuliah, legalisir, dll) → pilih kategori Persuratan. Ini lintas prodi." },
  { key: "privasi", kw: ["privasi", "identitas", "nama saya", "rahasia", "disamarkan", "aman ga", "data saya"],
    a: "Tenang, di halaman Hasil Laporan publik identitas pelapor disamarkan (misal 'Andi R.'), dan NIM tidak ditampilkan. Data lengkap hanya dilihat admin yang menangani." },
  { key: "adminlogin", kw: ["login admin", "masuk admin", "admin login", "petugas", "akun admin"],
    a: "Login Admin ada di tombol kanan atas, khusus petugas/admin prodi. Kalau kamu mahasiswa/dosen, cukup pakai form aduan ya." },
  { key: "kontak", kw: ["manusia", "kontak", "hubungi", "telepon", "nomor wa", "orang", "petugasnya"],
    a: "Aduan kamu otomatis diteruskan ke admin prodi/unit terkait. Cara terbaik menghubungi: kirim aduan lewat form, lalu pantau balasannya (catatan admin) di Hasil Laporan pakai ID Aduan." },
];

const QUICK = ["Cara buat aduan", "Jam layanan", "Cek status aduan", "Kategori aduan"];
const FALLBACK = "Maaf, aku belum paham pertanyaan itu 🙏. Coba tanya soal: cara buat aduan, jam layanan, cek status, kategori, atau lampiran. Untuk kendala spesifik, langsung buat aduan lewat form ya.";

function jawab(text) {
  const t = text.toLowerCase();
  let best = null, bestScore = 0;
  for (const item of FAQ) {
    const score = item.kw.reduce((n, k) => (t.includes(k) ? n + 1 : n), 0);
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return best ? best.a : FALLBACK;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from: "bot", text: "Hai! 👋 Aku asisten SILAPOR. Tanya apa aja soal cara mengadu, jam layanan, atau cek status aduan." },
  ]);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, open]);

  const kirim = (teks) => {
    const q = (teks ?? input).trim();
    if (!q) return;
    setInput("");
    setMsgs((m) => [...m, { from: "user", text: q }]);
    setTimeout(() => setMsgs((m) => [...m, { from: "bot", text: jawab(q) }]), 300);
  };

  return (
    <>
      <button className={"cb-fab" + (open ? " cb-fab-open" : "")} onClick={() => setOpen((o) => !o)} aria-label="Bantuan">
        {open ? "✕" : <AsistenAvatar size={46} />}
      </button>

      {open && (
        <div className="cb-panel">
          <div className="cb-head">
            <div className="cb-avatar"><AsistenAvatar size={46} /></div>
            <div>
              <b>Tanya Sila</b>
              <small>Asisten SILAPOR · online</small>
            </div>
          </div>

          <div className="cb-body" ref={bodyRef}>
            {msgs.map((m, i) => (
              <div key={i} className={"cb-msg " + m.from}>
                {m.text.split("\n").map((line, j) => <div key={j}>{line}</div>)}
              </div>
            ))}
            <div className="cb-quick">
              {QUICK.map((q) => (
                <button key={q} onClick={() => kirim(q)}>{q}</button>
              ))}
            </div>
          </div>

          <div className="cb-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && kirim()}
              placeholder="Tulis pertanyaan…"
            />
            <button onClick={() => kirim()}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
