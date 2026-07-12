// Deteksi nama browser + OS dari user agent (untuk audit log)
export function namaBrowser() {
  const ua = navigator.userAgent || "";
  let b = "Lainnya";
  if (/Edg\//.test(ua)) b = "Edge";
  else if (/OPR\/|Opera/.test(ua)) b = "Opera";
  else if (/Chrome\//.test(ua)) b = "Chrome";
  else if (/Firefox\//.test(ua)) b = "Firefox";
  else if (/Version\/.*Safari/.test(ua)) b = "Safari";

  let os = "";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return os ? `${b} · ${os}` : b;
}
