import React, { useState } from "react";
import { apiProfile, apiChangePassword } from "../api.js";
import PasswordInput from "./PasswordInput.jsx";

export default function AdminProfile({ session, onClose, onSaved }) {
  const { token, admin } = session;
  const [p, setP] = useState({ nama: admin.nama || "", email: admin.email || "", nip: admin.nip || "", telp: admin.telp || "" });
  const [savingP, setSavingP] = useState(false);
  const [msgP, setMsgP] = useState("");

  const [pw, setPw] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [msgPw, setMsgPw] = useState("");

  const set = (k) => (e) => setP((s) => ({ ...s, [k]: e.target.value }));
  const setPwF = (k) => (e) => setPw((s) => ({ ...s, [k]: e.target.value }));

  const saveProfile = async () => {
    if (!p.nama.trim()) { setMsgP("Nama wajib diisi."); return; }
    setSavingP(true); setMsgP("");
    const res = await apiProfile(token, p);
    setSavingP(false);
    if (res.ok) { setMsgP("Profil tersimpan."); onSaved && onSaved(res.admin); }
    else setMsgP(res.error || "Gagal menyimpan.");
  };

  const savePassword = async () => {
    if (!pw.oldPassword || !pw.newPassword) { setMsgPw("Isi password lama & baru."); return; }
    if (pw.newPassword.length < 6) { setMsgPw("Password baru minimal 6 karakter."); return; }
    if (pw.newPassword !== pw.confirm) { setMsgPw("Konfirmasi password tidak cocok."); return; }
    setSavingPw(true); setMsgPw("");
    const res = await apiChangePassword(token, pw.oldPassword, pw.newPassword);
    setSavingPw(false);
    if (res.ok) { setMsgPw("Password berhasil diubah."); setPw({ oldPassword: "", newPassword: "", confirm: "" }); }
    else setMsgPw(res.error || "Gagal mengubah password.");
  };

  return (
    <div className="ov" onClick={onClose}>
      <div className="note-modal profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="note-modal-h">
          <div><b>Profil Admin</b><div className="muted td-s">@{admin.username} · {admin.jabatan || "-"}</div></div>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="note-modal-b">
          <div className="frow">
            <div className="field"><label>Nama</label><input value={p.nama} onChange={set("nama")} /></div>
            <div className="field"><label>NIP</label><input value={p.nip} onChange={set("nip")} placeholder="Nomor induk pegawai" /></div>
          </div>
          <div className="frow">
            <div className="field"><label>Email</label><input value={p.email} onChange={set("email")} placeholder="nama@untad.ac.id" /></div>
            <div className="field"><label>No. Telepon</label><input value={p.telp} onChange={set("telp")} placeholder="08xxxx" /></div>
          </div>
          {msgP && <div className="prof-msg">{msgP}</div>}
          <div className="note-actions">
            <button className="btn-p" onClick={saveProfile} disabled={savingP}>{savingP ? "Menyimpan…" : "Simpan Profil"}</button>
          </div>

          <div className="prof-divider">Ganti Password</div>
          <div className="field field-mb"><label>Password Lama</label><PasswordInput value={pw.oldPassword} onChange={setPwF("oldPassword")} /></div>
          <div className="frow">
            <div className="field"><label>Password Baru</label><PasswordInput value={pw.newPassword} onChange={setPwF("newPassword")} /></div>
            <div className="field"><label>Ulangi Password Baru</label><PasswordInput value={pw.confirm} onChange={setPwF("confirm")} /></div>
          </div>
          {msgPw && <div className="prof-msg">{msgPw}</div>}
          <div className="note-actions">
            <button className="btn-g" onClick={savePassword} disabled={savingPw}>{savingPw ? "Menyimpan…" : "Ubah Password"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
