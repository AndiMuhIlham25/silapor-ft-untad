import React, { useState, useEffect } from "react";
import { apiArchiveMonths, apiArchiveData } from "../api.js";
import { toCSV, downloadCSV } from "../utils/csv.js";

export default function ArsipUnduh({ token }) {
  const [months, setMonths] = useState([]);
  const [bulan, setBulan] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const res = await apiArchiveMonths(token);
      if (res.ok && res.months && res.months.length) {
        setMonths(res.months);
        setBulan(res.months[0]);
      }
    })();
  }, [token]);

  const unduh = async () => {
    if (!bulan) return;
    setBusy(true); setMsg("");
    const res = await apiArchiveData(token, bulan);
    setBusy(false);
    if (!res.ok) { setMsg(res.error || "Gagal mengambil arsip."); return; }
    if (!res.rows || !res.rows.length) { setMsg("Tidak ada arsip untukmu di bulan ini."); return; }
    downloadCSV(`arsip-aduan-${bulan}.csv`, toCSV(res.header, res.rows));
    setMsg(`${res.rows.length} baris diunduh.`);
  };

  if (!months.length) return null; // sembunyikan bila belum ada arsip

  return (
    <div className="arsip-box">
      <span className="arsip-lbl">📁 Unduh arsip aduan:</span>
      <select value={bulan} onChange={(e) => setBulan(e.target.value)}>
        {months.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <button className="arsip-btn" onClick={unduh} disabled={busy}>
        {busy ? "Menyiapkan…" : "Download CSV"}
      </button>
      {msg && <span className="arsip-msg">{msg}</span>}
    </div>
  );
}
