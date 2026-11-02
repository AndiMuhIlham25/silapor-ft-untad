
import React, { useState, useEffect } from "react";
import { apiArchiveMonths, apiArchiveData } from "../api.js";
import { downloadCSV } from "../utils/csv.js";

// Format CSV agar Excel mengenali pemisah kolom titik koma
function toExcelCSV(header, rows) {
  const delimiter = ";";

  const escapeCell = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
  };

  const allRows = [header, ...rows];

  const csv = allRows
    .map(row => row.map(escapeCell).join(delimiter))
    .join("\r\n");

  // BOM UTF-8 + instruksi pemisah untuk Microsoft Excel
  return "\uFEFFsep=;\r\n" + csv;
}

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

    setBusy(true);
    setMsg("");

    try {
      const res = await apiArchiveData(token, bulan);

      if (!res.ok) {
        setMsg(res.error || "Gagal mengambil arsip.");
        return;
      }

      if (!res.rows || !res.rows.length) {
        setMsg("Tidak ada arsip untukmu di bulan ini.");
        return;
      }

      const csv = toExcelCSV(res.header, res.rows);

      downloadCSV(
        `arsip-aduan-${bulan}.csv`,
        csv
      );

      setMsg(`${res.rows.length} baris berhasil diunduh.`);
    } catch (error) {
      setMsg("Terjadi kesalahan saat mengunduh arsip.");
    } finally {
      setBusy(false);
    }
  };

  if (!months.length) return null;

  return (
    <div className="arsip-box">
      <span className="arsip-lbl">
        📁 Unduh arsip aduan:
      </span>

      <select
        value={bulan}
        onChange={(e) => setBulan(e.target.value)}
      >
        {months.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <button
        className="arsip-btn"
        onClick={unduh}
        disabled={busy}
      >
        {busy ? "Menyiapkan…" : "Download Excel"}
      </button>

      {msg && (
        <span className="arsip-msg">{msg}</span>
      )}
    </div>
  );
}
