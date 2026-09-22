import React, { useState } from "react";
import PortalLogin from "./PortalLogin.jsx";
import ResidentApp from "./ResidentApp.jsx";
import AdminApp from "./AdminApp.jsx";
import HeadGuardApp from "./HeadGuardApp.jsx";

export default function App() {
  const [role, setRole] = useState(null); // null | "resident" | "admin" | "head_guard"

  if (role === "resident") return <ResidentApp onExitToPortal={() => setRole(null)} />;
  if (role === "admin") return <AdminApp onExitToPortal={() => setRole(null)} />;
  if (role === "head_guard") return <HeadGuardApp onExitToPortal={() => setRole(null)} />;
  return <PortalLogin onEnter={(r) => setRole(r)} />;
}
