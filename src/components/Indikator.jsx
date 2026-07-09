import React from "react";

export default function Indikator({ cTotal, cProses, cSelesai, cUrgent }) {
  const inds = [
    { lbl: "Total Aduan", val: cTotal, sub: "Semua laporan masuk", grad: "linear-gradient(135deg,#3b82f6,#2563eb)" },
    { lbl: "Sedang Diproses", val: cProses, sub: "Dalam penanganan", grad: "linear-gradient(135deg,#f59e0b,#d97706)" },
    { lbl: "Selesai", val: cSelesai, sub: "Sudah ditutup", grad: "linear-gradient(135deg,#10b981,#059669)" },
    { lbl: "Urgent", val: cUrgent, sub: "Butuh tindak lanjut", grad: "linear-gradient(135deg,#ef4444,#dc2626)" },
  ];
  return (
    <section className="sec" id="ringkasan">
      <div className="sec-h"><div className="eyebrow">Ringkasan</div><h2>Status Aduan Hari Ini</h2></div>
      <div className="ind-grid">
        {inds.map((c, i) => (
          <div key={i} className="ind" style={{ background: c.grad }}>
            <div className="lbl">{c.lbl}</div>
            <div className="val">{c.val}</div>
            <div className="sub">{c.sub}</div>
            <svg className="spark" width="66" height="28" viewBox="0 0 66 28" fill="none">
              <polyline points="0,22 11,16 22,19 33,9 44,13 55,5 66,8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        ))}
      </div>
    </section>
  );
}
