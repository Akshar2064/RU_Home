import React, { useState } from "react";
import {
  LayoutDashboard, CalendarClock, ClipboardList, MessageSquare,
  ChevronRight, ChevronLeft, LogOut, Plus, Check, X, MapPin,
  AlertTriangle, CheckCircle2, ShieldPlus,
} from "lucide-react";

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
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      :root {
        --color-navy-900: #14213D; --color-navy-800: #1B2B4B; --color-navy-700: #24365E; --color-navy-50: #EEF1F7;
        --color-bg: #F5F6FA; --color-surface: #FFFFFF; --color-border: #E4E7EE;
        --color-marigold-500: #F2A93B; --color-marigold-600: #DB9424; --color-marigold-50: #FDF3DE;
        --color-text-primary: #1A2130; --color-text-secondary: #626B80; --color-text-tertiary: #9198A9;
        --color-success: #2F9E68; --color-success-bg: #E7F6EE;
        --color-danger: #D64545; --color-danger-bg: #FCEAEA;
        --color-warning: #C9860B; --color-warning-bg: #FDF3DC;
        --color-info: #3B6FD8; --color-info-bg: #EAF0FC;
      }
      * { box-sizing: border-box; }
      .hgapp-root { font-family: 'Inter', sans-serif; color: var(--color-text-primary); }
      .hgapp-heading { font-family: 'Sora', sans-serif; }
      .hgapp-focus:focus-visible { outline: 2px solid var(--color-navy-700); outline-offset: 2px; }
      @keyframes hgapp-fade-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      .hgapp-animate-in { animation: hgapp-fade-in 0.2s ease-out; }
      .hgapp-btn { font-weight: 600; transition: filter .15s ease, transform .1s ease; }
      .hgapp-btn:active { transform: scale(0.98); }
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
    success: { fg: "var(--color-success)", bg: "var(--color-success-bg)" },
    warning: { fg: "var(--color-warning)", bg: "var(--color-warning-bg)" },
    danger: { fg: "var(--color-danger)", bg: "var(--color-danger-bg)" },
    info: { fg: "var(--color-info)", bg: "var(--color-info-bg)" },
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(20,33,61,0.45)" }} onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl hgapp-animate-in max-h-[88vh] flex flex-col">
        <div className="flex items-start justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div><h2 className="hgapp-heading text-lg font-bold">{title}</h2>{subtitle && <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{subtitle}</p>}</div>
          <button onClick={onClose} className="hgapp-focus w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ color: "var(--color-text-secondary)" }}><X size={17} /></button>
        </div>
        <div className="px-6 py-5 overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: "1px solid var(--color-border)" }}>{footer}</div>}
      </div>
    </div>
  );
}

