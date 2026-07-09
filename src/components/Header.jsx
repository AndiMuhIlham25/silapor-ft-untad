import React from "react";

const NAV = [
  { id: "beranda", label: "Beranda" },
  { id: "layanan", label: "Layanan" },
  { id: "laporan", label: "Hasil Laporan" },
];

export default function Header({ view, nav, onLoginAdmin }) {
  return (
    <header className="hd">
      <div className="hd-in">
        <div className="crest">FT</div>
        <div className="hd-brand">
          <b>SILAPOR FT UNTAD</b>
          <small>Pengaduan Layanan Akademik · Fakultas Teknik</small>
        </div>
        <nav className="hd-nav">
          {NAV.map((n) => (
            <button key={n.id} className={view === n.id ? "on" : ""} onClick={() => nav(n.id)}>
              {n.label}
            </button>
          ))}
        </nav>
        <button className="hd-cta" onClick={onLoginAdmin}>Login Admin</button>
      </div>
    </header>
  );
}
