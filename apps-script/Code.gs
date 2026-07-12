/* =========================================================================
   SILAPOR FT — Router Aduan + Manajemen Admin (Google Apps Script)
   Data admin disimpan di spreadsheet khusus (tab "Admins") agar bisa
   diedit sendiri oleh admin & dikelola oleh Super Admin.

   LANGKAH AWAL:
   1. Buat 1 spreadsheet khusus admin, tempel link-nya di ADMIN_SHEET.
   2. Jalankan setupAdmins() SEKALI di editor untuk mengisi admin awal.
   3. Isi AREA_SHEET dengan link spreadsheet aduan tiap area.
   4. Deploy Web app, tempel URL /exec ke src/config.js.
   =========================================================================*/

const TOKEN = "silapor-ft-2026";
const SALT  = "qAuCUPAitDjruaqnKOwMf2Se1Nc-9THW";
const SESSION_HOURS = 8;

const ADMIN_SHEET = "TEMPEL_LINK_SPREADSHEET_ADMIN"; // WAJIB spreadsheet TERPISAH dari aduan (jangan sama dgn ADUAN_LINK)
const ADMIN_TAB = "Admins";
const LOG_TAB = "Log";
const ARSIP_SHEET = "TEMPEL_LINK_SPREADSHEET_ARSIP"; // spreadsheet arsip TERPISAH (opsional, utk auto-arsip bulanan)

/* ---- AREA -> LINK/ID SPREADSHEET aduan (boleh link penuh atau ID) ---- */
const ADUAN_LINK = "https://docs.google.com/spreadsheets/d/1P-CNlo5ZifJ12hTwuB1lEwPzsmD9i8-e4tuagZVIEes/edit?usp=sharing";
const AREA_SHEET = {
  // Semua area pakai 1 spreadsheet; yang membedakan adalah TAB (per prodi/area).
  // Mau pisah sebagian? ganti nilainya dengan link lain (boleh sebagian saja).
  sipil_s1: ADUAN_LINK, arsitektur_s1: ADUAN_LINK, elektro_s1: ADUAN_LINK, mesin_s1: ADUAN_LINK,
  informatika_s1: ADUAN_LINK, geologi_s1: ADUAN_LINK, pwk_s1: ADUAN_LINK, lingkungan_s1: ADUAN_LINK,
  si_s1: ADUAN_LINK, trjj_d4: ADUAN_LINK, trm_d4: ADUAN_LINK, trl_d4: ADUAN_LINK,
  sipil_s2: ADUAN_LINK, ti_s2: ADUAN_LINK, arsitektur_s2: ADUAN_LINK,
  persuratan: ADUAN_LINK, operator: ADUAN_LINK, umum: ADUAN_LINK,
};
const ALL_AREAS = ["sipil_s1","arsitektur_s1","elektro_s1","mesin_s1","informatika_s1","geologi_s1","pwk_s1","lingkungan_s1","si_s1","trjj_d4","trm_d4","trl_d4","sipil_s2","ti_s2","arsitektur_s2","persuratan","operator","umum"];

const PRODI_AREA = {
  "Teknik Sipil (S1)": "sipil_s1",
  "Teknik Arsitektur (S1)": "arsitektur_s1",
  "Teknik Elektro (S1)": "elektro_s1",
  "Teknik Mesin (S1)": "mesin_s1",
  "Teknik Informatika (S1)": "informatika_s1",
  "Teknik Geologi (S1)": "geologi_s1",
  "Perencanaan Wilayah & Kota (S1)": "pwk_s1",
  "Teknik Lingkungan (S1)": "lingkungan_s1",
  "Sistem Informasi (S1)": "si_s1",
  "Teknik Rekayasa Jalan dan Jembatan (D4)": "trjj_d4",
  "Teknik Rekayasa Manufaktur (D4)": "trm_d4",
  "Teknik Rekayasa Listrik (D4)": "trl_d4",
  "Teknik Sipil (S2)": "sipil_s2",
  "Teknologi Informasi (S2)": "ti_s2",
  "Arsitektur (S2)": "arsitektur_s2",
};
const KATEGORI_FUNGSIONAL = { "Persuratan": "persuratan" };

/* Validasi server-side: peran & kombinasi peran-kategori (anti-bypass) */
const VALID_ROLES = ["Mahasiswa","Dosen","Operator Prodi/Jurusan"];
const VALID_PRIORITAS = ["Rendah","Sedang","Urgent"];
const KATEGORI_ROLE = {
  "SIGA-8":         ["Mahasiswa","Dosen","Operator Prodi/Jurusan"],
  "Nilai":          ["Mahasiswa","Dosen"],
  "Jadwal & KRS":   ["Mahasiswa","Operator Prodi/Jurusan"],
  "Akses Akun":     ["Mahasiswa","Dosen","Operator Prodi/Jurusan"],
  "Data Mahasiswa": ["Mahasiswa","Operator Prodi/Jurusan"],
  "Persuratan":     ["Mahasiswa","Operator Prodi/Jurusan"],
  "Lainnya":        ["Mahasiswa","Dosen","Operator Prodi/Jurusan"],
};

