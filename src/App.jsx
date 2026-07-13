import React, { useState, useEffect } from "react";
import { apiSubmit } from "./api.js";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Layanan from "./components/Layanan.jsx";
import FormAduan from "./components/FormAduan.jsx";
import LaporanPublik from "./components/LaporanPublik.jsx";
import Toast from "./components/Toast.jsx";
import Chatbot from "./components/Chatbot.jsx";
import { statusJamLayanan, JADWAL_TEKS } from "./utils/jam.js";

const EMPTY_FORM = { nama: "", identitas: "", prodi: "", role: "Mahasiswa", kategori: "", prioritas: "Sedang", deskripsi: "", hp: "", file: null };

export default function App() {
  const [hash, setHash] = useState(window.location.hash);
  const [toast, setToast] = useState(null);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const formT0 = React.useRef(Date.now());

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
    if (!statusJamLayanan().open) {
      fireToast("Form tutup — jam layanan: " + JADWAL_TEKS);
      return;
    }
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

    setSending(true);
    const result = await apiSubmit(payload);
    setSending(false);
    setForm(EMPTY_FORM);
    setErrors({});
    formT0.current = Date.now();

    if (result.ok) fireToast("Aduan terkirim · ID " + (result.ticket || "-") + " — simpan untuk lacak status");
    else fireToast("Gagal kirim ke spreadsheet — cek koneksi/URL");
  };

  return (
    <>
      <Header view={view} nav={nav} onLoginAdmin={loginAdmin} />
      <div className="wrap">
        {view === "layanan" ? (
          <div className="layanan-page"><Layanan onPick={pickLayanan} /></div>
        ) : view === "laporan" ? (
          <LaporanPublik />
        ) : (
          <>
            <Hero onBuat={goBuat} onLayanan={() => nav("layanan")} />
            <FormAduan form={form} setForm={setForm} errors={errors} onSubmit={submit} sending={sending} />
          </>
        )}
        <footer className="foot">
          SILAPOR FT UNTAD — Sistem Pengaduan Layanan Akademik · Fakultas Teknik, Universitas Tadulako
        </footer>
      </div>
      <Toast message={toast} />
      <Chatbot />
    </>
  );
}
