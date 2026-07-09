import React, { useState } from "react";
import AdminLogin from "./AdminLogin.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import SuperAdmin from "./SuperAdmin.jsx";
import AdminProfile from "./AdminProfile.jsx";

const KEY = "silapor_admin_session";
function loadSession() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; } }

export default function AdminApp() {
  const [session, setSession] = useState(loadSession());
  const [view, setView] = useState("monitoring"); // monitoring | admins
  const [profileOpen, setProfileOpen] = useState(false);

  const persist = (s) => { localStorage.setItem(KEY, JSON.stringify(s)); setSession(s); };

  const onLogin = (res) => persist({ token: res.token, admin: res.admin, sheetLinks: res.sheetLinks || [] });
  const onLogout = () => { localStorage.removeItem(KEY); setSession(null); setView("monitoring"); };
  const onProfileSaved = (updatedAdmin) => persist({ ...session, admin: { ...session.admin, ...updatedAdmin } });

  if (!session) return <AdminLogin onLogin={onLogin} />;

  const isSuper = session.admin.role === "super";

  return (
    <>
      {view === "admins" && isSuper ? (
        <SuperAdmin session={session} onBack={() => setView("monitoring")} onProfile={() => setProfileOpen(true)} onLogout={onLogout} />
      ) : (
        <AdminDashboard
          session={session}
          isSuper={isSuper}
          onManageAdmins={() => setView("admins")}
          onProfile={() => setProfileOpen(true)}
          onLogout={onLogout}
        />
      )}
      {profileOpen && (
        <AdminProfile session={session} onClose={() => setProfileOpen(false)} onSaved={onProfileSaved} />
      )}
    </>
  );
}