/* ================= util ================= */
function json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function sha256(s){
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s + SALT, Utilities.Charset.UTF_8);
  return raw.map(function(b){ return ("0"+(b & 0xff).toString(16)).slice(-2); }).join("");
}
function makeHash(pw){ const h = sha256(pw); Logger.log(h); return h; }
function safeCell(v){ var s=String(v==null?"":v); return /^[=+\-@\t\r]/.test(s) ? ("'"+s) : s; }
function genTicket(){
  var ymd = Utilities.formatDate(new Date(), "Asia/Makassar", "yyMMdd");
  return "ADU-" + ymd + "-" + Math.floor(1000 + Math.random()*9000);
}
function isFormOpen(){
  var d=new Date();
  var day=Number(Utilities.formatDate(d,"Asia/Makassar","u")); // 1=Sen..7=Min
  var mins=Number(Utilities.formatDate(d,"Asia/Makassar","HH"))*60+Number(Utilities.formatDate(d,"Asia/Makassar","mm"));
  if(day>=1 && day<=4) return mins>=480 && mins<960;   // Sen-Kam 08.00-16.00
  if(day===5)          return mins>=480 && mins<990;   // Jum 08.00-16.30
  return false;                                         // Sab-Min tutup
}
function extractId(v){ if(!v) return ""; var m=String(v).match(/\/d\/([a-zA-Z0-9_-]+)/); return m?m[1]:String(v); }
function isUnset(v){ return !v || String(v).indexOf("TEMPEL_")===0 || String(v).indexOf("ISI_")===0; }
function pickArea(prodi, kategori){ if(KATEGORI_FUNGSIONAL[kategori]) return KATEGORI_FUNGSIONAL[kategori]; return PRODI_AREA[prodi] || "umum"; }
const HEADER = ["Waktu","Nama","NIM/NIP","Prodi","Peran","Kategori","Prioritas","Deskripsi","Status","Catatan","ID Aduan"];

/* Nama tab per area (1 tab per prodi/area). tabOf() menyaring karakter ilegal. */
const AREA_TAB = {
  sipil_s1:"Teknik Sipil (S1)", arsitektur_s1:"Teknik Arsitektur (S1)", elektro_s1:"Teknik Elektro (S1)",
  mesin_s1:"Teknik Mesin (S1)", informatika_s1:"Teknik Informatika (S1)", geologi_s1:"Teknik Geologi (S1)",
  pwk_s1:"Perencanaan Wilayah & Kota (S1)", lingkungan_s1:"Teknik Lingkungan (S1)", si_s1:"Sistem Informasi (S1)",
  trjj_d4:"Rekayasa Jalan & Jembatan (D4)", trm_d4:"Rekayasa Manufaktur (D4)", trl_d4:"Rekayasa Listrik (D4)",
  sipil_s2:"Teknik Sipil (S2)", ti_s2:"Teknologi Informasi (S2)", arsitektur_s2:"Arsitektur (S2)",
  persuratan:"Persuratan", operator:"Operator SIGA-8", umum:"Umum",
};
function tabOf(area){ return String(AREA_TAB[area]||area).replace(/[\\\/\?\*\[\]:]/g,"-").slice(0,90); }
function adminForArea(area){
  var admins; try{ admins=getAdmins(); }catch(e){ return "umum"; }
  for(var i=0;i<admins.length;i++){ if(admins[i].role!=="super" && admins[i].areas.indexOf(area)>=0) return admins[i].username; }
  for(var j=0;j<admins.length;j++){ if(admins[j].role!=="super" && admins[j].areas.indexOf("umum")>=0) return admins[j].username; }
  return "umum";
}
function currentAreas(s){ if(s.role==="super") return ALL_AREAS; var a=findAdmin(s.u); return a?a.areas:(s.areas||[]); }

function maskName(v){ var s=String(v||"").trim(); if(!s) return "-"; var p=s.split(/\s+/); return p.length===1?p[0]:p[0]+" "+p[1].charAt(0).toUpperCase()+"."; }
function allSheetIds(){ var seen={}, ids=[]; for(var k in AREA_SHEET){ var raw=AREA_SHEET[k]; if(isUnset(raw)) continue; var id=extractId(raw); if(!seen[id]){seen[id]=true; ids.push(id);} } return ids; }
function idsForAreas(areas){ var seen={}, ids=[]; for(var i=0;i<areas.length;i++){ var raw=AREA_SHEET[areas[i]]; if(isUnset(raw)) continue; var id=extractId(raw); if(!seen[id]){seen[id]=true; ids.push(id);} } return ids; }
function linksForAreas(areas){
  var byId={}; for(var i=0;i<areas.length;i++){ var raw=AREA_SHEET[areas[i]]; if(isUnset(raw)) continue; var id=extractId(raw); (byId[id]=byId[id]||[]).push(areas[i]); }
  return Object.keys(byId).map(function(id){ return { url:"https://docs.google.com/spreadsheets/d/"+id+"/edit", areas:byId[id] }; });
}

