import React, { useState, useEffect, useMemo } from "react";
import { apiPublic, apiCekNim } from "../api.js";
import { KATEGORI } from "../data/seed.js";
import { statusMeta, prioMeta } from "../utils/meta.js";
import Donut from "./Donut.jsx";

export default function LaporanPublik() {
  // ringkasan anonim (bulan berjalan)
  const [rows, setRows] = useState([]);
  useEffect(() => {
    const load = async () => { const r = await apiPublic(); if (r.ok) setRows(r.rows); };
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
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
      .sort((a, b) => b.n - a.n), [rows]);
  const maxKat = Math.max(1, ...katBars.map((k) => k.n));

  // lacak aduan by Stambuk
  const [stambuk, setStambuk] = useState("");
  const [hasil, setHasil] = useState(null);
  const [cari, setCari] = useState(false);
  const [err, setErr] = useState("");

  // pagination hasil lacak
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const totalPages = hasil ? Math.max(1, Math.ceil(hasil.length / pageSize)) : 1;
  useEffect(() => { setPage(1); }, [hasil, pageSize]);
  const paged = hasil ? hasil.slice((page - 1) * pageSize, page * pageSize) : [];
  const fromN = hasil && hasil.length ? (page - 1) * pageSize + 1 : 0;
  const toN = hasil ? Math.min(page * pageSize, hasil.length) : 0;
  const pageList = () => {
    const out = [], win = 2;
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= page - win && p <= page + win)) out.push(p);
      else if (out[out.length - 1] !== "…") out.push("…");
    }
    return out;
  };

  const lacak = async () => {
    const q = stambuk.trim();
    if (q.length < 3) { setErr("Masukkan Stambuk/NIP dengan benar."); return; }
    setErr(""); setCari(true); setHasil(null);
    const res = await apiCekNim(q);
    setCari(false);
    if (res.ok) setHasil(res.rows);
    else setErr(res.error || "Gagal mengambil data.");
  };

  const fmtWaktu = (w) => {
    const d = new Date(w);
    return isNaN(d) ? String(w) : d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <section className="sec" id="laporan">
      <div className="lacak-box">
        <input
          value={stambuk}
          onChange={(e) => setStambuk(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lacak()}
          placeholder="Ketik Stambuk / NIP kamu, contoh: F12122088"
        />
        <button className="btn-p" onClick={lacak} disabled={cari}>{cari ? "Mencari…" : "Lacak Aduan"}</button>
      </div>
      {err && <div className="lacak-err">{err}</div>}

      {hasil && (
        hasil.length === 0 ? (
          <div className="lacak-empty">
            Tidak ada aduan atas Stambuk/NIP <b>{stambuk.trim()}</b>. Pastikan penulisannya sama persis seperti saat mengirim aduan.
          </div>
        ) : (
          <div className="lacak-list">
            <div className="lacak-count">{hasil.length} aduan ditemukan untuk <b>{hasil[0].nama}</b></div>
            {paged.map((r, i) => {
              const sm = statusMeta(r.status), pm = prioMeta(r.prioritas);
              return (
                <div className="lacak-item" key={i}>
                  <div className="lacak-top">
                    <span className="td-kode">{r.kode}</span>
                    <span className="tag2" style={{ color: sm.c, background: sm.bg }}>{r.status}</span>
                  </div>
                  <div className="lacak-meta">
                    <span className="tag2 tag-kat">{r.kategori}</span>
                    <span className="tag2" style={{ color: pm.c, background: pm.bg }}>{r.prioritas}</span>
                    <span className="muted td-s">{r.prodi}</span>
                    <span className="muted td-s">· {fmtWaktu(r.waktu)}</span>
                  </div>
                  {r.deskripsi && <div className="lacak-desc">{r.deskripsi}</div>}
                  {r.catatan
                    ? <div className="pub-note lacak-note">📝 {r.catatan}</div>
                    : <div className="muted td-s lacak-nonote">Belum ada catatan dari admin.</div>}
                </div>
              );
            })}

            {hasil.length > pageSize && (
              <div className="pager">
                <span className="pager-info">Menampilkan {fromN}–{toN} dari {hasil.length} aduan</span>
                <div className="pager-ctrl">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
                  {pageList().map((p, i) => p === "…"
                    ? <span key={"e" + i} className="pager-dot">…</span>
                    : <button key={p} className={p === page ? "on" : ""} onClick={() => setPage(p)}>{p}</button>)}
                  <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
                </div>
                <select className="pager-size" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                  <option value={10}>10 / halaman</option>
                  <option value={25}>25 / halaman</option>
                </select>
              </div>
            )}
          </div>
        )
      )}

      <div className="dash lacak-dash">
        <div className="card">
          <h3>Distribusi Status</h3>
          <p className="cap">Seluruh aduan bulan ini</p>
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
    </section>
  );
}
