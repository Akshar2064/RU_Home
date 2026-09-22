import React, { useState } from "react";
import MobileLogin from "./MobileLogin.jsx";
import ResidentApp from "./ResidentApp.tsx";
import GuardApp from "./GuardApp.jsx";

export default function App() {
  const [role, setRole] = useState(null); // null | "resident" | "guard" | "head_guard"

  if (role === "resident") return <ResidentApp onExitToPortal={() => setRole(null)} />;
  if (role === "guard") return <GuardApp onExitToPortal={() => setRole(null)} />;
  if (role === "head_guard") return <GuardApp role="head_guard" onExitToPortal={() => setRole(null)} />;
  return <MobileLogin onEnter={(r) => setRole(r)} />;
}