/* ================= data admin (sheet) ================= */
const ADMIN_HEADER = ["username","nama","email","nip","telp","jabatan","role","areas","passHash"];
function adminSheet(){ return SpreadsheetApp.openById(extractId(ADMIN_SHEET)).getSheetByName(ADMIN_TAB); }
function getAdmins(){
  var sh=adminSheet(); if(!sh) return [];
  var d=sh.getDataRange().getValues(), out=[];
  for(var i=1;i<d.length;i++){ var r=d[i]; if(!r[0]) continue;
    out.push({ row:i+1, username:String(r[0]).trim(), nama:r[1], email:r[2], nip:r[3], telp:r[4], jabatan:r[5],
      role:(r[6]||"admin"), areas:String(r[7]||"").split(",").map(function(s){return s.trim();}).filter(Boolean), passHash:r[8] });
  }
  return out;
}
function findAdmin(u){ var a=getAdmins(); for(var i=0;i<a.length;i++) if(a[i].username===u) return a[i]; return null; }
function adminRowValues(o){ return [o.username,o.nama,o.email,o.nip,o.telp,o.jabatan,o.role,(o.areas||[]).join(","),o.passHash]; }
function writeAdminRow(row,o){ adminSheet().getRange(row,1,1,ADMIN_HEADER.length).setValues([adminRowValues(o)]); }
function profileOf(a){ return {username:a.username, nama:a.nama, email:a.email, nip:a.nip, telp:a.telp, jabatan:a.jabatan, role:a.role, areas:a.areas}; }

/* Jalankan SEKALI untuk membuat tab Admins + admin awal (ganti password nanti). */
function setupAdmins(){
  if(isUnset(ADMIN_SHEET)) throw new Error("Isi ADMIN_SHEET dulu dengan link spreadsheet KHUSUS admin (file terpisah dari aduan).");
  if(allSheetIds().indexOf(extractId(ADMIN_SHEET))>=0) throw new Error("ADMIN_SHEET tidak boleh sama dengan spreadsheet aduan (ADUAN_LINK). Buat file baru khusus admin.");
  var ss=SpreadsheetApp.openById(extractId(ADMIN_SHEET));
  var sh=ss.getSheetByName(ADMIN_TAB) || ss.insertSheet(ADMIN_TAB);
  sh.clear(); sh.appendRow(ADMIN_HEADER); sh.getRange(1,1,1,ADMIN_HEADER.length).setFontWeight("bold"); sh.setFrozenRows(1);
  var rows=[
    ["superadmin","Super Admin","","","","Super Admin","super","", sha256("YrN7epizH%myh3V8")],
    ["admin1","Admin Sipil, Geologi & Lingkungan","","","","Admin Prodi","admin","sipil_s1,sipil_s2,trjj_d4,geologi_s1,lingkungan_s1", sha256("pNTPX@FUWjMq4yff")],
    ["admin2","Admin Arsitektur & PWK","","","","Admin Prodi","admin","arsitektur_s1,arsitektur_s2,pwk_s1", sha256("kE$h67sYXPsU4HWP")],
    ["admin3","Admin Mesin & Elektro","","","","Admin Prodi","admin","mesin_s1,trm_d4,elektro_s1,trl_d4", sha256("%ydm99%UqHMU6U9w")],
    ["admin4","Admin IT & Persuratan","","","","Admin Prodi + Fungsional","admin","informatika_s1,ti_s2,si_s1,persuratan,operator", sha256("B*s#xh3%SS78S4Ju")],
    ["admin5","Admin Umum","","","","Fungsional","admin","umum", sha256("ppt*aPnRyANi*5tV")],
  ];
  sh.getRange(2,1,rows.length,ADMIN_HEADER.length).setValues(rows);
  return "OK: "+rows.length+" admin dibuat";
}

/* Jalankan untuk memastikan konfigurasi benar (lihat Execution log). */
function checkSetup(){
  var adminId=extractId(ADMIN_SHEET);
  var terpisah = allSheetIds().indexOf(adminId) < 0;
  var hasTab=false, jml=0;
  try{ hasTab = !!adminSheet(); if(hasTab) jml=getAdmins().length; }catch(e){}
  var msg = "ADMIN_SHEET terpisah dari aduan: "+terpisah+" | Tab Admins ada: "+hasTab+" | Jumlah admin: "+jml;
  Logger.log(msg); return msg;
}

/* ================= session ================= */
function newSession(username, role, areas){
  var token=Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty("sess_"+token, JSON.stringify({ u:username, role:role, areas:areas, exp:Date.now()+SESSION_HOURS*3600*1000 }));
  return token;
}
function getSession(token){
  if(!token) return null;
  var raw=PropertiesService.getScriptProperties().getProperty("sess_"+token);
  if(!raw) return null;
  var s=JSON.parse(raw);
  if(Date.now()>s.exp){ PropertiesService.getScriptProperties().deleteProperty("sess_"+token); return null; }
  return s;
}
function areasOf(s){ return s.role==="super" ? ALL_AREAS : (s.areas||[]); }
function canEditTab(s, ssId, tab){
  if(s.role==="super") return true;
  return tab===s.u;
}

