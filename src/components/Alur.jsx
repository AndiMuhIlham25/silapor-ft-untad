import React from "react";
import { ALUR } from "../data/seed.js";

export default function Alur() {
  return (
    <section className="sec" id="alur">
      <div className="sec-h">
        <div className="eyebrow">Alur</div>
        <h2>Bagaimana aduan diproses</h2>
        <p>Empat tahap dari laporan masuk sampai selesai ditangani.</p>
      </div>
      <div className="steps">
        {ALUR.map((s, i) => (
          <div className="step" key={i}>
            <div className="step-n">{i + 1}</div>
            <b>{s.t}</b>
            <p>{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
