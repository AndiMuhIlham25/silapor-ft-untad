import React, { useState, useEffect } from "react";
import { apiSubmit, apiEditPublik } from "./api.js";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Layanan from "./components/Layanan.jsx";
import FormAduan from "./components/FormAduan.jsx";
import LaporanPublik from "./components/LaporanPublik.jsx";
import Toast from "./components/Toast.jsx";
import Chatbot from "./components/Chatbot.jsx";
import CuacaBand from "./components/CuacaBand.jsx";

const EMPTY_FORM = { nama: "", identitas: "", prodi: "", role: "Mahasiswa", kategori: "", prioritas: "Sedang", deskripsi: "", hp: "", file: null };

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [toast, setToast] = useState(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const formT0 = React.useRef(Date.now());
  const [dupWarn, setDupWarn] = useState(null);
  const [sukses, setSukses] = useState(null);

  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const view = hash === "#layanan" ? "layanan" : hash === "#laporan" ? "laporan" : "beranda";

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const scrollForm = () => setTimeout(() => document.getElementById("aduan")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);

  const nav = (id) => {
    if (id === "layanan") { window.location.hash = "#layanan"; window.scrollTo({ top: 0 }); }
    else if (id === "laporan") { window.location.hash = "#laporan"; window.scrollTo({ top: 0 }); }
    else { window.location.hash = "#beranda"; scrollTop(); }
  };
  const goBuat = () => { window.location.hash = "#beranda"; scrollForm(); };
  const loginAdmin = () => { window.location.hash = "#admin"; };

  const fireToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2800); };

  const LACAK_TEKS = "Simpan ID di bawah untuk memantau statusnya atau ketik Stambuk/NIP Anda untuk melihat apa saja yang telah Anda lapor.";
  const suksesInfo = (s) => {
    if (!s.luarJam) return {
      ic: "✅", cls: "ok-ic-kerja", judul: "Aduan berhasil terkirim",
      body: "Aduan sudah diteruskan ke admin terkait dan akan segera ditindaklanjuti. " + LACAK_TEKS,
      sub: <>Pantau statusnya di menu <b>Hasil Laporan</b>.</>,
    };
    if (s.akhirPekan) return {
      ic: "📅", cls: "ok-ic-pekan", judul: "Aduan kamu sudah direkam",
      body: "Aduan akan diproses sesuai dengan hari kerja. Karena masuk di akhir pekan, aduan akan ditindaklanjuti mulai hari Senin pukul 08.00 WITA. " + LACAK_TEKS,
      sub: <>Aduan tetap diteruskan ke admin prodi terkait. Pantau statusnya di menu <b>Hasil Laporan</b>.</>,
    };
    return {
      ic: "📝", cls: "ok-ic-jam", judul: "Aduan kamu sudah direkam",
      body: "Aduan akan diproses sesuai dengan hari kerja (Senin–Jumat, mulai pukul 08.00 WITA). " + LACAK_TEKS,
      sub: <>Aduan tetap diteruskan ke admin prodi terkait. Pantau statusnya di menu <b>Hasil Laporan</b>.</>,
    };
  };

  const pickLayanan = (k) => {
    setForm((f) => {
      const role = k.roles.includes(f.role) ? f.role : k.roles[0];
      return { ...f, kategori: k.id, role };
    });
    setErrors((e) => ({ ...e, kategori: false }));
    window.location.hash = "#beranda";
    scrollForm();
  };

  const submit = async () => {
    // anti-spam: honeypot terisi atau form diisi <1.2 dtk (indikasi bot)
    if (form.hp.trim() !== "" || Date.now() - formT0.current < 1200) {
      setForm(EMPTY_FORM); setErrors({}); formT0.current = Date.now();
      fireToast("Aduan terkirim");
      return;
    }
    const e = {};
    if (!form.nama.trim()) e.nama = true;
    if (!form.identitas.trim()) e.identitas = true;
    if (!form.prodi) e.prodi = true;
    if (!form.kategori) e.kategori = true;
    if (form.deskripsi.trim().length < 10) e.deskripsi = true;
    setErrors(e);
    if (Object.keys(e).length) return;

    const payload = {
      nama: form.nama.trim(), identitas: form.identitas.trim(), prodi: form.prodi,
      role: form.role, kategori: form.kategori, prioritas: form.prioritas, deskripsi: form.deskripsi.trim(), hp: form.hp,
      file: form.file,
    };

    await kirim(payload, false);
  };

  // perbarui deskripsi aduan lama (dipakai dari modal duplikat)
  const perbarui = async () => {
    if (!dupWarn) return;
    setSending(true);
    const res = await apiEditPublik({
      kode: dupWarn.existing.kode,
      stambuk: dupWarn.payload.identitas,
      deskripsi: dupWarn.payload.deskripsi,
    });
    setSending(false);
    if (res.ok) {
      setForm(EMPTY_FORM); setErrors({}); formT0.current = Date.now();
      setDupWarn(null);
      fireToast("Aduan " + res.kode + " berhasil diperbarui");
    } else {
      fireToast(res.error || "Gagal memperbarui aduan");
    }
  };

  // kirim ke server; tangani peringatan duplikat (warn) & error dari server
  const kirim = async (payload, konfirmasi) => {
    setSending(true);
    const result = await apiSubmit({ ...payload, konfirmasi: !!konfirmasi });
    setSending(false);

    if (result.warn && result.existing) {
      setDupWarn({ existing: result.existing, payload }); // tampilkan konfirmasi
      return;
    }

    if (result.ok) {
      setForm(EMPTY_FORM); setErrors({}); formT0.current = Date.now();
      setDupWarn(null);
      setSukses({
        ticket: result.ticket,
        luarJam: !!result.luarJam,
        akhirPekan: !!result.akhirPekan,
        stambuk: payload.identitas,
      });
    } else {
      setDupWarn(null);
      fireToast(result.error || "Gagal kirim — cek koneksi/URL");
    }
  };

  return (
    <>
      <Header view={view} nav={nav} onLoginAdmin={loginAdmin} />
      {view === "beranda" && <Hero onBuat={goBuat} onLayanan={() => nav("layanan")} />}
      {view === "layanan" && (
        <CuacaBand eyebrow="Layanan" title="Kategori kendala yang bisa dilaporkan"
          sub="Pilih kategori — form aduan akan otomatis terisi." />
      )}
      {view === "laporan" && (
        <CuacaBand eyebrow="Lacak Aduan" title="Hasil Laporan Aduan"
          sub="Masukkan Stambuk/NIP atau ID Aduan untuk melihat status penanganan dan catatan dari admin." />
      )}
      <div className="wrap">
        {view === "layanan" ? (
          <div className="layanan-page"><Layanan onPick={pickLayanan} /></div>
        ) : view === "laporan" ? (
          <LaporanPublik />
        ) : (
          <FormAduan form={form} setForm={setForm} errors={errors} onSubmit={submit} sending={sending} />
        )}
        <footer className="foot">
          SILAPOR FT UNTAD — Sistem Pengaduan Layanan Akademik · Fakultas Teknik, Universitas Tadulako
        </footer>
      </div>
      {sukses && (() => {
        const info = suksesInfo(sukses);
        return (
          <div className="ov" onClick={() => setSukses(null)}>
            <div className="ok-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ok-top">
                <div className={"ok-ic " + info.cls}>{info.ic}</div>
                <b>{info.judul}</b>
                <p>{info.body}</p>
                <div className="ok-ids">
                  <div className="ok-id">
                    <small>Stambuk / NIP</small>
                    <div>{sukses.stambuk || "-"}</div>
                  </div>
                  <div className="ok-id">
                    <small>ID Aduan</small>
                    <div>{sukses.ticket || "-"}</div>
                  </div>
                </div>
                <p className="ok-sub">{info.sub}</p>
              </div>
              <div className="ok-foot"><button onClick={() => setSukses(null)}>Mengerti</button></div>
            </div>
          </div>
        );
      })()}

      {dupWarn && (
        <div className="ov" onClick={() => setDupWarn(null)}>
          <div className="note-modal dup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="note-modal-h">
              <div><b>Sepertinya kamu sudah pernah melapor</b></div>
              <button className="x" onClick={() => setDupWarn(null)}>×</button>
            </div>
            <div className="note-modal-b">
              <p className="dup-lead">Kamu punya aduan yang <b>masih ditangani</b> dengan kategori yang sama:</p>
              <div className="dup-card">
                <div className="dup-id">{dupWarn.existing.kode}</div>
                <div className="dup-meta">
                  <span className="tag2 tag-kat">{dupWarn.existing.kategori}</span>
                  <span className="tag2 dup-st">{dupWarn.existing.status}</span>
                  <span className="muted td-s">{dupWarn.existing.waktu}</span>
                </div>
                {dupWarn.existing.deskripsi && <div className="dup-desc">“{dupWarn.existing.deskripsi}…”</div>}
              </div>
              <p className="dup-ask">Kalau ini <b>masalah yang sama</b> dan kamu cuma ingin memperjelas, tekan <b>Perbarui</b> — deskripsi yang baru kamu tulis akan menggantikan yang lama (tanpa bikin aduan baru).</p>
              <div className="note-actions dup-actions">
                <button className="btn-g" onClick={() => kirim(dupWarn.payload, true)} disabled={sending}>Beda masalah — kirim baru</button>
                <button className="btn-p" onClick={perbarui} disabled={sending}>
                  {sending ? "Menyimpan…" : "✏️ Perbarui aduan ini"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Toast message={toast} />
      <Chatbot />
    </>
  );
}