/* ================= entry ================= */
function doPost(e){
  try {
    var b=JSON.parse(e.postData.contents||"{}");
    var a=b.action||"submit";
    if(a==="submit")        return handleSubmit(b);
    if(a==="public")        return handlePublic(b);
    if(a==="login")         return handleLogin(b);
    if(a==="list")          return handleList(b);
    if(a==="updateStatus")  return handleUpdate(b);
    if(a==="note")          return handleNote(b);
    if(a==="profile")       return handleProfile(b);
    if(a==="changePassword")return handleChangePassword(b);
    if(a==="logout")        return handleLogout(b);
    if(a==="logList")       return handleLogList(b);
    if(a==="adminList")     return handleAdminList(b);
    if(a==="adminSave")     return handleAdminSave(b);
    if(a==="adminDelete")   return handleAdminDelete(b);
    if(a==="arsipBulan")    return handleArchiveMonths(b);
    if(a==="arsipData")     return handleArchiveData(b);
    return json({ ok:false, error:"Aksi tidak dikenal" });
  } catch(err){ return json({ ok:false, error:String(err) }); }
}
function saltFp(){ return sha256("__fp__").slice(0,8); }
function doGet(){ return json({ ok:true, service:"SILAPOR FT router", fp: saltFp() }); }

/* Diagnosa login — Run di editor, lihat Execution log */
function diag(){
  var out=[];
  out.push("SALT fingerprint (fp): "+saltFp());
  out.push("ADMIN_SHEET unset: "+isUnset(ADMIN_SHEET));
  var terpisah=true; try{ terpisah=allSheetIds().indexOf(extractId(ADMIN_SHEET))<0; }catch(e){}
  out.push("ADMIN_SHEET terpisah dari aduan: "+terpisah);
  var a=null; try{ a=findAdmin("superadmin"); }catch(e){ out.push("ERROR baca Admins: "+e); }
  out.push("superadmin ditemukan: "+(!!a));
  if(a){
    var calc=sha256("YrN7epizH%myh3V8");
    out.push("hash tersimpan : "+a.passHash);
    out.push("hash seharusnya: "+calc);
    out.push("COCOK: "+(a.passHash===calc));
  }
  var msg=out.join("\n"); Logger.log(msg); return msg;
}

/* ---- publik: kirim aduan ---- */
function handleSubmit(b){
  if(b.token!==TOKEN) return json({ok:false,error:"Token tidak valid"});
  if(b.hp && String(b.hp).trim()!=="") return json({ok:true, ticket:"-"}); // honeypot: bot terdeteksi, buang diam-diam
  if(!isFormOpen()) return json({ok:false, error:"Form aduan tutup. Jam layanan: Senin-Kamis 08.00-16.00, Jumat 08.00-16.30 (WITA)."});
  var req=["nama","identitas","prodi","kategori","deskripsi"];
  for(var i=0;i<req.length;i++){ var f=req[i]; if(!b[f]||String(b[f]).trim()==="") return json({ok:false,error:"Field wajib kosong: "+f}); }
  if(String(b.deskripsi).trim().length<10) return json({ok:false,error:"Deskripsi terlalu pendek"});
  // --- validasi peran, kategori, prodi (server-side) ---
  if(VALID_ROLES.indexOf(b.role)<0) return json({ok:false,error:"Peran tidak valid"});
  if(!KATEGORI_ROLE[b.kategori]) return json({ok:false,error:"Kategori tidak dikenal"});
  if(KATEGORI_ROLE[b.kategori].indexOf(b.role)<0) return json({ok:false,error:"Kombinasi peran & kategori tidak sesuai"});
  if(!PRODI_AREA[b.prodi]) return json({ok:false,error:"Program studi tidak dikenal"});
  if(VALID_PRIORITAS.indexOf(b.prioritas)<0) b.prioritas="Sedang";
  // --- batasi panjang input (anti pembengkakan/spam) ---
  if(String(b.deskripsi).length>5000) return json({ok:false,error:"Deskripsi terlalu panjang (maks 5000 karakter)"});
  b.nama=String(b.nama).slice(0,100);
  b.identitas=String(b.identitas).slice(0,40);
  var area=pickArea(b.prodi,b.kategori), raw=AREA_SHEET[area];
  if(isUnset(raw)) return json({ok:false,error:"Spreadsheet area '"+area+"' belum diatur"});
  var ss=SpreadsheetApp.openById(extractId(raw));
  var tab=adminForArea(area); // 1 tab per admin
  var sh=ss.getSheetByName(tab);
  if(!sh){ sh=ss.insertSheet(tab); sh.appendRow(HEADER); sh.getRange(1,1,1,HEADER.length).setFontWeight("bold"); sh.setFrozenRows(1); }
  var kode=genTicket();
  sh.appendRow([ new Date(), safeCell(b.nama), safeCell(b.identitas), b.prodi, b.role||"-", b.kategori, b.prioritas||"-", safeCell(b.deskripsi), "Baru", "", kode ]);
  return json({ ok:true, area:area, tab:tab, ticket:kode });
}

