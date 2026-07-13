import React, { useState, useEffect } from "react";
import logoUntad from "../assets/logo-untad.png";
import { apiAdminList, apiAdminSave, apiAdminDelete } from "../api.js";
import { AREAS } from "../data/seed.js";
import ArsipUnduh from "./ArsipUnduh.jsx";
import PasswordInput from "./PasswordInput.jsx";

const EMPTY = { username: "", nama: "", email: "", nip: "", telp: "", jabatan: "", role: "admin", areas: [], password: "" };

export default function SuperAdmin({ session, onBack, onProfile, onLogout }) {
  const { token } = session;
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null); // record being edited/created
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await apiAdminList(token);
    setAdmins(res.ok ? res.admins : []);
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const openNew = () => { setEdit({ ...EMPTY }); setMsg(""); };
  const openEdit = (a) => { setEdit({ ...EMPTY, ...a, password: "" }); setMsg(""); };
  const toggleArea = (id) => setEdit((e) => ({
    ...e, areas: e.areas.includes(id) ? e.areas.filter((x) => x !== id) : [...e.areas, id],
  }));

  const save = async () => {
    if (!edit.username.trim()) { setMsg("Username wajib."); return; }
    setBusy(true); setMsg("");
    const res = await apiAdminSave(token, edit);
    setBusy(false);
    if (res.ok) { setEdit(null); load(); }
    else setMsg(res.error || "Gagal menyimpan.");
  };

  const remove = async (a) => {
    if (!window.confirm(`Hapus admin "${a.username}"?`)) return;
    const res = await apiAdminDelete(token, a.username);
    if (res.ok) load();
    else alert(res.error || "Gagal menghapus.");
  };

  const areaLabel = (id) => (AREAS.find((x) => x.id === id) || {}).label || id;

  return (
    <div className="admin">
      <header className="admin-hd">
        <div className="admin-hd-in">
          <img className="crest admin-crest crest-img" src={logoUntad} alt="Logo Untad" />
          <div><b>Super Admin · Kelola Admin</b><small>Atur jabatan, area, & akses admin</small></div>
          <div className="admin-hd-r">
            <button className="admin-refresh" onClick={onBack}>← Monitoring</button>
            <button className="admin-refresh" onClick={onProfile}>Profil</button>
            <button className="admin-logout" onClick={onLogout}>Keluar</button>
          </div>
        </div>
      </header>

      <div className="admin-wrap">
        <div className="super-top">
          <h3>Daftar Admin ({admins.length})</h3>
          <button className="btn-p" onClick={openNew}>+ Tambah Admin</button>
        </div>

        <ArsipUnduh token={token} />

        <div className="tblw">
          <table className="tbl">
            <thead>
              <tr><th>Username</th><th>Nama</th><th>Jabatan</th><th>Role</th><th>Area</th><th className="ta-r">Aksi</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="emptyrow">Memuat…</td></tr>
              ) : admins.length === 0 ? (
                <tr><td colSpan={6} className="emptyrow">Belum ada admin.</td></tr>
              ) : admins.map((a) => (
                <tr key={a.username}>
                  <td className="td-b">@{a.username}</td>
                  <td>{a.nama}</td>
                  <td className="muted td-s">{a.jabatan || "-"}</td>
                  <td>{a.role === "super"
                    ? <span className="tag2" style={{ color: "#7c3aed", background: "#f5f3ff" }}>Super</span>
                    : <span className="tag2" style={{ color: "#0891b2", background: "#ecfeff" }}>Admin</span>}</td>
                  <td className="muted td-s">{a.role === "super" ? "Semua area" : (a.areas.length ? a.areas.map(areaLabel).join(", ") : "—")}</td>
                  <td className="ta-r nowrap">
                    <button className="act" onClick={() => openEdit(a)}>Edit</button>
                    <button className="act del" onClick={() => remove(a)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {edit && (
        <div className="ov" onClick={() => setEdit(null)}>
          <div className="note-modal profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="note-modal-h">
              <div><b>{admins.find((x) => x.username === edit.username) ? "Edit Admin" : "Tambah Admin"}</b></div>
              <button className="x" onClick={() => setEdit(null)}>×</button>
            </div>
            <div className="note-modal-b">
              <div className="frow">
                <div className="field"><label>Username</label>
                  <input value={edit.username} onChange={(e) => setEdit({ ...edit, username: e.target.value })}
                    disabled={!!admins.find((x) => x.username === edit.username)} placeholder="mis. admin6" />
                </div>
                <div className="field"><label>Nama</label>
                  <input value={edit.nama} onChange={(e) => setEdit({ ...edit, nama: e.target.value })} /></div>
              </div>
              <div className="frow">
                <div className="field"><label>Jabatan</label>
                  <input value={edit.jabatan} onChange={(e) => setEdit({ ...edit, jabatan: e.target.value })} placeholder="mis. Admin Prodi / Persuratan" /></div>
                <div className="field"><label>Role</label>
                  <select value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}>
                    <option value="admin">Admin</option><option value="super">Super Admin</option>
                  </select></div>
              </div>
              <div className="frow">
                <div className="field"><label>Email</label>
                  <input value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></div>
                <div className="field"><label>NIP</label>
                  <input value={edit.nip} onChange={(e) => setEdit({ ...edit, nip: e.target.value })} /></div>
              </div>
              <div className="field field-mb">
                <label>Password {admins.find((x) => x.username === edit.username) && <span className="muted">(kosongkan bila tak diubah)</span>}</label>
                <PasswordInput value={edit.password} onChange={(e) => setEdit({ ...edit, password: e.target.value })} placeholder="minimal 6 karakter" />
              </div>

              {edit.role !== "super" && (
                <div className="field field-mb">
                  <label>Area yang dipegang <span className="muted">(prodi opsional sesuai jabatan)</span></label>
                  <div className="area-grid">
                    {AREAS.map((ar) => (
                      <label key={ar.id} className={"area-chip" + (edit.areas.includes(ar.id) ? " on" : "")}>
                        <input type="checkbox" checked={edit.areas.includes(ar.id)} onChange={() => toggleArea(ar.id)} />
                        {ar.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {edit.role === "super" && <div className="prof-msg">Super Admin otomatis mengakses semua area.</div>}

              {msg && <div className="prof-msg">{msg}</div>}
              <div className="note-actions">
                <button className="btn-g" onClick={() => setEdit(null)}>Batal</button>
                <button className="btn-p" onClick={save} disabled={busy}>{busy ? "Menyimpan…" : "Simpan"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
