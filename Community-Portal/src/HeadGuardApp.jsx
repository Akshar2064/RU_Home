import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, CalendarClock, ClipboardList, MessageSquare,
  ChevronRight, ChevronLeft, LogOut, Plus, Check, X, MapPin,
  AlertTriangle, CheckCircle2, ShieldPlus, Menu, Inbox,
} from "lucide-react";
import { useDialog, greeting } from "./hooks.js";

/* ============================================================================
   Head Guard — Community-Portal experience.
   Guard-tier superset: on-post duties (check-in, patrol, own attendance)
   stay on Mobile-Portal. This web app covers the supervisory work that's
   better suited to a bigger screen — shift roster, leave approval, coverage
   tracking, and handover oversight across every guard, not just one shift.

   Scope defaults to "society-wide" (one Head Guard sees every gate) and
   Admin/RWA retains read-only visibility into this same roster data via
   its own Security section — these are the defaults proposed while the
   open scope questions in the updated Technical Annexure are unresolved.
   ============================================================================ */

function GlobalStyles() {
  return (
    <style>{`
      :root {
        --color-navy-900: #14213D; --color-navy-800: #1B2B4B; --color-navy-700: #24365E; --color-navy-50: #EEF1F7;
        --color-bg: #F5F6FA; --color-surface: #FFFFFF; --color-border: #E4E7EE;
        --color-marigold-500: #F2A93B; --color-marigold-600: #DB9424; --color-marigold-50: #FDF3DE;
        --color-text-primary: #1A2130; --color-text-secondary: #626B80; --color-text-tertiary: #697184;
        --color-success: #2F9E68; --color-success-bg: #E7F6EE;
        --color-danger: #D64545; --color-danger-bg: #FCEAEA;
        --color-warning: #C9860B; --color-warning-bg: #FDF3DC;
        --color-info: #3B6FD8; --color-info-bg: #EAF0FC;
        --color-success-fg: #237A50; --color-warning-fg: #8A5A00; --color-danger-fg: #B83232; --color-info-fg: #2F5DBF;
      }
      * { box-sizing: border-box; }
      .hgapp-root { font-family: 'Inter', sans-serif; color: var(--color-text-primary); }
      .hgapp-heading { font-family: 'Sora', sans-serif; }
      .hgapp-focus:focus-visible { outline: 2px solid var(--color-navy-700); outline-offset: 2px; }
      @keyframes hgapp-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .hgapp-animate-in { animation: hgapp-fade-in 0.2s ease-out; }
      .hgapp-btn { font-weight: 600; transition: filter .15s ease, transform .1s ease; }
      .hgapp-btn:active { transform: scale(0.98); }
      .hgapp-nav-item:hover { background: rgba(255,255,255,0.06); }
      .hgapp-icon-btn { transition: background-color .15s ease; }
      .hgapp-icon-btn:hover { background: var(--color-navy-50); }
      @keyframes hgapp-slide-in { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      .hgapp-drawer-in { animation: hgapp-slide-in 0.22s ease-out; }
    `}</style>
  );
}

/* ---------------------------------------------------------------------------
   UI atoms (self-contained — same visual language as the Admin/Resident
   apps in this portal, kept local so this file doesn't depend on their
   internal, unexported components).
   --------------------------------------------------------------------------- */

function Button({ variant = "primary", size = "md", icon: Icon, className = "", children, style, ...props }) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-3.5 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  const variants = {
    primary: { background: "var(--color-navy-800)", color: "#fff" },
    accent: { background: "var(--color-marigold-500)", color: "var(--color-navy-900)" },
    secondary: { background: "#fff", color: "var(--color-text-primary)", border: "1px solid var(--color-border)" },
    success: { background: "var(--color-success)", color: "#fff" },
    danger: { background: "var(--color-danger)", color: "#fff" },
    ghost: { background: "transparent", color: "var(--color-text-secondary)" },
  };
  return (
    <button
      className={`hgapp-btn hgapp-focus rounded-lg inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${sizes[size]} ${className}`}
      style={{ ...variants[variant], ...style }}
      {...props}
    >
      {Icon && <Icon size={15} strokeWidth={2.25} />}
      {children}
    </button>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { fg: "var(--color-text-secondary)", bg: "#EEF0F4" },
    success: { fg: "var(--color-success-fg)", bg: "var(--color-success-bg)" },
    warning: { fg: "var(--color-warning-fg)", bg: "var(--color-warning-bg)" },
    danger: { fg: "var(--color-danger-fg)", bg: "var(--color-danger-bg)" },
    info: { fg: "var(--color-info-fg)", bg: "var(--color-info-bg)" },
  };
  const t = tones[tone];
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap" style={{ color: t.fg, background: t.bg }}>{children}</span>;
}