/* ---- publik: monitoring (identitas disamarkan) ---- */
function handlePublic(b){
  if(b.token!==TOKEN) return json({ok:false,error:"Token tidak valid"});
  var now=new Date();
  var curY=Number(Utilities.formatDate(now,"Asia/Makassar","yyyy"));
  var curM=Number(Utilities.formatDate(now,"Asia/Makassar","MM"));
  var ids=allSheetIds(), rows=[];
  for(var n=0;n<ids.length;n++){ var ss; try{ ss=SpreadsheetApp.openById(ids[n]); }catch(e){ continue; }
    var sheets=ss.getSheets();
    for(var j=0;j<sheets.length;j++){ var sh=sheets[j]; if(sh.getName()===ADMIN_TAB) continue; var d=sh.getDataRange().getValues(); if(!d.length||d[0][0]!=="Waktu") continue;
      for(var i=1;i<d.length;i++){ var r=d[i]; if(!r[1]) continue;
        var w=r[0]; var wd=(w instanceof Date)?w:new Date(w);
        if(!isNaN(wd)){ var wy=Number(Utilities.formatDate(wd,"Asia/Makassar","yyyy")), wm=Number(Utilities.formatDate(wd,"Asia/Makassar","MM")); if(wy!==curY||wm!==curM) continue; }
        rows.push({ kode:r[10]||"-", nama:maskName(r[1]), prodi:r[3], kategori:r[5], prioritas:r[6], status:r[8]||"Baru", catatan:r[9]||"", waktu:r[0] });
      } } }
  rows.sort(function(x,y){ return new Date(y.waktu)-new Date(x.waktu); });
  return json({ok:true, rows:rows});
}

/* ---- anti brute-force login ---- */
function loginGate(u){
  var raw=PropertiesService.getScriptProperties().getProperty("lf_"+u);
  if(!raw) return {locked:false};
  var o=JSON.parse(raw);
  if(o.until && Date.now()<o.until) return {locked:true, mins:Math.ceil((o.until-Date.now())/60000)};
  return {locked:false};
}
function loginFail(u){
  var props=PropertiesService.getScriptProperties();
  var raw=props.getProperty("lf_"+u); var o=raw?JSON.parse(raw):{count:0};
  o.count=(o.count||0)+1;
  if(o.count>=5){ o.until=Date.now()+15*60*1000; o.count=0; }
  props.setProperty("lf_"+u, JSON.stringify(o));
}
function loginReset(u){ PropertiesService.getScriptProperties().deleteProperty("lf_"+u); }

/* ---- admin: login ---- */
function handleLogin(b){
  var uname=String(b.username||"");
  var g=loginGate(uname);
  if(g.locked) return json({ok:false,error:"Terlalu banyak percobaan gagal. Coba lagi dalam "+g.mins+" menit."});
  if(isUnset(ADMIN_SHEET)) return json({ok:false,error:"ADMIN_SHEET belum diatur di Code.gs"});
  var sh; try { sh=adminSheet(); } catch(e){ return json({ok:false,error:"ADMIN_SHEET tidak valid / belum di-share ke akunmu"}); }
  if(!sh) return json({ok:false,error:"Tab 'Admins' belum ada — jalankan setupAdmins() dulu"});
  var a=findAdmin(uname);
  if(!a || a.passHash!==sha256(b.password||"")){ loginFail(uname); return json({ok:false,error:"Username atau password salah"}); }
  loginReset(uname);
  logAksi(a.username, a.role, "Login", "");
  var token=newSession(a.username, a.role, a.areas);
  return json({ ok:true, token:token, admin:profileOf(a), sheetLinks: linksForAreas(areasOf({role:a.role,areas:a.areas})) });
}

/* ---- admin: daftar aduan area yg dipegang (super = semua) ---- */
function handleList(b){
  var s=getSession(b.token); if(!s) return json({ok:false,error:"Sesi berakhir, login ulang"});
  var ids=allSheetIds(), rows=[];
  for(var n=0;n<ids.length;n++){
    var ss; try{ ss=SpreadsheetApp.openById(ids[n]); }catch(e){ continue; }
    var sheets = s.role==="super" ? ss.getSheets() : (ss.getSheetByName(s.u) ? [ss.getSheetByName(s.u)] : []);
    for(var j=0;j<sheets.length;j++){ var sh=sheets[j]; if(sh.getName()===ADMIN_TAB) continue; var d=sh.getDataRange().getValues(); if(!d.length||d[0][0]!=="Waktu") continue;
      for(var i=1;i<d.length;i++){ var r=d[i]; if(!r[1]) continue;
        rows.push({ ssId:ids[n], sheet:sh.getName(), row:i+1, kode:r[10]||"-", waktu:r[0], nama:r[1], identitas:r[2],
          prodi:r[3], role:r[4], kategori:r[5], prioritas:r[6], deskripsi:r[7], status:r[8]||"Baru", catatan:r[9]||"" });
      } }
  }
  rows.sort(function(x,y){ return new Date(y.waktu)-new Date(x.waktu); });
  return json({ok:true, rows:rows, sheetLinks: linksForAreas(currentAreas(s))});
}

