import React, { useState, useEffect } from "react";
import App from "./App.jsx";
import AdminApp from "./components/AdminApp.jsx";

export default function Root() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return hash.startsWith("#admin") ? <AdminApp /> : <App />;
}
