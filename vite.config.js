import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",   // domain root (Netlify). Ubah ke "./" bila dipasang di subfolder.
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "apple-touch-icon.png"],
      manifest: {
        name: "TEKAD — Pengaduan Layanan Akademik FT UNTAD",
        short_name: "TEKAD",
        description:
          "Portal pengaduan pelayanan sistem akademik Fakultas Teknik Universitas Tadulako.",
        lang: "id",
        // WAJIB absolut: nilai relatif (".") sering gagal divalidasi Chrome,
        // akibatnya hanya dibuat pintasan biasa -> terbuka dengan address bar.
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        orientation: "portrait",
        background_color: "#f4f7fb",
        theme_color: "#1d4ed8",
        categories: ["education", "productivity"],
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "Buat Aduan", short_name: "Aduan", url: "/#beranda" },
          { name: "Lacak Aduan", short_name: "Lacak", url: "/#laporan" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            // manifest & registerSW: selalu ambil versi terbaru
            urlPattern: /\/(manifest\.webmanifest|registerSW\.js)$/,
            handler: "NetworkFirst",
            options: { cacheName: "app-manifest", expiration: { maxEntries: 4 } },
          },
          {
            // font Google: cache lama
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // cuaca: pakai cache singkat agar hemat & tetap segar
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "cuaca",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 15 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // JANGAN cache Apps Script: data aduan harus selalu terbaru
        navigateFallbackDenylist: [/^\/api/, /script\.google\.com/, /^\/\.well-known\//],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173 },
});
