/* Helper warna badge status & prioritas */
export const statusMeta = (s) =>
  s === "Baru" ? { c: "#1d4ed8", bg: "#eff6ff" } :
  s === "Diproses" ? { c: "#d97706", bg: "#fffbeb" } :
  { c: "#059669", bg: "#ecfdf5" };

export const prioMeta = (p) =>
  p === "Urgent" ? { c: "#dc2626", bg: "#fef2f2" } :
  p === "Sedang" ? { c: "#d97706", bg: "#fff7ed" } :
  { c: "#475569", bg: "#f1f5f9" };
