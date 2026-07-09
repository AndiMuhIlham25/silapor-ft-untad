import React, { useMemo } from "react";
import { KATEGORI } from "../data/seed.js";
import { statusMeta, prioMeta } from "../utils/meta.js";
import Donut from "./Donut.jsx";

export default function Dashboard({ aduan, stats, filters, setFilters, setStatus, remove }) {
  const { q, fStatus, fKat } = filters;

  const statusDonut = [
    { v: stats.baru, color: "#1d4ed8", label: "Baru" },
    { v: stats.proses, color: "#d97706", label: "Diproses" },
    { v: stats.selesai, color: "#059669", label: "Selesai" },
  ];

  const katBars = useMemo(
    () =>
      KATEGORI.map((k) => ({ ...k, n: aduan.filter((a) => a.kategori === k.id).length }))
        .sort((a, b) => b.n - a.n),
    [aduan]
  );
  const maxKat = Math.max(1, ...katBars.map((k) => k.n));

  const filtered = useMemo(
    () =>
      aduan.filter((a) => {
        const okS = fStatus === "Semua" || a.status === fStatus;
        const okK = fKat === "Semua" || a.kategori === fKat;
        const okQ = !q || (a.nama + a.identitas + a.deskripsi + a.kategori).toLowerCase().includes(q.toLowerCase());
        return okS && okK && okQ;
      }),
    [aduan, fStatus, fKat, q]
  );

  return (
    <section className="sec" id="dashboard">
      <div className="sec-h">
        <div className="eyebrow">Dashboard</div>
        <h2>Monitoring Aduan</h2>
        <p>Statistik & daftar aduan terupdate otomatis setiap ada laporan baru.</p>
      </div>

      <div className="dash">
        <div className="card">
          <h3>Distribusi Status</h3>
          <p className="cap">Proporsi aduan per status penanganan</p>
          <div className="donut-wrap">
            <Donut data={statusDonut} />
            <div className="legend">
              {statusDonut.map((s, i) => (
                <div className="li" key={i}>
                  <span className="sw" style={{ background: s.color }} /> {s.label}
                  <span className="lv">{s.v}</span>
                </div>
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
        <input
          value={q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          placeholder="Cari nama, NIM, atau isi aduan…"
        />
        <select value={fStatus} onChange={(e) => setFilters((f) => ({ ...f, fStatus: e.target.value }))}>
          <option>Semua</option><option>Baru</option><option>Diproses</option><option>Selesai</option>
        </select>
        <select value={fKat} onChange={(e) => setFilters((f) => ({ ...f, fKat: e.target.value }))}>
          <option>Semua</option>
          {KATEGORI.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
        </select>
      </div>

      <div className="tblw">
        <table className="tbl">
          <thead>
            <tr>
              <th>Pelapor</th><th>Kendala</th><th>Prioritas</th><th>Status</th>
              <th className="ta-r">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="emptyrow">Tidak ada aduan yang cocok dengan filter.</td></tr>
            ) : (
              filtered.map((a) => {
                const sm = statusMeta(a.status);
                const pm = prioMeta(a.prioritas);
                return (
                  <tr key={a.id}>
                    <td>
                      <b className="td-b">{a.nama}</b>
                      <span className="muted td-s">{a.role} · {a.prodi || "-"} · {a.identitas} · {a.waktu}</span>
                    </td>
                    <td>
                      <span className="tag2 tag-kat">{a.kategori}</span>
                      <div className="muted td-desc">{a.deskripsi}</div>
                    </td>
                    <td><span className="tag2" style={{ color: pm.c, background: pm.bg }}>{a.prioritas}</span></td>
                    <td><span className="tag2" style={{ color: sm.c, background: sm.bg }}>{a.status}</span></td>
                    <td className="ta-r nowrap">
                      {a.status === "Baru" && <button className="act" onClick={() => setStatus(a.id, "Diproses")}>Proses</button>}
                      {a.status !== "Selesai" && <button className="act" onClick={() => setStatus(a.id, "Selesai")}>Selesai</button>}
                      <button className="act del" onClick={() => remove(a.id)}>Hapus</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
