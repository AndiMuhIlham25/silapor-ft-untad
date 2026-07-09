import React, { useState } from "react";
import { apiLogin } from "../api.js";
import PasswordInput from "./PasswordInput.jsx";

export default function AdminLogin({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!u || !p) { setErr("Isi username dan password."); return; }
    setBusy(true);
    setErr("");
    const res = await apiLogin(u.trim(), p);
    setBusy(false);
    if (res.ok) onLogin(res);
    else setErr(res.error || "Login gagal.");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-crest">FT</div>
        <h1>Login Admin</h1>
        <p className="login-sub">SILAPOR FT UNTAD · Panel Admin Prodi</p>

        <div className="login-field">
          <label>Username</label>
          <input value={u} onChange={(e) => setU(e.target.value)} placeholder="mis. admin1"
            onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>
        <div className="login-field">
          <label>Password</label>
          <PasswordInput value={p} onChange={(e) => setP(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>

        {err && <div className="login-err">{err}</div>}

        <button className="login-btn" onClick={submit} disabled={busy}>
          {busy ? "Memeriksa…" : "Masuk"}
        </button>
        <a className="login-back" href="#">← Kembali ke halaman aduan</a>
      </div>
    </div>
  );
}
