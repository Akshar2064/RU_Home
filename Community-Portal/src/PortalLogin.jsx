import React, { useState } from "react";
import { Home, ShieldCheck, ShieldPlus, Building2, Lock, Loader2, ChevronRight } from "lucide-react";

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

      :root {
        --color-navy-900: #14213D;
        --color-navy-800: #1B2B4B;
        --color-navy-700: #24365E;
        --color-navy-50: #EEF1F7;
        --color-bg: #F5F6FA;
        --color-surface: #FFFFFF;
        --color-border: #E4E7EE;
        --color-marigold-500: #F2A93B;
        --color-marigold-600: #DB9424;
        --color-marigold-50: #FDF3DE;
        --color-text-primary: #1A2130;
        --color-text-secondary: #626B80;
        --color-text-tertiary: #9198A9;
        --color-success: #2F9E68;
        --color-success-bg: #E7F6EE;
        --color-danger: #D64545;
        --color-danger-bg: #FCEAEA;
      }

      * { box-sizing: border-box; }
      .portal-root { font-family: 'Inter', sans-serif; color: var(--color-text-primary); }
      .portal-heading { font-family: 'Sora', sans-serif; }
      @keyframes portal-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .portal-animate-in { animation: portal-fade-in 0.25s ease-out; }
      .portal-focus:focus-visible { outline: 2px solid var(--color-navy-700); outline-offset: 2px; }
    `}</style>
  );
}

const ROLE_CARDS = [
  {
    key: "resident",
    title: "Resident",
    desc: "Visitor passes, amenities, payments, service requests and the community marketplace.",
    icon: Home,
  },
  {
    key: "head_guard",
    title: "Head Guard",
    desc: "Build the guard roster, approve leave, track coverage gaps and review handovers.",
    icon: ShieldPlus,
  },
  {
    key: "admin",
    title: "Admin",
    desc: "Manage residents, staff and guards, billing, security and community-wide reports.",
    icon: ShieldCheck,
  },
];

const ROLE_LABELS = { resident: "Resident", head_guard: "Head Guard", admin: "Admin" };

export default function PortalLogin({ onEnter }) {
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
    <div className="portal-root min-h-screen w-full flex items-center justify-center px-4 py-10" style={{ background: "var(--color-bg)" }}>
      <GlobalStyles />
      <div className="w-full max-w-[900px] portal-animate-in grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl" style={{ border: "1px solid var(--color-border)" }}>
        <div
          className="hidden md:flex flex-col justify-between p-10 text-white"
          style={{ background: "linear-gradient(160deg, var(--color-navy-900), var(--color-navy-700))" }}
        >
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: "rgba(255,255,255,.12)" }}>
                <Building2 size={20} />
              </div>
              <span className="portal-heading text-sm font-bold tracking-wide uppercase" style={{ color: "var(--color-marigold-500)" }}>
                RUhome
              </span>
            </div>
            <h1 className="portal-heading mt-10 text-3xl font-bold leading-tight">
              One community.
              <br />
              One connected portal.
            </h1>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "#C3CCE0" }}>
              Residents and administrators sign in from the same place — the portal
              takes you straight to the experience built for your role.
            </p>
          </div>
          <div className="space-y-3">
            {ROLE_CARDS.map((r) => (
              <div key={r.key} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,.06)" }}>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: "rgba(255,255,255,.12)" }}>
                  <r.icon size={17} />
                </span>
                <div>
                  <p className="text-xs font-bold">{r.title} experience</p>
                  <p className="mt-0.5 text-[11px]" style={{ color: "#AEB9D1" }}>{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 md:p-10 flex flex-col justify-center">
          <div className="md:hidden mb-6 flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: "var(--color-navy-900)" }}>
              <Building2 size={18} />
            </div>
            <span className="portal-heading text-sm font-bold" style={{ color: "var(--color-navy-900)" }}>RUhome</span>
          </div>

          <h2 className="portal-heading text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>Sign in to the portal</h2>
          <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>Choose how you're signing in, then enter your details.</p>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl p-1.5" style={{ background: "var(--color-navy-50)" }}>
            {ROLE_CARDS.map((r) => {
              const active = role === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`portal-focus flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-xs font-bold transition ${active ? "shadow-sm" : ""}`}
                  style={active
                    ? { background: "var(--color-surface)", color: "var(--color-navy-900)" }
                    : { color: "var(--color-text-tertiary)" }}
                >
                  <r.icon size={18} />
                  {r.title}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-secondary)" }}>
                {role === "admin" ? "Work email" : role === "head_guard" ? "Mobile number / Employee ID" : "Mobile number or email"}
              </label>
              <input
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={role === "admin" ? "you@ruhome.example" : role === "head_guard" ? "HG-2001 or +91 98450 12233" : "+91 98765 43210"}
                className="portal-focus w-full rounded-xl px-3.5 py-3 text-sm outline-none"
                style={{ border: "1px solid var(--color-border)", background: "var(--color-bg)" }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: "var(--color-text-secondary)" }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="portal-focus w-full rounded-xl pl-9 pr-3.5 py-3 text-sm outline-none"
                  style={{ border: "1px solid var(--color-border)", background: "var(--color-bg)" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="portal-focus w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-70"
              style={{ background: "var(--color-navy-900)" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
              {loading ? "Signing in…" : `Sign in as ${ROLE_LABELS[role]}`}
            </button>
          </form>

          <p className="mt-5 text-center text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
            This is a prototype — any details will sign you into the {ROLE_LABELS[role]} experience.
          </p>
        </div>
      </div>
    </div>
  );
}
