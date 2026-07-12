import React, { useState, useEffect, useMemo, useRef } from "react";
import { apiPublic } from "../api.js";
import { KATEGORI } from "../data/seed.js";
import { statusMeta, prioMeta } from "../utils/meta.js";
import Donut from "./Donut.jsx";

export default function LaporanPublik() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("Semua");
  const timer = useRef(null);

  const load = async () => {
    const res = await apiPublic();
    if (res.ok) { setRows(res.rows); setUpdatedAt(new Date()); }
    setLoading(false);
  };

  useEffect(() => {
    load();
    timer.current = setInterval(load, 60000); // auto-refresh 60 dtk (live)
    return () => clearInterval(timer.current);
    /* eslint-disable-next-line */
  }, []);

  const stats = useMemo(() => ({
    total: rows.length,
    baru: rows.filter((r) => r.status === "Baru").length,
    proses: rows.filter((r) => r.status === "Diproses").length,
    selesai: rows.filter((r) => r.status === "Selesai").length,
  }), [rows]);

  const donut = [
    { v: stats.baru, color: "#1d4ed8", label: "Baru" },
    { v: stats.proses, color: "#d97706", label: "Diproses" },
    { v: stats.selesai, color: "#059669", label: "Selesai" },
  ];

  const katBars = useMemo(() =>
    KATEGORI.map((k) => ({ ...k, n: rows.filter((r) => r.kategori === k.id).length }))
      .sort((a, b) => b.n - a.n),
    [rows]);
  const maxKat = Math.max(1, ...katBars.map((k) => k.n));

  const filtered = useMemo(() => rows.filter((r) => {
    const okS = fStatus === "Semua" || r.status === fStatus;
    const okQ = !q || (r.kode + r.nama + r.prodi + r.kategori).toLowerCase().includes(q.toLowerCase());
    return okS && okQ;
  }), [rows, q, fStatus]);

  const fmtWaktu = (w) => {
    const d = new Date(w);
    return isNaN(d) ? String(w) : d.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <section className="sec" id="laporan">
      <div className="sec-h">
        <div className="eyebrow">Monitoring Publik</div>
        <h2>Hasil Laporan Aduan</h2>
        <p>
          Pantau status aduan bulan ini secara langsung. Identitas pelapor disamarkan demi privasi.
          <span className="live-badge"><span className="live-dot" /> Live</span>
          {updatedAt && <span className="live-upd"> · diperbarui {fmtWaktu(updatedAt)}</span>}
        </p>
      </div>

      <div className="dash">
        <div className="card">
          <h3>Distribusi Status</h3>
          <p className="cap">Proporsi aduan per status penanganan</p>
          <div className="donut-wrap">
            <Donut data={donut} size={130} />
            <div className="legend">
              <div className="li"><span className="sw" style={{ background: "#94a3b8" }} /> Total <span className="lv">{stats.total}</span></div>
              {donut.map((s, i) => (
                <div className="li" key={i}><span className="sw" style={{ background: s.color }} /> {s.label} <span className="lv">{s.v}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <h3>Aduan per Kategori</h3>
          <p className="cap">Kategori kendala paling sering dilaporkan</p>
          <div className="barlist">
            {katBars.map((k) => (
              <div className="b" key={k.id}>
                <span className="bn">{k.id}</span>
                <span className="bt"><div style={{ width: `${(k.n / maxKat) * 100}%`, background: k.c }} /></span>
                <span className="bv">{k.n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="controls">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari ID aduan, prodi, kategori, atau nama depan kamu…" />
        <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option>Semua</option><option>Baru</option><option>Diproses</option><option>Selesai</option>
        </select>
      </div>

      <div className="tblw">
        <table className="tbl">
          <thead>
            <tr><th>ID Aduan</th><th>Waktu</th><th>Pelapor</th><th>Prodi</th><th>Kategori</th><th>Prioritas</th><th>Status</th><th>Catatan Admin</th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="emptyrow">Memuat data…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="emptyrow">Belum ada aduan yang cocok.</td></tr>
            ) : filtered.map((r, i) => {
              const sm = statusMeta(r.status), pm = prioMeta(r.prioritas);
              return (
                <tr key={i}>
                  <td className="td-kode">{r.kode}</td>
                  <td className="muted td-s nowrap">{fmtWaktu(r.waktu)}</td>
                  <td className="td-b">{r.nama}</td>
                  <td className="muted td-s">{r.prodi}</td>
                  <td><span className="tag2 tag-kat">{r.kategori}</span></td>
                  <td><span className="tag2" style={{ color: pm.c, background: pm.bg }}>{r.prioritas}</span></td>
                  <td><span className="tag2" style={{ color: sm.c, background: sm.bg }}>{r.status}</span></td>
                  <td>{r.catatan ? <span className="pub-note">📝 {r.catatan}</span> : <span className="muted">—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
