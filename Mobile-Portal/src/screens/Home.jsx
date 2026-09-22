import {
  QrCode, UserPlus, LogOut as ExitIcon, KeyRound, Search, Car,
  AlertTriangle, Footprints, Clock, ChevronRight, ShieldAlert,
} from "lucide-react";
import { Card, Badge, Avatar } from "../ui.jsx";
import { GUARD } from "../mockData.js";

const QUICK_ACTIONS = [
  { key: "scan", label: "Scan QR", icon: QrCode, variant: "primary" },
  { key: "entry", label: "Visitor Entry", icon: UserPlus },
  { key: "exit", label: "Visitor Exit", icon: ExitIcon },
  { key: "otp", label: "Verify OTP", icon: KeyRound },
  { key: "search", label: "Search Visitor", icon: Search },
  { key: "vehicle", label: "Vehicle", icon: Car },
  { key: "incident", label: "Incident", icon: AlertTriangle },
  { key: "patrol", label: "Patrol", icon: Footprints },
];

export default function Home({ gate, expectedCount, activeCount, recentActivity, patrolProgress, go, profile = GUARD }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-5 pb-2">
      {/* Guard / gate status card */}
      <div className="rounded-3xl p-5 text-white" style={{ background: "linear-gradient(150deg, var(--color-navy-900), var(--color-navy-700))" }}>
        <div className="flex items-center gap-3">
          <Avatar initials={profile.photoInitials} tone="marigold" size={44} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--color-marigold-500)" }}>On duty · {gate}</p>
            <p className="text-base font-bold">{profile.name}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{profile.shiftLabel} · {profile.shiftWindow}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div>
            <p className="text-2xl font-bold">{expectedCount}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Expected today</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Currently inside</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{patrolProgress}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Checkpoints done</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4 text-[11px]" style={{ color: "rgba(255,255,255,0.55)" }}>
          <Clock size={13} /> {dateStr} · {timeStr}
        </div>
      </div>

      {/* Primary action: Scan QR */}
      <button
        onClick={() => go("scan")}
        className="guard-focus w-full rounded-3xl p-5 flex items-center gap-4 active:scale-[.99] transition shadow-md"
        style={{ background: "var(--color-marigold-500)" }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "var(--color-navy-900)" }}>
          <QrCode size={28} color="#fff" />
        </div>
        <div className="text-left flex-1">
          <p className="text-base font-bold" style={{ color: "var(--color-navy-900)" }}>Scan Visitor QR</p>
          <p className="text-xs" style={{ color: "var(--color-navy-800)" }}>Fastest way to verify &amp; check in visitors</p>
        </div>
        <ChevronRight size={20} style={{ color: "var(--color-navy-900)" }} />
      </button>

      {/* Quick actions grid */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>Quick actions</p>
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_ACTIONS.filter((a) => a.key !== "scan").map((a) => (
            <button
              key={a.key}
              onClick={() => go(a.key)}
              className="guard-focus flex flex-col items-center gap-2 rounded-2xl py-3.5 active:scale-[.96] transition"
              style={{ background: "#fff", border: "1px solid var(--color-border)" }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--color-navy-50)" }}>
                <a.icon size={18} style={{ color: "var(--color-navy-700)" }} />
              </div>
              <span className="text-[10px] font-bold text-center leading-tight" style={{ color: "var(--color-text-primary)" }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>Recent activity</p>
          <button onClick={() => go("visitors")} className="text-xs font-bold" style={{ color: "var(--color-navy-700)" }}>View all</button>
        </div>
        <Card className="divide-y" style={{ borderColor: "var(--color-border)" }}>
          {recentActivity.length === 0 ? (
            <div className="p-5 text-center text-xs" style={{ color: "var(--color-text-tertiary)" }}>No activity yet this shift.</div>
          ) : recentActivity.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-4 py-3" style={{ borderColor: "var(--color-border)" }}>
              <Avatar initials={r.name.slice(0, 2).toUpperCase()} size={34} tone="navy" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{r.name}</p>
                <p className="text-[11px] truncate" style={{ color: "var(--color-text-secondary)" }}>{r.type} · {r.flat}</p>
              </div>
              <Badge tone={r.status === "Exited" ? "neutral" : r.status === "Denied" ? "danger" : "success"} size="sm">{r.status}</Badge>
            </div>
          ))}
        </Card>
      </div>

      {/* Emergency banner */}
      <button
        onClick={() => go("sos")}
        className="guard-focus w-full rounded-2xl p-4 flex items-center gap-3 active:scale-[.99] transition"
        style={{ background: "var(--color-danger-bg)" }}
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-danger)" }}>
          <ShieldAlert size={20} color="#fff" />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-bold" style={{ color: "var(--color-danger-strong)" }}>Emergency / SOS</p>
          <p className="text-[11px]" style={{ color: "var(--color-danger-strong)" }}>Trigger an urgent security alert</p>
        </div>
        <ChevronRight size={18} style={{ color: "var(--color-danger-strong)" }} />
      </button>
    </div>
  );
}
