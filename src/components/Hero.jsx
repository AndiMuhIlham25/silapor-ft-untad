import React, { useState } from "react";
import CuacaBackground from "./CuacaBackground.jsx";

export default function Hero({ onBuat, onLayanan }) {
  const [mood, setMood] = useState("light");
  return (
    <section className={"hero-simple hero-cuaca mood-" + mood} id="beranda">
      <CuacaBackground onMood={setMood} />
      <div className="hero-content">
        <span className="tag"><span className="tag-dot" /> Mahasiswa · Dosen · Operator Prodi/Jurusan</span>
        <h1>Sampaikan <span className="g">kendala akademik Anda.</span></h1>
        <p>
          Portal pengaduan pelayanan sistem akademik Fakultas Teknik Universitas Tadulako.
          Laporkan kendala SIGA-8, nilai, jadwal, KRS, akses akun, atau layanan lainnya —
          langsung diteruskan ke admin prodi yang tepat.
        </p>
        <div className="hero-btns">
          <button className="btn-p" onClick={onBuat}>Buat Aduan Sekarang</button>
          <button className="btn-g" onClick={onLayanan}>Lihat Kategori Layanan</button>
        </div>
      </div>
    </section>
  );
}
