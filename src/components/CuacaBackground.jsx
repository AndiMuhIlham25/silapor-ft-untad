import React, { useState, useEffect, useRef } from "react";

const KAMPUS = { lat: -0.8364, lon: 119.8937 }; // UNTAD, Tondo, Palu

// cache lintas-halaman: hindari fetch ulang saat pindah menu (TTL 15 menit)
let cache = { at: 0, scene: null, temp: null };

// Tentukan scene dari CURAH HUJAN NYATA (mm), bukan sekadar weather_code.
// Alasan: kode 51 (gerimis 0,1mm) & 65 (hujan deras) sama-sama "rain",
// padahal 0,1mm praktis tak terasa. Palu juga lembah kering -> model global
// sering melebihkan hujan. Ambang: >=0,5mm baru dianggap hujan.
function mapScene(code, isDay, precip, cloud) {
  const p = Number(precip) || 0;
  const c = Number(cloud) || 0;
  const petir = [95, 96, 99].includes(code);
  if (petir && p >= 2) return "badai";   // petir + hujan deras
  if (p >= 0.5) return "hujan";          // hujan yang benar-benar terasa
  if (!isDay) return "malam";
  if (c >= 65) return "berawan";         // mendung tebal
  return "cerah";
}

const CFG = {
  cerah:   { bg: "linear-gradient(180deg,#4aa3ff,#9ed0ff 70%,#eaf5ff)", label: "Cerah",   mood: "light" },
  berawan: { bg: "linear-gradient(180deg,#8fa8c4,#c3d0de 70%,#eef2f7)", label: "Berawan", mood: "light" },
  hujan:   { bg: "linear-gradient(180deg,#4b5a6e,#6b7a8f 75%,#8b98a9)", label: "Hujan",   mood: "dark" },
  badai:   { bg: "linear-gradient(180deg,#26303f,#3a4658 75%,#4b5a6e)", label: "Badai petir", mood: "dark" },
  malam:   { bg: "linear-gradient(180deg,#0b1030,#1a2350 70%,#2b3670)", label: "Malam", mood: "dark" },
};

export default function CuacaBackground({ onMood }) {
  const fresh = Date.now() - cache.at < 15 * 60 * 1000;
  const [scene, setScene] = useState(fresh && cache.scene ? cache.scene : "cerah");
  const [temp, setTemp] = useState(fresh ? cache.temp : null);
  const cvRef = useRef(null);
  const animRef = useRef(null);

  // ambil lokasi + cuaca
  useEffect(() => {
    let alive = true;
    if (Date.now() - cache.at < 15 * 60 * 1000 && cache.scene) return; // pakai cache
    const fetchCuaca = async (lat, lon) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,precipitation,cloud_cover`;
        const res = await fetch(url);
        const d = await res.json();
        if (!alive || !d.current) return;
        const s = mapScene(d.current.weather_code, d.current.is_day === 1, d.current.precipitation, d.current.cloud_cover);
        const t = Math.round(d.current.temperature_2m);
        cache = { at: Date.now(), scene: s, temp: t };
        setScene(s);
        setTemp(t);
      } catch { /* diamkan: tetap pakai scene default */ }
    };
    const go = (lat, lon) => fetchCuaca(lat, lon);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => go(pos.coords.latitude, pos.coords.longitude),
        () => go(KAMPUS.lat, KAMPUS.lon), // izin ditolak / gagal -> Palu
        { timeout: 8000, maximumAge: 600000 }
      );
    } else {
      go(KAMPUS.lat, KAMPUS.lon);
    }
    const iv = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchCuaca(pos.coords.latitude, pos.coords.longitude),
          () => fetchCuaca(KAMPUS.lat, KAMPUS.lon)
        );
      } else fetchCuaca(KAMPUS.lat, KAMPUS.lon);
    }, 15 * 60 * 1000); // refresh 15 menit
    return () => { alive = false; clearInterval(iv); };
  }, []);

  // beritahu mood (terang/gelap) untuk warna teks hero
  useEffect(() => { onMood && onMood(CFG[scene].mood); }, [scene, onMood]);

  // animasi partikel (hujan / bintang)
  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const x = cv.getContext("2d");
    let W, H, parts = [];
    const size = () => { const r = cv.getBoundingClientRect(); W = cv.width = r.width; H = cv.height = r.height; };
    size(); window.addEventListener("resize", size);
    const stop = () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    stop(); x.clearRect(0, 0, cv.width, cv.height);

    if (scene === "hujan" || scene === "badai") {
      const n = scene === "badai" ? 240 : 150;
      for (let i = 0; i < n; i++) parts.push({ x: Math.random(), y: Math.random(), l: 8 + Math.random() * 10, s: 0.012 + Math.random() * 0.01 });
      const loop = () => {
        x.clearRect(0, 0, W, H); x.strokeStyle = "rgba(190,215,245,.5)"; x.lineWidth = 1.3;
        for (const p of parts) { p.y += p.s; if (p.y > 1) p.y = -0.05; x.beginPath(); x.moveTo(p.x * W, p.y * H); x.lineTo(p.x * W - 3, p.y * H + p.l); x.stroke(); }
        animRef.current = requestAnimationFrame(loop);
      }; loop();
    } else if (scene === "malam") {
      for (let i = 0; i < 70; i++) parts.push({ x: Math.random(), y: Math.random() * 0.75, r: Math.random() * 1.4 + 0.3, t: Math.random() * 6 });
      const loop = () => {
        x.clearRect(0, 0, W, H);
        for (const p of parts) { p.t += 0.04; const a = 0.3 + 0.6 * Math.abs(Math.sin(p.t)); x.beginPath(); x.arc(p.x * W, p.y * H, p.r, 0, 7); x.fillStyle = `rgba(255,255,255,${a.toFixed(2)})`; x.fill(); }
        animRef.current = requestAnimationFrame(loop);
      }; loop();
    }
    return () => { stop(); window.removeEventListener("resize", size); };
  }, [scene]);

  const c = CFG[scene];
  const dark = scene === "hujan" || scene === "badai" || scene === "malam";

  return (
    <div className="cuaca" style={{ background: c.bg }}>
      {scene === "cerah" && <><div className="cu-sun" /><div className="cu-cloud a" /><div className="cu-cloud b" /></>}
      {scene === "berawan" && <><div className="cu-cloud a" /><div className="cu-cloud b" /><div className="cu-cloud a s3" /></>}
      {scene === "malam" && <div className="cu-moon" />}
      {(scene === "hujan" || scene === "badai") && <><div className="cu-cloud a dark" /><div className="cu-cloud b dark" /></>}
      <canvas ref={cvRef} className="cu-canvas" />
      {scene === "badai" && <div className="cu-flash" />}
      <span className={"cu-chip" + (dark ? " on-dark" : "")}>
        {temp != null ? `${temp}°C · ` : ""}{c.label}
      </span>
    </div>
  );
}
