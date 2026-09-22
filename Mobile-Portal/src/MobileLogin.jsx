import { useState } from "react";
import { Home, ShieldCheck, ShieldPlus, Building2, Lock, Loader2, ChevronRight } from "lucide-react";
import { COMMUNITY } from "./mockData.js";

const ROLES = [
  { key: "resident", label: "Resident", icon: Home },
  { key: "guard", label: "Guard", icon: ShieldCheck },
  { key: "head_guard", label: "Head Guard", icon: ShieldPlus },
];

const ROLE_DISPLAY = { resident: "Resident", guard: "Guard", head_guard: "Head Guard" };

export default function MobileLogin({ onEnter }) {
  const [role, setRole] = useState("resident");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onEnter(role);
    }, 600);
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center px-5 py-10" style={{ background: "var(--color-navy-900)" }}>
      <div className="w-full max-w-sm portal-animate-in">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "var(--color-marigold-500)" }}>
            <Building2 size={30} style={{ color: "var(--color-navy-900)" }} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--color-marigold-500)" }}>Community Portal</p>
          <h1 className="text-2xl font-bold text-white mt-2">{COMMUNITY}</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>Sign in to continue</p>
        </div>

        <div className="rounded-3xl p-6" style={{ background: "var(--color-navy-800)" }}>
          <div className="grid grid-cols-3 gap-2 rounded-2xl p-1.5 mb-6" style={{ background: "rgba(255,255,255,0.08)" }}>
            {ROLES.map((r) => {
              const active = role === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className="guard-focus flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-bold transition"
                  style={active
                    ? { background: "var(--color-marigold-500)", color: "var(--color-navy-900)" }
                    : { color: "rgba(255,255,255,0.6)" }}
                >
                  <r.icon size={18} />
                  {r.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                {role === "guard" || role === "head_guard" ? "Mobile number / Employee ID" : "Mobile number or email"}
              </label>
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={role === "head_guard" ? "HG-2001 or +91 98450 12233" : role === "guard" ? "GRD-1042 or +91 98450 55210" : "+91 98765 43210"}
                className="w-full rounded-xl px-3.5 py-3.5 text-sm outline-none bg-white/10 text-white placeholder-white/40 border border-white/15"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>Password / PIN</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.45)" }} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl pl-9 pr-3.5 py-3.5 text-sm outline-none bg-white/10 text-white placeholder-white/30 border border-white/15"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="guard-focus w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold disabled:opacity-70"
              style={{ background: "var(--color-marigold-500)", color: "var(--color-navy-900)" }}
            >
              {loading ? <Loader2 size={16} className="guard-spin" /> : <ChevronRight size={16} />}
              {loading ? "Signing in…" : `Sign in as ${ROLE_DISPLAY[role]}`}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            This is a prototype — any details will sign you into the {ROLE_DISPLAY[role]} app.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6" style={{ color: "rgba(255,255,255,0.35)" }}>
          <ShieldCheck size={14} />
          <span className="text-[11px]">{COMMUNITY} · Resident & Security Operations</span>
        </div>
      </div>
    </div>
  );
}
