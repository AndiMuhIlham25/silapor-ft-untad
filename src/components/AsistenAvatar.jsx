import React from "react";

// Karakter asisten original (flat style) — animasi: float, kedip, lambai
export default function AsistenAvatar({ size = 52 }) {
  return (
    <svg className="cb-ava-svg" width={size} height={size} viewBox="0 0 120 132" xmlns="http://www.w3.org/2000/svg">
      <g className="cb-float">
        {/* rambut belakang */}
        <ellipse cx="60" cy="60" rx="35" ry="38" fill="#4a3728" />
        {/* badan / almamater */}
        <path d="M26 132 Q28 94 60 90 Q92 94 94 132 Z" fill="#1e3a8a" />
        {/* kerah + kemeja */}
        <path d="M50 90 L60 104 L70 90 Z" fill="#ffffff" />
        <path d="M50 90 L60 100 L60 132 L48 132 Z" fill="#2748a8" />
        <path d="M70 90 L60 100 L60 132 L72 132 Z" fill="#2748a8" />
        {/* kartu ID (lanyard) */}
        <rect x="55" y="104" width="10" height="13" rx="1.5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.6" />
        <rect x="57" y="107" width="6" height="1.6" rx="0.8" fill="#94a3b8" />
        {/* leher */}
        <rect x="53" y="70" width="14" height="14" rx="4" fill="#f0b58f" />
        {/* kepala */}
        <circle cx="60" cy="48" r="27" fill="#f6c6a4" />
        {/* poni rambut */}
        <path d="M32 50 Q33 19 60 18 Q87 19 88 50 Q82 33 60 34 Q38 33 32 50 Z" fill="#4a3728" />
        <path d="M33 48 Q30 66 34 80 L40 76 Q36 60 39 48 Z" fill="#4a3728" />
        <path d="M87 48 Q90 66 86 80 L80 76 Q84 60 81 48 Z" fill="#4a3728" />
        {/* pipi merona */}
        <circle cx="45" cy="56" r="4.5" fill="#f79ea0" opacity="0.55" />
        <circle cx="75" cy="56" r="4.5" fill="#f79ea0" opacity="0.55" />
        {/* alis */}
        <path d="M43 42 Q49 39 54 42" stroke="#4a3728" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M66 42 Q71 39 77 42" stroke="#4a3728" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {/* mata (kedip) */}
        <g className="cb-eye">
          <ellipse cx="49" cy="50" rx="3.4" ry="4.6" fill="#2b2b2b" />
          <circle cx="50.2" cy="48.4" r="1.1" fill="#fff" />
        </g>
        <g className="cb-eye">
          <ellipse cx="71" cy="50" rx="3.4" ry="4.6" fill="#2b2b2b" />
          <circle cx="72.2" cy="48.4" r="1.1" fill="#fff" />
        </g>
        {/* senyum */}
        <path d="M52 60 Q60 67 68 60" stroke="#b5675a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        {/* tangan melambai */}
        <g className="cb-wave">
          <path d="M84 96 Q99 86 98 66" stroke="#1e3a8a" strokeWidth="9" fill="none" strokeLinecap="round" />
          <circle cx="98" cy="63" r="6.5" fill="#f6c6a4" />
        </g>
      </g>
    </svg>
  );
}
