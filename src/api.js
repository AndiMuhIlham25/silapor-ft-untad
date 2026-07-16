import { APPS_SCRIPT_URL, TOKEN } from "./config.js";

async function post(payload) {
  if (!APPS_SCRIPT_URL) {
    return { ok: false, error: "APPS_SCRIPT_URL belum diatur di src/config.js" };
  }
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export const apiLogin = (username, password, ua) => post({ action: "login", username, password, ua });
export const apiList = (token) => post({ action: "list", token });
export const apiPublic = () => post({ action: "public", token: TOKEN });
export const apiSubmit = (payload) => post({ action: "submit", token: TOKEN, ...payload });
export const apiUpdateStatus = (token, item, status) =>
  post({ action: "updateStatus", token, ssId: item.ssId, sheet: item.sheet, row: item.row, status });
export const apiNote = (token, item, catatan) =>
  post({ action: "note", token, ssId: item.ssId, sheet: item.sheet, row: item.row, catatan });

export const apiProfile = (token, p) =>
  post({ action: "profile", token, nama: p.nama, email: p.email, nip: p.nip, telp: p.telp });
export const apiChangePassword = (token, oldPassword, newPassword) =>
  post({ action: "changePassword", token, oldPassword, newPassword });
export const apiAdminList = (token) => post({ action: "adminList", token });
export const apiAdminSave = (token, admin) => post({ action: "adminSave", token, ...admin });
export const apiAdminDelete = (token, username) => post({ action: "adminDelete", token, username });

export const apiArchiveMonths = (token) => post({ action: "arsipBulan", token });
export const apiArchiveData = (token, bulan) => post({ action: "arsipData", token, bulan });

export const apiLogout = (token) => post({ action: "logout", token });

export const apiLogList = (token) => post({ action: "logList", token });

export const apiLampiran = (token, item) =>
  post({ action: "lampiran", token, ssId: item.ssId, sheet: item.sheet, row: item.row });

export const apiCekNim = (nim) => post({ action: "cekNim", token: TOKEN, nim });

export const apiEditPublik = (payload) => post({ action: "editPublik", token: TOKEN, ...payload });