function handleUpdate(b){
  var s=getSession(b.token); if(!s) return json({ok:false,error:"Sesi berakhir, login ulang"});
  if(!canEditTab(s,b.ssId,b.sheet)) return json({ok:false,error:"Tidak berhak mengubah data ini"});
  var sh=SpreadsheetApp.openById(extractId(b.ssId)).getSheetByName(b.sheet);
  if(!sh) return json({ok:false,error:"Tab tidak ditemukan"});
  sh.getRange(b.row,9).setValue(b.status);
  logAksi(s.u, s.role, "Ubah status", b.sheet+" baris "+b.row+" -> "+b.status);
  return json({ok:true});
}
function handleNote(b){
  var s=getSession(b.token); if(!s) return json({ok:false,error:"Sesi berakhir, login ulang"});
  if(!canEditTab(s,b.ssId,b.sheet)) return json({ok:false,error:"Tidak berhak mengubah data ini"});
  var sh=SpreadsheetApp.openById(extractId(b.ssId)).getSheetByName(b.sheet);
  if(!sh) return json({ok:false,error:"Tab tidak ditemukan"});
  sh.getRange(b.row,10).setValue(safeCell(b.catatan||""));
  logAksi(s.u, s.role, "Catatan", b.sheet+" baris "+b.row);
  return json({ok:true});
}

/* ---- audit log ---- */
const LOG_HEADER = ["Waktu","Aktor","Role","Aksi","Detail"];
function logAksi(actor, role, aksi, detail){
  try{
    if(isUnset(ADMIN_SHEET)) return;
    var ss=SpreadsheetApp.openById(extractId(ADMIN_SHEET));
    var sh=ss.getSheetByName(LOG_TAB);
    if(!sh){ sh=ss.insertSheet(LOG_TAB); sh.appendRow(LOG_HEADER); sh.getRange(1,1,1,LOG_HEADER.length).setFontWeight("bold"); sh.setFrozenRows(1); }
    sh.appendRow([ new Date(), actor||"-", role||"-", aksi||"-", safeCell(String(detail||"")) ]);
  }catch(e){}
}
function handleLogList(b){
  var g=requireSuper(b); if(g.err) return json({ok:false,error:g.err});
  if(isUnset(ADMIN_SHEET)) return json({ok:true, rows:[]});
  var ss; try{ ss=SpreadsheetApp.openById(extractId(ADMIN_SHEET)); }catch(e){ return json({ok:true, rows:[]}); }
  var sh=ss.getSheetByName(LOG_TAB); if(!sh) return json({ok:true, rows:[]});
  var d=sh.getDataRange().getValues(), rows=[];
  for(var i=1;i<d.length;i++){ var r=d[i]; if(!r[0]) continue;
    rows.push({ waktu:(r[0] instanceof Date)?Utilities.formatDate(r[0],"Asia/Makassar","yyyy-MM-dd HH:mm:ss"):String(r[0]), aktor:r[1], role:r[2], aksi:r[3], detail:r[4] });
  }
  rows.reverse(); if(rows.length>200) rows=rows.slice(0,200);
  return json({ok:true, rows:rows});
}

/* ---- logout: hapus sesi di server ---- */
function handleLogout(b){ if(b.token) PropertiesService.getScriptProperties().deleteProperty("sess_"+b.token); return json({ok:true}); }

/* ---- admin: edit profil sendiri ---- */
function handleProfile(b){
  var s=getSession(b.token); if(!s) return json({ok:false,error:"Sesi berakhir, login ulang"});
  var a=findAdmin(s.u); if(!a) return json({ok:false,error:"Admin tidak ditemukan"});
  a.nama=b.nama||a.nama; a.email=b.email||""; a.nip=b.nip||""; a.telp=b.telp||"";
  writeAdminRow(a.row,a);
  return json({ok:true, admin:profileOf(a)});
}
/* ---- admin: ganti password sendiri ---- */
function handleChangePassword(b){
  var s=getSession(b.token); if(!s) return json({ok:false,error:"Sesi berakhir, login ulang"});
  var a=findAdmin(s.u); if(!a) return json({ok:false,error:"Admin tidak ditemukan"});
  if(a.passHash!==sha256(b.oldPassword||"")) return json({ok:false,error:"Password lama salah"});
  if(String(b.newPassword||"").length<6) return json({ok:false,error:"Password baru minimal 6 karakter"});
  a.passHash=sha256(b.newPassword); writeAdminRow(a.row,a);
  logAksi(s.u, s.role, "Ganti password", "");
  return json({ok:true});
}

/* ================= Super Admin: kelola admin ================= */
function requireSuper(b){ var s=getSession(b.token); if(!s) return {err:"Sesi berakhir, login ulang"}; if(s.role!=="super") return {err:"Khusus Super Admin"}; return {s:s}; }

