import React, { useState, useEffect } from "react";

export default function Diagnosa() {
  const [d, setD] = useState(null);

  useEffect(() => {
    (async () => {
      const modes = ["standalone", "fullscreen", "minimal-ui", "browser"];
      const mode = modes.find((m) => window.matchMedia(`(display-mode: ${m})`).matches) || "tidak diketahui";
      const iosStandalone = window.navigator.standalone === true;

      let mf = null, mfErr = null;
      try {
        const res = await fetch("/manifest.webmanifest", { cache: "no-store" });
        mf = await res.json();
      } catch (e) { mfErr = String(e); }

      let sw = "tidak didukung", swScope = "-";
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        sw = regs.length ? `aktif (${regs.length})` : "belum terdaftar";
        if (regs.length) swScope = regs[0].scope;
      }

      setD({
        mode, iosStandalone, mf, mfErr, sw, swScope,
        https: location.protocol === "https:",
        url: location.href,
        ua: navigator.userAgent,
      });
    })();
  }, []);

  const bersihkan = async () => {
    if (!window.confirm("Hapus service worker & cache lalu muat ulang?")) return;
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    location.reload(true);
  };

  if (!d) return <div className="diag"><p>Memeriksa…</p></div>;

  const ok = (v) => (v ? "ok" : "bad");
  const mfOk = d.mf && d.mf.start_url === "/" && d.mf.scope === "/" && d.mf.display === "standalone";
  const terpasang = d.mode === "standalone" || d.mode === "fullscreen" || d.iosStandalone;

  return (
    <div className="diag">
      <h2>Diagnosa Pemasangan Aplikasi</h2>

      <div className={"diag-hasil " + (terpasang ? "ok" : "warn")}>
        {terpasang
          ? "✅ Aplikasi sedang berjalan sebagai aplikasi terpasang (tanpa antarmuka browser)."
          : "⚠️ Saat ini berjalan di dalam browser, bukan sebagai aplikasi terpasang."}
      </div>

      <table className="diag-t">
        <tbody>
          <tr><td>Mode tampilan</td><td className={ok(terpasang)}>{d.mode}</td></tr>
          <tr><td>HTTPS</td><td className={ok(d.https)}>{d.https ? "ya" : "tidak"}</td></tr>
          <tr><td>Service worker</td><td className={ok(d.sw.startsWith("aktif"))}>{d.sw}</td></tr>
          <tr><td>Cakupan SW</td><td>{d.swScope}</td></tr>
          <tr><td>Manifest terbaca</td><td className={ok(!!d.mf)}>{d.mf ? "ya" : "gagal: " + d.mfErr}</td></tr>
          {d.mf && <>
            <tr><td>start_url</td><td className={ok(d.mf.start_url === "/")}>{String(d.mf.start_url)}</td></tr>
            <tr><td>scope</td><td className={ok(d.mf.scope === "/")}>{String(d.mf.scope)}</td></tr>
            <tr><td>display</td><td className={ok(d.mf.display === "standalone")}>{String(d.mf.display)}</td></tr>
            <tr><td>id</td><td className={ok(!!d.mf.id)}>{String(d.mf.id || "-")}</td></tr>
            <tr><td>ikon</td><td className={ok((d.mf.icons || []).length >= 3)}>{(d.mf.icons || []).length} berkas</td></tr>
          </>}
        </tbody>
      </table>

      {!mfOk && d.mf && (
        <div className="diag-hasil warn">
          Manifest yang dimuat <b>masih versi lama</b>. Tekan tombol di bawah untuk membersihkan cache,
          lalu muat ulang halaman ini.
        </div>
      )}

      <button className="btn-p diag-btn" onClick={bersihkan}>Bersihkan cache &amp; muat ulang</button>

      <div className="diag-tip">
        <b>Kalau masih tampil bilah alamat:</b>
        <ol>
          <li>Hapus ikon SILAPOR yang lama dari layar utama</li>
          <li>Buka alamat situs langsung di <b>Chrome</b> — bukan dari tautan WhatsApp/Instagram
              (tautan dari aplikasi lain selalu dibuka sebagai Custom Tab yang memang berbilah alamat)</li>
          <li>Menu ⋮ → <b>Install app / Pasang aplikasi</b> (bukan “Tambahkan ke layar utama”)</li>
          <li>Tunggu ±10 detik, lalu buka dari ikon baru</li>
        </ol>
      </div>

      <details className="diag-ua"><summary>Info perangkat</summary><p>{d.ua}</p><p>{d.url}</p></details>
    </div>
  );
}