const SHIFT_STATUS_TONE = { "Checked In": "success", Scheduled: "neutral", Missed: "danger" };
const LEAVE_STATUS_TONE = { Pending: "warning", Approved: "success", Rejected: "danger" };

function Card({ children, className = "", padded = true, ...props }) {
  return <div className={`rounded-2xl bg-white ${padded ? "p-5" : ""} ${className}`} style={{ border: "1px solid var(--color-border)" }} {...props}>{children}</div>;
}

function Avatar({ initials, size = 34 }) {
  return <div className="rounded-full flex items-center justify-center font-semibold shrink-0" style={{ width: size, height: size, background: "var(--color-navy-800)", color: "#fff", fontSize: size * 0.36 }}>{initials}</div>;
}

function StatCard({ label, value, sub, icon: Icon, tone }) {
  return (
    <Card className="!p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>{label}</span>
        {Icon && <Icon size={15} style={{ color: tone || "var(--color-navy-700)" }} />}
      </div>
      <p className="hgapp-heading text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>{sub}</p>}
    </Card>
  );
}

function PageHeader({ title, blurb, action }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4">
      <div>
        <h1 className="hgapp-heading text-xl font-bold">{title}</h1>
        {blurb && <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>{blurb}</p>}
      </div>
      {action}
    </div>
  );
}

const inputStyle = { border: "1px solid var(--color-border)", background: "#fff" };
function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}
function Select({ children, ...props }) { return <select className="hgapp-focus w-full rounded-lg px-3.5 py-2.5 text-sm bg-white" style={inputStyle} {...props}>{children}</select>; }

function Modal({ open, onClose, title, subtitle, children, footer }) {
  const panelRef = useDialog(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0" style={{ background: "rgba(20,33,61,0.45)" }} onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl hgapp-animate-in max-h-[92vh] sm:max-h-[88vh] flex flex-col outline-none">
        <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div><h2 className="hgapp-heading text-lg font-bold">{title}</h2>{subtitle && <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{subtitle}</p>}</div>
          <button onClick={onClose} aria-label="Close" className="hgapp-focus hgapp-icon-btn w-9 h-9 -mr-1.5 -mt-1 rounded-full flex items-center justify-center shrink-0" style={{ color: "var(--color-text-secondary)" }}><X size={18} /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: "1px solid var(--color-border)" }}>{footer}</div>}
      </div>
    </div>
  );
}

