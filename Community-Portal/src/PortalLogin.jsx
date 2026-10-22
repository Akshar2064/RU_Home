import React, { useState } from "react";
import { Home, ShieldCheck, ShieldPlus, Building2, Lock, Loader2, ChevronRight, Eye, EyeOff } from "lucide-react";

function GlobalStyles() {
  return (
    <style>{`

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
        --color-text-tertiary: #697184;
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

// Per-role identifier field — label, placeholder and the right mobile keyboard / autofill hint.
const IDENTIFIER_FIELD = {
  resident: { label: "Mobile number or email", placeholder: "+91 98765 43210", type: "text", inputMode: "email", autoComplete: "username" },
  head_guard: { label: "Mobile number or Employee ID", placeholder: "HG-2001 or +91 98450 12233", type: "text", inputMode: "text", autoComplete: "username" },
  admin: { label: "Work email", placeholder: "you@ruhome.example", type: "email", inputMode: "email", autoComplete: "email" },
};

export default function PortalLogin({ onEnter }) {
  const [role, setRole] = useState("resident");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const idField = IDENTIFIER_FIELD[role];

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
                  <r.icon size={17} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold">{r.title} experience</p>
                  <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "#C3CCE0" }}>{r.desc}</p>
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
          <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>Choose how you're signing in, then enter your details.</p>

          <div role="radiogroup" aria-label="Sign in as" className="mt-6 grid grid-cols-3 gap-2 rounded-2xl p-1.5" style={{ background: "var(--color-navy-50)" }}>
            {ROLE_CARDS.map((r) => {
              const active = role === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setRole(r.key)}
                  className={`portal-focus flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs sm:text-sm font-bold transition ${active ? "shadow-sm" : "hover:bg-white/60"}`}
                  style={active
                    ? { background: "var(--color-surface)", color: "var(--color-navy-900)" }
                    : { color: "var(--color-text-secondary)" }}
                >
                  <r.icon size={18} aria-hidden="true" />
                  {r.title}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="portal-identifier" className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {idField.label}
              </label>
              <input
                id="portal-identifier"
                required
                type={idField.type}
                inputMode={idField.inputMode}
                autoComplete={idField.autoComplete}
                autoCapitalize="none"
                spellCheck={false}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={idField.placeholder}
                className="portal-focus w-full rounded-xl px-3.5 py-3 text-base sm:text-sm outline-none"
                style={{ border: "1px solid var(--color-border)", background: "var(--color-bg)" }}
              />
            </div>
            <div>
              <label htmlFor="portal-password" className="mb-1.5 block text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Password</label>
              <div className="relative">
                <Lock size={15} aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-tertiary)" }} />
                <input
                  id="portal-password"
                  required
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="portal-focus w-full rounded-xl pl-9 pr-12 py-3 text-base sm:text-sm outline-none"
                  style={{ border: "1px solid var(--color-border)", background: "var(--color-bg)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="portal-focus absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center hover:bg-black/5"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="portal-focus w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-70"
              style={{ background: "var(--color-navy-900)" }}
            >
              {loading ? "Signing in…" : `Sign in as ${ROLE_LABELS[role]}`}
              {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
            </button>
          </form>

          <p className="mt-5 text-center text-xs" style={{ color: "var(--color-text-tertiary)" }}>
            This is a prototype — any details will sign you into the {ROLE_LABELS[role]} experience.
          </p>
        </div>
      </div>
    </div>
  );
}
