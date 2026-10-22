import React, { useState, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import PortalLogin from "./PortalLogin.jsx";

// Each role's app is loaded only when that role signs in, so the login screen
// doesn't wait on ~800 KB of admin/resident code.
const ResidentApp = lazy(() => import("./ResidentApp.jsx"));
const AdminApp = lazy(() => import("./AdminApp.jsx"));
const HeadGuardApp = lazy(() => import("./HeadGuardApp.jsx"));

function AppLoading() {
  return (
    <div role="status" className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: "#F5F6FA", color: "#626B80", fontFamily: "Inter, sans-serif" }}>
      <Loader2 size={24} className="animate-spin" aria-hidden="true" />
      <p className="text-sm font-medium">Loading your portal…</p>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState(null); // null | "resident" | "admin" | "head_guard"
  const exit = () => setRole(null);

  if (!role) return <PortalLogin onEnter={(r) => setRole(r)} />;
  return (
    <Suspense fallback={<AppLoading />}>
      {role === "resident" && <ResidentApp onExitToPortal={exit} />}
      {role === "admin" && <AdminApp onExitToPortal={exit} />}
      {role === "head_guard" && <HeadGuardApp onExitToPortal={exit} />}
    </Suspense>
  );
}