function ToastStack({ toasts }) {
  return (
    <div aria-live="polite" className="fixed top-4 right-4 left-4 sm:left-auto z-[300] flex flex-col gap-2 sm:w-[340px]">
      {toasts.map((t) => (
        <div key={t.id} role="status" className="rounded-xl px-4 py-3 shadow-lg hgapp-animate-in" style={{ background: t.tone === "danger" ? "var(--color-danger)" : "var(--color-navy-900)", color: "#fff" }}>
          <p className="text-sm font-bold">{t.title}</p>
          {t.body && <p className="text-xs mt-0.5 opacity-90">{t.body}</p>}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Mock data — kept local to this file (matches this portal's existing
   convention of each top-level app owning its own mock data inline).
   --------------------------------------------------------------------------- */

const HEAD_GUARD = { name: "Meera Krishnan", role: "Head Guard", employeeId: "HG-2001", initials: "MK", phone: "+91 98450 12233", community: "RUhome", scope: "Society-wide" };

const GATES = ["Main Gate", "Tower B Gate", "Service Gate", "Clubhouse Gate"];
const SHIFT_WINDOWS = ["Morning (08:00–16:00)", "Evening (16:00–00:00)", "Night (00:00–08:00)"];
const GUARDS = [
  { id: "G1", name: "Suresh Kumar", employeeId: "SEC-1042" },
  { id: "G2", name: "Ramesh Yadav", employeeId: "SEC-1043" },
  { id: "G3", name: "Irfan Ali", employeeId: "SEC-1044" },
  { id: "G4", name: "Naveen Das", employeeId: "SEC-1045" },
  { id: "G5", name: "Arun Prasad", employeeId: "SEC-1046" },
];

const INITIAL_ROSTER = [
  { id: "sh-1", date: "Today", gate: "Main Gate", window: "Morning (08:00–16:00)", guard: "Suresh Kumar", status: "Checked In", checkInTime: "07:58 AM" },
  { id: "sh-2", date: "Today", gate: "Main Gate", window: "Evening (16:00–00:00)", guard: "Ramesh Yadav", status: "Scheduled", checkInTime: null },
  { id: "sh-3", date: "Today", gate: "Tower B Gate", window: "Morning (08:00–16:00)", guard: "Irfan Ali", status: "Checked In", checkInTime: "08:03 AM" },
  { id: "sh-4", date: "Today", gate: "Service Gate", window: "Morning (08:00–16:00)", guard: "Naveen Das", status: "Missed", checkInTime: null },
  { id: "sh-5", date: "Today", gate: "Clubhouse Gate", window: "Morning (08:00–16:00)", guard: "Arun Prasad", status: "Scheduled", checkInTime: null },
];

const INITIAL_LEAVE = [
  { id: "lv-1", guard: "Ramesh Yadav", shiftLabel: "Tomorrow · Night (00:00–08:00) · Main Gate", reason: "Family function", requestedOn: "Today, 9:10 AM", status: "Pending" },
  { id: "lv-2", guard: "Arun Prasad", shiftLabel: "Fri · Morning (08:00–16:00) · Clubhouse Gate", reason: "Medical appointment", requestedOn: "Yesterday, 6:40 PM", status: "Pending" },
];

const HANDOVER_FEED = [
  { id: "h-1", guard: "Irfan Ali", gate: "Tower B Gate", time: "Today, 7:58 AM", note: "Visitor parking V-05 reserved for clubhouse event till 6 PM." },
  { id: "h-2", guard: "Suresh Kumar", gate: "Main Gate", time: "Today, 7:56 AM", note: "INC-241 vehicle issue still open — follow up with owner of TS-plate car in V-06." },
  { id: "h-3", guard: "Naveen Das", gate: "Service Gate", time: "Yesterday, 11:50 PM", note: "All quiet. Delivery gate locked at 11 PM as usual." },
  { id: "h-4", guard: "Arun Prasad", gate: "Clubhouse Gate", time: "Yesterday, 8:02 PM", note: "Clubhouse event wrapped early — extra visitor parking released by 7 PM." },
];

function initialsOf(name) { return name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase(); }

/* ---------------------------------------------------------------------------
   Sidebar / TopBar
   --------------------------------------------------------------------------- */

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "roster", label: "Shift Roster", icon: CalendarClock },
  { key: "leave", label: "Leave Requests", icon: ClipboardList },
  { key: "handover", label: "Handover Notes", icon: MessageSquare },
];

function SidebarNav({ route, onNavigate, collapsed, badges = {} }) {
  return (
    <>
      <div className={`flex items-center gap-2.5 px-4 h-16 shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-marigold-500)" }}><ShieldPlus size={18} style={{ color: "var(--color-navy-900)" }} /></div>
        {!collapsed && <div className="min-w-0"><p className="hgapp-heading text-white font-semibold text-sm leading-tight truncate">RUhome</p><p className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.6)" }}>Head Guard</p></div>}
      </div>
      <nav aria-label="Head guard sections" className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = route === item.key;
          const badge = badges[item.key];
          return (
            <button key={item.key} onClick={() => onNavigate(item.key)} title={collapsed ? item.label : undefined}
              aria-label={collapsed ? `${item.label}${badge ? `, ${badge} pending` : ""}` : undefined} aria-current={active ? "page" : undefined}
              className={`hgapp-focus ${active ? "" : "hgapp-nav-item"} relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? "justify-center" : ""}`}
              style={{ background: active ? "rgba(242,169,59,0.14)" : undefined, color: active ? "var(--color-marigold-500)" : "rgba(255,255,255,0.78)" }}>
              <item.icon size={17} strokeWidth={2} className="shrink-0" aria-hidden="true" />
              {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
              {badge ? (
                <span className={`${collapsed ? "absolute top-1 right-2" : ""} min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center`} style={{ background: "var(--color-marigold-500)", color: "var(--color-navy-900)" }}>
                  {badge}{!collapsed && <span className="sr-only"> pending</span>}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
    </>
  );
}

function Sidebar({ route, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile, badges }) {
  const mobileRef = useDialog(mobileOpen, onCloseMobile);
  return (
    <>
      <aside className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 transition-[width] duration-200 relative ${collapsed ? "w-[76px]" : "w-[248px]"}`} style={{ background: "var(--color-navy-900)" }}>
        <SidebarNav route={route} onNavigate={onNavigate} collapsed={collapsed} badges={badges} />
        <button onClick={onToggleCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hgapp-focus absolute -right-3.5 top-[52px] w-7 h-7 rounded-full flex items-center justify-center shadow" style={{ background: "#fff", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[150] flex">
          <div className="absolute inset-0" style={{ background: "rgba(20,33,61,0.5)" }} onClick={onCloseMobile} />
          <div ref={mobileRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Navigation"
            className="relative w-[280px] max-w-[85vw] h-full flex flex-col hgapp-drawer-in outline-none" style={{ background: "var(--color-navy-900)" }}>
            <button onClick={onCloseMobile} aria-label="Close navigation" className="hgapp-focus absolute top-3.5 right-3 w-9 h-9 rounded-full flex items-center justify-center z-10" style={{ color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.08)" }}>
              <X size={17} />
            </button>
            <SidebarNav route={route} onNavigate={(k) => { onNavigate(k); onCloseMobile(); }} collapsed={false} badges={badges} />
          </div>
        </div>
      )}
    </>
  );
}

function TopBar({ breadcrumb, onLogout, onOpenMobileNav }) {
  return (
    <header className="sticky top-0 z-[80] h-16 shrink-0 flex items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-7" style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      <button onClick={onOpenMobileNav} aria-label="Open navigation" className="hgapp-focus hgapp-icon-btn md:hidden w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ color: "var(--color-text-secondary)" }}><Menu size={20} /></button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{breadcrumb}</p>
        <p className="text-xs truncate" style={{ color: "var(--color-text-tertiary)" }}>Scope: {HEAD_GUARD.scope}</p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold leading-tight">{HEAD_GUARD.name}</p>
          <p className="text-[11px] leading-tight" style={{ color: "var(--color-text-tertiary)" }}>{HEAD_GUARD.employeeId} · Head Guard</p>
        </div>
        <Avatar initials={HEAD_GUARD.initials} size={34} />
        <button onClick={onLogout} aria-label="Log out" title="Log out" className="hgapp-focus hgapp-icon-btn w-10 h-10 rounded-full flex items-center justify-center" style={{ border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------------
   Pages
   --------------------------------------------------------------------------- */

function DashboardPage({ roster, leaveRequests, onNavigate }) {
  const onDutyNow = roster.filter((s) => s.status === "Checked In").length;
  const gaps = roster.filter((s) => s.status === "Missed");
  const pendingLeave = leaveRequests.filter((l) => l.status === "Pending").length;

  return (
    <div>
      <PageHeader title={`${greeting()}, ${HEAD_GUARD.name.split(" ")[0]}`} blurb="Here's coverage across every gate right now." />

      {gaps.length > 0 && (
        <div role="alert" className="rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-start gap-3" style={{ background: "var(--color-danger-bg)", border: "1px solid #F3C9C9" }}>
          <div className="flex items-start gap-3 flex-1">
            <AlertTriangle size={18} aria-hidden="true" style={{ color: "var(--color-danger-fg)" }} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: "var(--color-danger-fg)" }}>{gaps.length} coverage gap{gaps.length > 1 ? "s" : ""} — no check-in within grace period</p>
              <ul className="mt-1 space-y-0.5">
                {gaps.map((g) => <li key={g.id} className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{g.gate} · {g.window} · {g.guard}</li>)}
              </ul>
            </div>
          </div>
          <Button variant="danger" size="md" className="self-stretch sm:self-start" onClick={() => onNavigate("roster")}>Arrange backup</Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="On duty now" value={onDutyNow} sub={`of ${roster.length} shifts today`} icon={CheckCircle2} tone="var(--color-success)" />
        <StatCard label="Coverage gaps" value={gaps.length} sub="need backup" icon={AlertTriangle} tone={gaps.length ? "var(--color-danger)" : "var(--color-navy-700)"} />
        <StatCard label="Pending leave" value={pendingLeave} sub="awaiting your decision" icon={ClipboardList} tone={pendingLeave ? "var(--color-warning)" : undefined} />
        <StatCard label="Gates covered" value={GATES.length} sub="society-wide" icon={MapPin} />
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
          <h2 className="hgapp-heading font-bold text-[15px]">Live roster · right now</h2>
          <Button variant="secondary" size="sm" onClick={() => onNavigate("roster")}>View full roster</Button>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
          {/* Gaps first — they're what needs action. */}
          {[...roster].sort((a, b) => (a.status === "Missed" ? -1 : 0) - (b.status === "Missed" ? -1 : 0)).map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar initials={initialsOf(s.guard)} size={30} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{s.guard}</p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{s.gate} · {s.window}{s.checkInTime ? ` · in at ${s.checkInTime}` : ""}</p>
              </div>
              <Badge tone={SHIFT_STATUS_TONE[s.status]}>{s.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RosterPage({ roster, onAddShift }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ gate: GATES[0], window: SHIFT_WINDOWS[0], guard: GUARDS[0].name, date: "Today" });

  return (
    <div>
      <PageHeader
        title="Shift Roster"
        blurb="Create and edit shifts, and assign guards to specific gates and posts."
        action={<Button variant="accent" icon={Plus} onClick={() => setOpen(true)}>Add Shift</Button>}
      />

      <Card padded={false} className="overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="text-left" style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Date", "Gate", "Shift window", "Guard", "Status", "Check-in"].map((h) => (
                <th key={h} scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {roster.map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td className="px-5 py-3">{s.date}</td>
                <td className="px-5 py-3">{s.gate}</td>
                <td className="px-5 py-3">{s.window}</td>
                <td className="px-5 py-3 font-semibold">{s.guard}</td>
                <td className="px-5 py-3"><Badge tone={SHIFT_STATUS_TONE[s.status]}>{s.status}</Badge></td>
                <td className="px-5 py-3" style={{ color: "var(--color-text-secondary)" }}>{s.checkInTime || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Shift"
        subtitle="Assign a guard to a gate and shift window."
        footer={<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => { onAddShift(form); setOpen(false); }}>Add Shift</Button>
        </>}
      >
        {roster.some((s) => s.date === form.date && s.window === form.window && s.guard === form.guard) && (
          <p role="alert" className="text-xs font-medium rounded-lg p-3 mb-4 flex items-start gap-2" style={{ background: "var(--color-warning-bg)", color: "var(--color-warning-fg)" }}>
            <AlertTriangle size={14} aria-hidden="true" className="shrink-0 mt-px" />{form.guard} is already rostered for this shift window.
          </p>
        )}
        <Field label="Guard">
          <Select value={form.guard} onChange={(e) => setForm({ ...form, guard: e.target.value })}>
            {GUARDS.map((g) => <option key={g.id}>{g.name}</option>)}
          </Select>
        </Field>
        <Field label="Gate">
          <Select value={form.gate} onChange={(e) => setForm({ ...form, gate: e.target.value })}>
            {GATES.map((g) => <option key={g}>{g}</option>)}
          </Select>
        </Field>
        <Field label="Shift window">
          <Select value={form.window} onChange={(e) => setForm({ ...form, window: e.target.value })}>
            {SHIFT_WINDOWS.map((w) => <option key={w}>{w}</option>)}
          </Select>
        </Field>
      </Modal>
    </div>
  );
}

function LeavePage({ leaveRequests, onDecide }) {
  return (
    <div>
      <PageHeader title="Leave Requests" blurb="Approve or reject guard leave, and reassign the now-open shift." />
      <div className="space-y-3">
        {leaveRequests.length === 0 && (
          <Card className="text-center py-12 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "var(--color-navy-50)" }}><Inbox size={22} aria-hidden="true" style={{ color: "var(--color-navy-700)" }} /></div>
            <p className="text-sm font-semibold">No leave requests right now</p>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>New requests from guards will appear here.</p>
          </Card>
        )}
        {/* Pending requests first so decisions aren't buried under history. */}
        {[...leaveRequests].sort((a, b) => (a.status === "Pending" ? -1 : 0) - (b.status === "Pending" ? -1 : 0)).map((l) => (
          <Card key={l.id} className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <Avatar initials={initialsOf(l.guard)} size={38} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold">{l.guard}</p>
                  <Badge tone={LEAVE_STATUS_TONE[l.status]}>{l.status}</Badge>
                </div>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{l.shiftLabel}</p>
                <p className="text-sm mt-1.5">“{l.reason}”</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>Requested {l.requestedOn}</p>
              </div>
            </div>
            {l.status === "Pending" && (
              <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
                <Button variant="secondary" size="md" icon={X} onClick={() => onDecide(l.id, "Rejected")}>Reject</Button>
                <Button variant="success" size="md" icon={Check} onClick={() => onDecide(l.id, "Approved")}>Approve</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

function HandoverPage() {
  return (
    <div>
      <PageHeader title="Handover Notes" blurb="Every guard's handover notes across every gate — not just one shift." />
      <div className="space-y-3">
        {HANDOVER_FEED.map((n) => (
          <Card key={n.id}>
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-xs font-bold" style={{ color: "var(--color-navy-700)" }}>{n.gate}</span>
              <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>{n.time}</span>
            </div>
            <p className="text-sm leading-relaxed">{n.note}</p>
            <p className="text-xs mt-2" style={{ color: "var(--color-text-tertiary)" }}>Logged by {n.guard}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Root
   --------------------------------------------------------------------------- */

export default function HeadGuardApp({ onExitToPortal }) {
  const [route, setRoute] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [roster, setRoster] = useState(INITIAL_ROSTER);
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE);
  const [toasts, setToasts] = useState([]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [route]);

  const pushToast = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, ...t }]);
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 3200);
  };

  const handleAddShift = (form) => {
    setRoster((prev) => [{ id: `sh-${Date.now()}`, date: form.date, gate: form.gate, window: form.window, guard: form.guard, status: "Scheduled", checkInTime: null }, ...prev]);
    pushToast({ title: "Shift added", body: `${form.guard} · ${form.gate} · ${form.window}` });
  };

  const handleLeaveDecision = (id, status) => {
    setLeaveRequests((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    const l = leaveRequests.find((x) => x.id === id);
    pushToast({
      title: status === "Approved" ? "Leave approved" : "Leave rejected",
      body: status === "Approved" ? `${l?.guard}'s shift is now open for reassignment.` : `${l?.guard}'s request was declined.`,
      tone: status === "Rejected" ? "danger" : undefined,
    });
  };

  const breadcrumbFor = (r) => NAV.find((n) => n.key === r)?.label || "Dashboard";

  const PAGES = {
    dashboard: <DashboardPage roster={roster} leaveRequests={leaveRequests} onNavigate={setRoute} />,
    roster: <RosterPage roster={roster} onAddShift={handleAddShift} />,
    leave: <LeavePage leaveRequests={leaveRequests} onDecide={handleLeaveDecision} />,
    handover: <HandoverPage />,
  };

  return (
    <div className="hgapp-root">
      <GlobalStyles />
      <div className="min-h-screen flex" style={{ background: "var(--color-bg)" }}>
        <Sidebar route={route} onNavigate={setRoute} collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)}
          mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)}
          badges={{ leave: leaveRequests.filter((l) => l.status === "Pending").length, dashboard: roster.filter((s) => s.status === "Missed").length }} />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar breadcrumb={breadcrumbFor(route)} onOpenMobileNav={() => setMobileNavOpen(true)} onLogout={() => { pushToast({ title: "Logged out", body: "You have been signed out safely." }); setTimeout(() => onExitToPortal?.(), 300); }} />
          <main key={route} className="flex-1 p-4 md:p-7 hgapp-animate-in max-w-full overflow-x-hidden">{PAGES[route]}</main>
        </div>
      </div>
      <ToastStack toasts={toasts} />
    </div>
  );
}
