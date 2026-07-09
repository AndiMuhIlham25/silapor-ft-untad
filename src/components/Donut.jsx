import React from "react";

/* Donut chart SVG murni tanpa library */
export default function Donut({ data, size = 148 }) {
  const r = size / 2 - 13;
  const cx = size / 2;
  const C = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.v, 0) || 1;
  let off = 0;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f1f5f9" strokeWidth="15" />
      {data.map((s, i) => {
        const len = (s.v / total) * C;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="15"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-off}
          />
        );
        off += len;
        return el;
      })}
    </svg>
  );
}
