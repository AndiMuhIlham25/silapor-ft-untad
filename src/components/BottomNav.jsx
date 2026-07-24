import React from "react";

const IC = {
  beranda: (
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  ),
  layanan: (
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
    </>
  ),
  laporan: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
    </>
  ),
  admin: (
    <>
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
};

const TAB = [
  { id: "beranda", label: "Beranda" },
  { id: "layanan", label: "Layanan" },
  { id: "laporan", label: "Lacak" },
  { id: "admin", label: "Admin" },
];

export default function BottomNav({ view, nav, onLoginAdmin }) {
  return (
    <nav className="bnav" aria-label="Navigasi utama">
      {TAB.map((t) => {
        const aktif = view === t.id;
        return (
          <button
            key={t.id}
            className={"bnav-i" + (aktif ? " on" : "")}
            onClick={() => (t.id === "admin" ? onLoginAdmin() : nav(t.id))}
            aria-current={aktif ? "page" : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                 strokeLinecap="round" strokeLinejoin="round">
              {IC[t.id]}
            </svg>
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