function ToastStack({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 w-[320px]">
      {toasts.map((t) => (
        <div key={t.id} className="rounded-xl px-4 py-3 shadow-lg hgapp-animate-in" style={{ background: t.tone === "danger" ? "var(--color-danger)" : "var(--color-navy-900)", color: "#fff" }}>
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

function Sidebar({ route, onNavigate, collapsed, onToggleCollapse }) {
  return (
    <aside className={`hidden md:flex flex-col shrink-0 h-screen sticky top-0 transition-[width] duration-200 relative ${collapsed ? "w-[76px]" : "w-[248px]"}`} style={{ background: "var(--color-navy-900)" }}>
      <div className={`flex items-center gap-2.5 px-4 h-16 shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--color-marigold-500)" }}><ShieldPlus size={18} style={{ color: "var(--color-navy-900)" }} /></div>
        {!collapsed && <div className="min-w-0"><p className="hgapp-heading text-white font-semibold text-sm leading-tight truncate">RUhome</p><p className="text-[11px] leading-tight" style={{ color: "rgba(255,255,255,0.5)" }}>Head Guard</p></div>}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = route === item.key;
          return (
            <button key={item.key} onClick={() => onNavigate(item.key)} title={collapsed ? item.label : undefined}
              className={`hgapp-focus w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${collapsed ? "justify-center" : ""}`}
              style={{ background: active ? "rgba(242,169,59,0.14)" : "transparent", color: active ? "var(--color-marigold-500)" : "rgba(255,255,255,0.72)" }}>
              <item.icon size={17} strokeWidth={2} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <button onClick={onToggleCollapse} className="hgapp-focus absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center shadow" style={{ background: "#fff", border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }}>
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  );
}

function TopBar({ breadcrumb, onLogout }) {
  return (
    <header className="h-16 shrink-0 flex items-center justify-between px-4 md:px-7" style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      <div>
        <p className="text-sm font-semibold">{breadcrumb}</p>
        <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>Scope: {HEAD_GUARD.scope}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold leading-tight">{HEAD_GUARD.name}</p>
          <p className="text-[11px] leading-tight" style={{ color: "var(--color-text-tertiary)" }}>{HEAD_GUARD.employeeId} · Head Guard</p>
        </div>
        <Avatar initials={HEAD_GUARD.initials} size={34} />
        <button onClick={onLogout} className="hgapp-focus w-9 h-9 rounded-full flex items-center justify-center" style={{ border: "1px solid var(--color-border)", color: "var(--color-text-secondary)" }} title="Log out">
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
      <PageHeader title={`Good morning, ${HEAD_GUARD.name.split(" ")[0]}`} blurb="Here's coverage across every gate right now." />

      {gaps.length > 0 && (
        <div className="rounded-2xl p-4 mb-6 flex items-start gap-3" style={{ background: "var(--color-danger-bg)" }}>
          <AlertTriangle size={18} style={{ color: "var(--color-danger)" }} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: "var(--color-danger)" }}>{gaps.length} coverage gap{gaps.length > 1 ? "s" : ""} — no check-in within grace period</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              {gaps.map((g) => `${g.gate} · ${g.window}`).join("  ·  ")}
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => onNavigate("roster")}>Arrange backup</Button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="On duty now" value={onDutyNow} sub={`of ${roster.length} shifts today`} icon={CheckCircle2} tone="var(--color-success)" />
        <StatCard label="Coverage gaps" value={gaps.length} sub="need backup" icon={AlertTriangle} tone={gaps.length ? "var(--color-danger)" : "var(--color-navy-700)"} />
        <StatCard label="Pending leave" value={pendingLeave} sub="awaiting your decision" icon={ClipboardList} />
        <StatCard label="Gates covered" value={GATES.length} sub="society-wide" icon={MapPin} />
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="hgapp-heading font-bold text-[15px]">Live roster · right now</h3>
          <Button variant="secondary" size="sm" onClick={() => onNavigate("roster")}>View full roster</Button>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
          {roster.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-3">
              <Avatar initials={initialsOf(s.guard)} size={30} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{s.guard}</p>
                <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{s.gate} · {s.window}</p>
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

      <Card padded={false}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left" style={{ borderBottom: "1px solid var(--color-border)" }}>
              {["Date", "Gate", "Shift window", "Guard", "Status", "Check-in"].map((h) => (
                <th key={h} className="px-5 py-3 text-xs font-semibold" style={{ color: "var(--color-text-tertiary)" }}>{h}</th>
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
          <Card className="text-center py-10">
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>No leave requests right now.</p>
          </Card>
        )}
        {leaveRequests.map((l) => (
          <Card key={l.id} className="flex items-center gap-4">
            <Avatar initials={initialsOf(l.guard)} size={38} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">{l.guard}</p>
                <Badge tone={LEAVE_STATUS_TONE[l.status]}>{l.status}</Badge>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{l.shiftLabel}</p>
              <p className="text-xs mt-1">{l.reason}</p>
              <p className="text-[11px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>Requested {l.requestedOn}</p>
            </div>
            {l.status === "Pending" && (
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary" size="sm" icon={X} onClick={() => onDecide(l.id, "Rejected")}>Reject</Button>
                <Button variant="success" size="sm" icon={Check} onClick={() => onDecide(l.id, "Approved")}>Approve</Button>
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
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold" style={{ color: "var(--color-navy-700)" }}>{n.gate}</span>
              <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{n.time}</span>
            </div>
            <p className="text-sm">{n.note}</p>
            <p className="text-[11px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>Logged by {n.guard}</p>
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
        <Sidebar route={route} onNavigate={setRoute} collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar breadcrumb={breadcrumbFor(route)} onLogout={() => { pushToast({ title: "Logged out", body: "You have been signed out safely." }); setTimeout(() => onExitToPortal?.(), 300); }} />
          <main className="flex-1 p-4 md:p-7 hgapp-animate-in max-w-full overflow-x-hidden">{PAGES[route]}</main>
        </div>
      </div>
      <ToastStack toasts={toasts} />
    </div>
  );
}
