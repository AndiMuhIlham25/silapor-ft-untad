import React, { useState, useEffect } from "react";

const TUNDA_KEY = "silapor_install_tunda";

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null);
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    // sudah terpasang / dibuka sebagai app -> jangan tawarkan
    const terpasang =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    if (terpasang) return;

    // pernah ditutup dalam 7 hari terakhir -> jangan ganggu
    const tunda = Number(localStorage.getItem(TUNDA_KEY) || 0);
    if (tunda && Date.now() - tunda < 7 * 24 * 3600 * 1000) return;

    const onPrompt = (e) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setTampil(true), 2500); // jangan langsung nongol
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => { setTampil(false); setPrompt(null); };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const pasang = async () => {
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setTampil(false);
    setPrompt(null);
  };

  const tutup = () => {
    localStorage.setItem(TUNDA_KEY, String(Date.now()));
    setTampil(false);
  };

  if (!tampil || !prompt) return null;

  return (
    <div className="pwa-bar">
      <img src="/icon-192.png" alt="" className="pwa-ic" />
      <div className="pwa-txt">
        <b>Pasang aplikasi TEKAD</b>
        <span>Akses lebih cepat, tampil layar penuh seperti aplikasi.</span>
      </div>
      <button className="pwa-btn" onClick={pasang}>Pasang</button>
      <button className="pwa-x" onClick={tutup} aria-label="Tutup">×</button>
    </div>
  );
}
