import React from "react";
import { KATEGORI } from "../data/seed.js";

export default function Layanan({ onPick }) {
  return (
    <section className="sec" id="layanan">
      <div className="sec-h">
        <div className="eyebrow">Layanan</div>
        <h2>Kategori kendala yang bisa dilaporkan</h2>
        <p>Pilih kategori — form aduan akan otomatis terisi.</p>
      </div>
      <div className="svc-grid">
        {KATEGORI.map((k) => (
          <button key={k.id} className="svc" onClick={() => onPick(k)}>
            <div className="svc-ic" style={{ background: `linear-gradient(135deg, ${k.c}, ${k.c}bb)` }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M9 13l2 2 4-4" />
              </svg>
            </div>
            <b>{k.label}</b>
            <p>{k.desc}</p>
            <div className="pick">Lapor kategori ini →</div>
          </button>
        ))}
      </div>
    </section>
  );
}