function handleAdminList(b){
  var g=requireSuper(b); if(g.err) return json({ok:false,error:g.err});
  var list=getAdmins().map(function(a){ return { username:a.username, nama:a.nama, email:a.email, nip:a.nip, telp:a.telp, jabatan:a.jabatan, role:a.role, areas:a.areas }; });
  return json({ok:true, admins:list, allAreas:ALL_AREAS});
}
function handleAdminSave(b){
  var g=requireSuper(b); if(g.err) return json({ok:false,error:g.err});
  var uname=String(b.username||"").trim();
  if(!uname) return json({ok:false,error:"Username wajib"});
  var ex=findAdmin(uname);
  var obj={ username:uname, nama:b.nama||"", email:b.email||"", nip:b.nip||"", telp:b.telp||"",
    jabatan:b.jabatan||"", role:(b.role==="super"?"super":"admin"), areas:b.areas||[], passHash: ex?ex.passHash:"" };
  if(b.password){ if(String(b.password).length<6) return json({ok:false,error:"Password minimal 6 karakter"}); obj.passHash=sha256(b.password); }
  if(!ex && !obj.passHash) return json({ok:false,error:"Admin baru wajib diberi password"});
  if(ex) writeAdminRow(ex.row,obj);
  else adminSheet().appendRow(adminRowValues(obj));
  logAksi(g.s.u, "super", ex?"Edit admin":"Tambah admin", uname);
  return json({ok:true});
}
function handleAdminDelete(b){
  var g=requireSuper(b); if(g.err) return json({ok:false,error:g.err});
  var a=findAdmin(String(b.username||"").trim());
  if(!a) return json({ok:false,error:"Admin tidak ditemukan"});
  if(a.username===g.s.u) return json({ok:false,error:"Tidak bisa menghapus akun sendiri"});
  var supers=getAdmins().filter(function(x){return x.role==="super";});
  if(a.role==="super" && supers.length<=1) return json({ok:false,error:"Minimal harus ada 1 Super Admin"});
  adminSheet().deleteRow(a.row);
  logAksi(g.s.u, "super", "Hapus admin", a.username);
  return json({ok:true});
}


/* ===================== ARSIP OTOMATIS BULANAN =====================
   Memindahkan aduan bulan-bulan LAMA dari tab aktif ke spreadsheet arsip,
   agar tab aktif tetap ramping (query admin cepat).
   - previewArsip()      : lihat berapa yang AKAN diarsip (tanpa memindah apa pun)
   - arsipkanBulanLalu() : pindahkan aduan sebelum bulan berjalan ke arsip
   - pasangTriggerArsip(): jalankan otomatis tiap tanggal 1
   - hapusTriggerArsip() : matikan otomatisasi
   ================================================================= */
function pad2(n){ return (n<10?"0":"")+n; }

function previewArsip(){
  var now=new Date();
  var curY=Number(Utilities.formatDate(now,"Asia/Makassar","yyyy"));
  var curM=Number(Utilities.formatDate(now,"Asia/Makassar","MM"));
  var ids=allSheetIds(), out=[], total=0;
  for(var n=0;n<ids.length;n++){
    var ss; try{ ss=SpreadsheetApp.openById(ids[n]); }catch(e){ continue; }
    var sheets=ss.getSheets();
    for(var j=0;j<sheets.length;j++){
      var sh=sheets[j]; if(sh.getName()===ADMIN_TAB) continue;
      var d=sh.getDataRange().getValues(); if(!d.length||d[0][0]!=="Waktu") continue;
      var c=0;
      for(var i=1;i<d.length;i++){ var r=d[i]; if(!r[1]) continue; var w=r[0]; var wd=(w instanceof Date)?w:new Date(w); if(isNaN(wd)) continue;
        var wy=Number(Utilities.formatDate(wd,"Asia/Makassar","yyyy")), wm=Number(Utilities.formatDate(wd,"Asia/Makassar","MM"));
        if(wy<curY||(wy===curY&&wm<curM)) c++;
      }
      if(c>0){ out.push("Tab '"+sh.getName()+"': "+c+" aduan akan diarsip"); total+=c; }
    }
  }
  var msg = total===0 ? "Tidak ada aduan bulan lalu. Semua masih bulan berjalan — tab sudah ramping."
                      : (out.join("\n")+"\n---------------------------------\nTOTAL: "+total+" aduan akan dipindah ke arsip.");
  Logger.log(msg); return msg;
}

