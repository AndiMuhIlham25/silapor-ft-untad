import React, { useState } from "react";
import { KATEGORI, ROLES, PRIORITAS, PRODI } from "../data/seed.js";
import { fileToBase64 } from "../utils/file.js";

export default function FormAduan({ form, setForm, errors, onSubmit, sending }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const [fileErr, setFileErr] = useState("");

  const onFile = async (e) => {
    setFileErr("");
    const f = e.target.files && e.target.files[0];
    if (!f) { setForm((s) => ({ ...s, file: null })); return; }
    if (!/\.(pdf|jpe?g|png|webp)$/i.test(f.name)) { setFileErr("Hanya pdf, jpg, png, atau webp."); e.target.value = ""; return; }
    if (f.size > 1048576) { setFileErr("Ukuran maksimal 1 MB."); e.target.value = ""; return; }
    const data = await fileToBase64(f);
    setForm((s) => ({ ...s, file: { name: f.name, mime: f.type, data } }));
  };

  return (
    <section className="sec" id="aduan">
      <div className="sec-h">
        <div className="eyebrow">Pengaduan</div>
        <h2>Isi form pengaduan</h2>
        <p>Jelaskan kendala sedetail mungkin agar cepat ditindaklanjuti ke admin yang tepat.</p>
      </div>

      <div className="form-card">


      {/* honeypot anti-spam: tak terlihat manusia, sering diisi bot */}
      <div className="hp-field" aria-hidden="true">
        <label>Website<input tabIndex={-1} autoComplete="off" value={form.hp} onChange={(e) => setForm((f) => ({ ...f, hp: e.target.value }))} /></label>
      </div>
        <div className="frow">
          <div className="field">
            <label>Nama Lengkap</label>
            <input className={errors.nama ? "err" : ""} value={form.nama} onChange={set("nama")} placeholder="Nama kamu" />
            {errors.nama && <div className="err-msg">Nama wajib diisi.</div>}
          </div>
          <div className="field">
            <label>Stambuk / NIP / NIDN</label>
            <input className={errors.identitas ? "err" : ""} value={form.identitas} onChange={set("identitas")} placeholder="Nomor identitas" />
            {errors.identitas && <div className="err-msg">Nomor identitas wajib diisi.</div>}
          </div>
        </div>

        <div className="frow">
          <div className="field">
            <label>Program Studi</label>
            <select className={errors.prodi ? "err" : ""} value={form.prodi} onChange={set("prodi")}>
              <option value="">Pilih prodi…</option>
              {PRODI.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.prodi && <div className="err-msg">Prodi wajib dipilih (untuk arah admin).</div>}
          </div>
          <div className="field">
            <label>Peran</label>
            <div className="chips">
              {ROLES.map((r) => (
                <button key={r} type="button" className={"chip" + (form.role === r ? " on" : "")} onClick={() => setForm((f) => {
                  const kat = KATEGORI.find((k) => k.id === f.kategori && k.roles.includes(r)) ? f.kategori : "";
                  return { ...f, role: r, kategori: kat };
                })}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="frow">
          <div className="field">
            <label>Kategori Masalah <span className="lbl-hint">(sesuai peran)</span></label>
            <select className={errors.kategori ? "err" : ""} value={form.kategori} onChange={set("kategori")}>
              <option value="">Pilih kategori…</option>
              {KATEGORI.filter((k) => k.roles.includes(form.role)).map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
            {errors.kategori && <div className="err-msg">Pilih salah satu kategori.</div>}
          </div>
          <div className="field">
            <label>Prioritas</label>
            <select value={form.prioritas} onChange={set("prioritas")}>
              {PRIORITAS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="field field-mb2">
          <label>Deskripsi Kendala</label>
          <textarea className={errors.deskripsi ? "err" : ""} value={form.deskripsi} onChange={set("deskripsi")} placeholder="Ceritakan detail: kapan terjadi, pesan error, dan yang sudah kamu coba…" />
          {errors.deskripsi && <div className="err-msg">Minimal 10 karakter agar jelas.</div>}
        </div>

        <div className="field field-mb2">
          <label>Lampiran <span className="lbl-hint">(opsional · pdf/jpg/png · maks 1 MB)</span></label>
          {form.file ? (
            <div className="file-chip">
              <span>📎 {form.file.name}</span>
              <button type="button" onClick={() => setForm((s) => ({ ...s, file: null }))}>Hapus</button>
            </div>
          ) : (
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={onFile} />
          )}
          {fileErr && <div className="err-msg">{fileErr}</div>}
        </div>

        <button className="submit" onClick={onSubmit} disabled={sending}>
          {sending ? "Mengirim…" : "Kirim Aduan"}
        </button>
      </div>
    </section>
  );
}
