import React from "react";

export default function Hero({ onBuat, onLayanan }) {
  return (
    <section className="hero-simple" id="beranda">
      <span className="tag"><span className="tag-dot" /> Mahasiswa · Dosen · Operator Prodi/Jurusan</span>
      <h1>Sampaikan <span className="g">kendala akademik Anda.</span></h1>
      <p>
        Portal pengaduan pelayanan sistem akademik Fakultas Teknik Universitas Tadulako.
        Laporkan kendala SIGA-8, nilai, jadwal, KRS, akses akun, atau layanan lainnya —
        langsung diteruskan ke admin yang tepat.
      </p>
      <div className="hero-btns">
        <button className="btn-p" onClick={onBuat}>Buat Aduan Sekarang</button>
        <button className="btn-g" onClick={onLayanan}>Lihat Kategori Layanan</button>
      </div>
    </section>
  );
}