function arsipkanBulanLalu(){
  if(isUnset(ARSIP_SHEET)) throw new Error("Isi ARSIP_SHEET dulu dengan link spreadsheet arsip (file terpisah).");
  if(allSheetIds().indexOf(extractId(ARSIP_SHEET))>=0) throw new Error("ARSIP_SHEET tidak boleh sama dengan spreadsheet aduan aktif.");
  var arsipSS=SpreadsheetApp.openById(extractId(ARSIP_SHEET));
  var now=new Date();
  var curY=Number(Utilities.formatDate(now,"Asia/Makassar","yyyy"));
  var curM=Number(Utilities.formatDate(now,"Asia/Makassar","MM"));
  var ARS_HEADER=HEADER.concat(["Admin Asal"]);
  var ids=allSheetIds(), total=0;
  for(var n=0;n<ids.length;n++){
    var ss; try{ ss=SpreadsheetApp.openById(ids[n]); }catch(e){ continue; }
    var sheets=ss.getSheets();
    for(var j=0;j<sheets.length;j++){
      var sh=sheets[j]; if(sh.getName()===ADMIN_TAB) continue;
      var d=sh.getDataRange().getValues(); if(!d.length||d[0][0]!=="Waktu") continue;
      var byMonth={}, delRows=[];
      for(var i=1;i<d.length;i++){ var r=d[i]; if(!r[1]) continue; var w=r[0]; var wd=(w instanceof Date)?w:new Date(w); if(isNaN(wd)) continue;
        var wy=Number(Utilities.formatDate(wd,"Asia/Makassar","yyyy")), wm=Number(Utilities.formatDate(wd,"Asia/Makassar","MM"));
        if(wy<curY||(wy===curY&&wm<curM)){
          var base=r.slice(0,11); while(base.length<11) base.push("");
          var key=wy+"-"+pad2(wm);
          (byMonth[key]=byMonth[key]||[]).push(base.concat([sh.getName()]));
          delRows.push(i+1);
        }
      }
      for(var key in byMonth){
        var tabName="Arsip "+key;
        var at=arsipSS.getSheetByName(tabName);
        if(!at){ at=arsipSS.insertSheet(tabName); at.appendRow(ARS_HEADER); at.getRange(1,1,1,ARS_HEADER.length).setFontWeight("bold"); at.setFrozenRows(1); }
        var vals=byMonth[key];
        at.getRange(at.getLastRow()+1,1,vals.length,ARS_HEADER.length).setValues(vals);
        total+=vals.length;
      }
      delRows.sort(function(a,b){return b-a;});
      for(var k=0;k<delRows.length;k++){ sh.deleteRow(delRows[k]); }
    }
  }
  var msg="Selesai. "+total+" aduan bulan lalu dipindah ke arsip.";
  Logger.log(msg); return msg;
}

function pasangTriggerArsip(){
  var trs=ScriptApp.getProjectTriggers();
  for(var i=0;i<trs.length;i++){ if(trs[i].getHandlerFunction()==="arsipkanBulanLalu") ScriptApp.deleteTrigger(trs[i]); }
  ScriptApp.newTrigger("arsipkanBulanLalu").timeBased().onMonthDay(1).atHour(1).create();
  return "Trigger arsip bulanan dipasang: otomatis tiap tanggal 1 (~01:00 WITA).";
}
function hapusTriggerArsip(){
  var trs=ScriptApp.getProjectTriggers(), c=0;
  for(var i=0;i<trs.length;i++){ if(trs[i].getHandlerFunction()==="arsipkanBulanLalu"){ ScriptApp.deleteTrigger(trs[i]); c++; } }
  return "Trigger arsip dihapus: "+c;
}

/* ===== Unduh arsip dari aplikasi ===== */
function handleArchiveMonths(b){
  var s=getSession(b.token); if(!s) return json({ok:false,error:"Sesi berakhir, login ulang"});
  if(isUnset(ARSIP_SHEET)) return json({ok:true, months:[]});
  var ss; try{ ss=SpreadsheetApp.openById(extractId(ARSIP_SHEET)); }catch(e){ return json({ok:true, months:[]}); }
  var sheets=ss.getSheets(), months=[];
  for(var i=0;i<sheets.length;i++){ var nm=sheets[i].getName(); if(nm.indexOf("Arsip ")===0) months.push(nm.substring(6)); }
  months.sort(); months.reverse();
  return json({ok:true, months:months});
}
function handleArchiveData(b){
  var s=getSession(b.token); if(!s) return json({ok:false,error:"Sesi berakhir, login ulang"});
  if(isUnset(ARSIP_SHEET)) return json({ok:false,error:"Arsip belum diatur"});
  var ss; try{ ss=SpreadsheetApp.openById(extractId(ARSIP_SHEET)); }catch(e){ return json({ok:false,error:"Arsip tidak dapat dibuka"}); }
  var tab="Arsip "+String(b.bulan||"").replace(/[^0-9\-]/g,"");
  var sh=ss.getSheetByName(tab); if(!sh) return json({ok:false,error:"Bulan arsip tidak ditemukan"});
  var d=sh.getDataRange().getValues(); if(!d.length) return json({ok:true, header:[], rows:[]});
  var header=d[0], adminCol=header.length-1, rows=[];
  for(var i=1;i<d.length;i++){ var r=d[i]; if(!r[1]) continue;
    if(s.role!=="super" && String(r[adminCol])!==s.u) continue;
    var w=r[0]; var w0=(w instanceof Date)?Utilities.formatDate(w,"Asia/Makassar","yyyy-MM-dd HH:mm"):w;
    var out=r.slice(); out[0]=w0; rows.push(out);
  }
  return json({ok:true, header:header, rows:rows});
}