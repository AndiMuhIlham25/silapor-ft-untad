import React, { useState, useEffect, useMemo } from "react";
import ArsipUnduh from "./ArsipUnduh.jsx";
import { apiList, apiUpdateStatus, apiNote } from "../api.js";
import { KATEGORI } from "../data/seed.js";
import { statusMeta, prioMeta } from "../utils/meta.js";
import Donut from "./Donut.jsx";

export default function AdminDashboard({ session, onLogout, onProfile, onManageAdmins, isSuper }) {
  const { token, admin } = session;
  const [rows, setRows] = useState([]);
  const [links, setLinks] = useState(session.sheetLinks || []);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [fStatus, setFStatus] = useState("Semua");
  const [busyId, setBusyId] = useState(null);

  const [noteItem, setNoteItem] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await apiList(token);
    setRows(res.ok ? res.rows : []);
    if (res.sheetLinks) setLinks(res.sheetLinks);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

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
    const okQ = !q || (r.nama + r.identitas + r.deskripsi + r.prodi + r.kategori).toLowerCase().includes(q.toLowerCase());
    return okS && okQ;
  }), [rows, q, fStatus]);

  const idOf = (r) => r.ssId + r.sheet + r.row;

  const changeStatus = async (item, status) => {
    setBusyId(idOf(item));
    const res = await apiUpdateStatus(token, item, status);
    setBusyId(null);
    if (res.ok) setRows((prev) => prev.map((r) => (r === item ? { ...r, status } : r)));
  };

  const openNote = (item) => { setNoteItem(item); setNoteText(item.catatan || ""); };
  const saveNote = async () => {
    setSavingNote(true);
    const res = await apiNote(token, noteItem, noteText.trim());
    setSavingNote(false);
    if (res.ok) {
      setRows((prev) => prev.map((r) => (r === noteItem ? { ...r, catatan: noteText.trim() } : r)));
      setNoteItem(null);
    }
  };

  const fmtWaktu = (w) => {
    const d = new Date(w);
    return isNaN(d) ? String(w) : d.toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="admin">
      <header className="admin-hd">
        <div className="admin-hd-in">
          <div className="crest admin-crest">FT</div>
          <div>
            <b>Panel Admin · {admin.nama}</b>
            <small>{admin.jabatan ? admin.jabatan + " · " : ""}{isSuper ? "Semua area" : "Area: " + (admin.areas.join(", ") || "-")}</small>
          </div>
          <div className="admin-hd-r">
            {links.map((l, i) => (
              <a key={i} className="admin-sheet" href={l.url} target="_blank" rel="noreferrer" title={"Buka spreadsheet: " + l.areas.join(", ")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>
                Spreadsheet
              </a>
            ))}
            {isSuper && <button className="admin-refresh" onClick={onManageAdmins}>Kelola Admin</button>}
            <button className="admin-refresh" onClick={onProfile}>Profil</button>
            <button className="admin-refresh" onClick={load}>↻ Muat ulang</button>
            <button className="admin-logout" onClick={onLogout}>Keluar</button>
          </div>
        </div>
      </header>

      <div className="admin-wrap">
        <div className="dash">
          <div className="card">
            <h3>Distribusi Status</h3>
            <p className="cap">Proporsi aduan di area Anda</p>
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
            <p className="cap">Kategori kendala di area Anda</p>
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

        {links.length === 0 && (
          <div className="admin-note-info">
            Link spreadsheet akan muncul di sini setelah <b>AREA_SHEET</b> diisi di Code.gs.
          </div>
        )}

        <ArsipUnduh token={token} />

        <div className="controls">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, NIM, prodi, atau isi aduan…" />
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option>Semua</option><option>Baru</option><option>Diproses</option><option>Selesai</option>
          </select>
        </div>

        <div className="tblw">
          <table className="tbl">
            <thead>
              <tr><th>ID</th><th>Waktu</th><th>Pelapor</th><th>Kendala &amp; Catatan</th><th>Prioritas</th><th>Status</th><th className="ta-r">Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="emptyrow">Memuat data…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="emptyrow">Belum ada aduan di area Anda.</td></tr>
              ) : filtered.map((r, i) => {
                const sm = statusMeta(r.status), pm = prioMeta(r.prioritas);
                const bid = idOf(r);
                return (
                  <tr key={i}>
                    <td className="td-kode">{r.kode}</td>
                    <td className="muted td-s nowrap">{fmtWaktu(r.waktu)}</td>
                    <td>
                      <b className="td-b">{r.nama}</b>
                      <span className="muted td-s">{r.role} · {r.prodi} · {r.identitas}</span>
                    </td>
                    <td>
                      <span className="tag2 tag-kat">{r.kategori}</span>
                      <div className="muted td-desc">{r.deskripsi}</div>
                      {r.catatan && <div className="td-note">📝 {r.catatan}</div>}
                    </td>
                    <td><span className="tag2" style={{ color: pm.c, background: pm.bg }}>{r.prioritas}</span></td>
                    <td><span className="tag2" style={{ color: sm.c, background: sm.bg }}>{r.status}</span></td>
                    <td className="ta-r nowrap">
                      {r.status === "Baru" && <button className="act" disabled={busyId === bid} onClick={() => changeStatus(r, "Diproses")}>Proses</button>}
                      {r.status !== "Selesai" && <button className="act" disabled={busyId === bid} onClick={() => changeStatus(r, "Selesai")}>Selesai</button>}
                      <button className="act" onClick={() => openNote(r)}>Catatan</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {noteItem && (
        <div className="ov" onClick={() => setNoteItem(null)}>
          <div className="note-modal" onClick={(e) => e.stopPropagation()}>
            <div className="note-modal-h">
              <div>
                <b>Catatan Aduan</b>
                <div className="muted td-s">{noteItem.nama} · {noteItem.kategori}</div>
              </div>
              <button className="x" onClick={() => setNoteItem(null)}>×</button>
            </div>
            <div className="note-modal-b">
              <div className="note-ctx">{noteItem.deskripsi}</div>
              <label className="note-lbl">Catatan / keterangan admin</label>
              <textarea className="note-ta" value={noteText} onChange={(e) => setNoteText(e.target.value)}
                placeholder="mis. Sudah dihubungi via WA, menunggu kelengkapan berkas…" />
              <div className="note-actions">
                <button className="btn-g" onClick={() => setNoteItem(null)}>Batal</button>
                <button className="btn-p" onClick={saveNote} disabled={savingNote}>{savingNote ? "Menyimpan…" : "Simpan Catatan"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
