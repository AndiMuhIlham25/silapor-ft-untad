import { useState, useEffect, useRef } from "react";

/* Animasi angka naik dari nilai sebelumnya ke target */
export default function useCountUp(target, dur = 900) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    let raf, start;
    const from = prev.current;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      setV(from + (target - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
      else prev.current = target;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return Math.round(v);
}
