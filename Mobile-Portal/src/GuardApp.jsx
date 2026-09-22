  import { useState } from "react";
import {
  ArrowLeft, Home, Users, Footprints, AlertTriangle, MoreHorizontal, QrCode,
  ShieldAlert, CheckCircle2, XCircle, Car, Wrench, MapPin, Clock, Bell,
} from "lucide-react";

import { Toast, Modal } from "./ui.jsx";
import Login from "./screens/Login.jsx";
import Home_ from "./screens/Home.jsx";
import { ScanQR, VisitorVerify } from "./screens/Scan.jsx";
import { OtpEntry, OtpResult } from "./screens/Otp.jsx";
import ManualEntry from "./screens/ManualEntry.jsx";
import ResultScreen from "./screens/Result.jsx";
import { VisitorsList, VisitorDetail, RecurringConfirm, ExitPicker, ExitConfirm } from "./screens/Visitors.jsx";
import Parking from "./screens/Parking.jsx";
import VehicleCheck from "./screens/Vehicle.jsx";
import Staff from "./screens/Staff.jsx";
import PatrolScreen from "./screens/Patrol.jsx";
import { IncidentsList, IncidentCreate } from "./screens/Incidents.jsx";
import Sos from "./screens/Sos.jsx";
import { ShiftScreen, HandoverScreen } from "./screens/Shift.jsx";
import Notifications from "./screens/Notifications.jsx";
import Profile from "./screens/Profile.jsx";
import TeamOversight from "./screens/TeamOversight.jsx";

import {
  GUARD, HEAD_GUARD, EXPECTED_VISITORS, RECURRING_VISITORS, ACTIVE_VISITORS,
  VISITOR_HISTORY, PARKING_SLOTS, STAFF_WORKERS, PATROL_ROUTE, PATROL_HISTORY,
  INCIDENTS, HANDOVER_NOTES, TEAM_HANDOVER_NOTES, NOTIFICATIONS, QR_SAMPLES, OTP_SAMPLES,
} from "./mockData.js";

const ROOT_TABS = ["home", "visitors", "patrol", "incidents"];

const TITLES = {
  visitors: "Visitors",
  "visitor-detail": "Visitor Details",
  "recurring-confirm": "Recurring Visitor",
  "exit-picker": "Visitor Exit",
  "exit-confirm": "Confirm Exit",
  scan: "Scan Visitor QR",
  "visitor-verify": "Verify Visitor",
  "otp-entry": "Verify OTP",
  "otp-result": "OTP Result",
  "manual-entry": "Manual Visitor Entry",
  parking: "Visitor Parking",
  staff: "Staff & Service Workers",
  vehicle: "Vehicle Check",
  patrol: "Patrol",
  incidents: "Incidents",
  "incident-create": "Report Incident",
  sos: "Emergency",
  shift: "Shift & Attendance",
  handover: "Shift Handover",
  notifications: "Notifications",
  profile: "My Profile",
  "action-result": "",
  "team-oversight": "Handover Notes · All Gates",
};

function nowTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function GuardApp({ onExitToPortal, role = "guard" }) {
  const isHeadGuard = role === "head_guard";
  const profile = isHeadGuard ? HEAD_GUARD : GUARD;
  const [authenticated, setAuthenticated] = useState(true);
  const [gate, setGate] = useState(profile.gate);

  const [screen, setScreen] = useState("home");
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);

  // Visitor data
  const [expected, setExpected] = useState(EXPECTED_VISITORS);
  const [recurring] = useState(RECURRING_VISITORS);
  const [active, setActive] = useState(ACTIVE_VISITORS);
  const [visitorHistory, setVisitorHistory] = useState(VISITOR_HISTORY);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [selectedKind, setSelectedKind] = useState("expected");
  const [visitorsInitialTab, setVisitorsInitialTab] = useState("expected");

  // Verification flow state
  const [qrResultKey, setQrResultKey] = useState("valid");
  const [otpResultKey, setOtpResultKey] = useState("valid");

  // Parking / staff / vehicle
  const [slots, setSlots] = useState(PARKING_SLOTS);
  const [workers, setWorkers] = useState(STAFF_WORKERS);

  // Patrol
  const [route, setRoute] = useState(PATROL_ROUTE);

  // Incidents
  const [incidents, setIncidents] = useState(INCIDENTS);

  // Shift / handover
  const [onDuty, setOnDuty] = useState(true);
  const [handoverNotes, setHandoverNotes] = useState(HANDOVER_NOTES);

  // Notifications
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  // SOS
  const [sosState, setSosState] = useState("confirm");

  // Generic result screen config
  const [resultConfig, setResultConfig] = useState(null);

  function go(next) {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  }
  function back() {
    setHistory((h) => {
      if (h.length === 0) {
        setScreen("home");
        return h;
      }
      const prev = h[h.length - 1];
      setScreen(prev);
      return h.slice(0, -1);
    });
  }
  function navTo(tab) {
    setHistory([]);
    setScreen(tab);
  }
  function notify(title, body, tone = "success") {
    setToast({ title, body, tone });
    window.setTimeout(() => setToast(null), 2800);
  }
  function showResult(config) {
    setResultConfig(config);
    go("action-result");
  }

  function admitVisitor({ name, type, flat, tower, resident, vehicle, verificationMethod }) {
    const entry = {
      id: `act-${Date.now()}`,
      name, type, flat: flat || "—", tower: tower || "—", resident: resident || flat || "—",
      entryTime: nowTime(), vehicle: vehicle || "—", verificationMethod, parkingSlot: null,
    };
    setActive((a) => [entry, ...a]);
    setExpected((e) => e.filter((v) => v.name !== name));
    notify("Resident Notified", `${resident || flat} has been notified of ${name}'s arrival.`);
    showResult({
      tone: "success",
      icon: CheckCircle2,
      title: "Entry Recorded",
      body: `${name} has been checked in via ${verificationMethod}. The resident has been notified.`,
      details: [
        { label: "Visitor", value: name },
        { label: "Flat", value: flat || "—" },
        { label: "Entry time", value: entry.entryTime },
        { label: "Verified via", value: verificationMethod },
      ],
      primaryLabel: "Back to Home",
      onPrimary: () => navTo("home"),
      secondaryLabel: "Allocate Parking",
      onSecondary: vehicle && vehicle !== "—" ? () => navTo("parking") : undefined,
    });
  }

  function denyVisitor({ name, flat, reason }) {
    setVisitorHistory((h) => [{ id: `hist-${Date.now()}`, name, type: "Guest", flat: flat || "—", entryTime: "—", exitTime: "—", date: "Today", status: "Denied" }, ...h]);
    showResult({
      tone: "danger",
      icon: XCircle,
      title: "Entry Denied",
      body: reason || `${name} was not admitted at ${gate}.`,
      primaryLabel: "Back to Home",
      onPrimary: () => navTo("home"),
    });
  }

  // ---- Visitors list / detail / exit -------------------------------------
  function handleVisitorSelect(v, kind) {
    setSelectedVisitor(v);
    setSelectedKind(kind);
    if (kind === "recurring") go("recurring-confirm");
    else go("visitor-detail");
  }
  function handleExitVisitor(v) {
    setActive((a) => a.filter((x) => x.id !== v.id));
    setVisitorHistory((h) => [{ ...v, exitTime: nowTime(), date: "Today", status: "Exited" }, ...h]);
    showResult({
      tone: "success",
      icon: CheckCircle2,
      title: "Exit Recorded",
      body: `${v.name} has checked out.`,
      details: [{ label: "Flat", value: v.flat }, { label: "Duration", value: `${v.entryTime} → ${nowTime()}` }],
      primaryLabel: "Back to Home",
      onPrimary: () => navTo("home"),
    });
  }

  // ---- Screen title / nav helpers -----------------------------------------
  const isRoot = ROOT_TABS.includes(screen);
  const title = TITLES[screen];
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const recentActivity = [...visitorHistory].slice(0, 4);
  const patrolProgress = `${route.checkpoints.filter((c) => c.status === "done").length}/${route.checkpoints.length}`;

  if (!authenticated) {
    return <Login onLogin={(g) => { setGate(g); setAuthenticated(true); setScreen("home"); }} />;
  }

  return (
    <div className="min-h-[100dvh] w-full flex justify-center" style={{ background: "var(--color-bg)" }}>
      <div className="w-full max-w-[520px] min-h-[100dvh] flex flex-col relative" style={{ background: "var(--color-bg)" }}>
        {screen !== "sos" && (
          <TopBar
            screen={screen}
            title={title}
            isRoot={isRoot}
            onBack={!isRoot ? back : undefined}
            gate={gate}
            onDuty={onDuty}
            onBell={() => go("notifications")}
            unread={unreadNotifications}
            appLabel={isHeadGuard ? "Head Guard" : "Guard App"}
          />
        )}

        <main className={`flex-1 px-4 ${screen === "sos" ? "pt-6 pb-6" : "pt-3 pb-44"}`}>
          {screen === "home" && (
            <Home_
              gate={gate}
              profile={profile}
              expectedCount={expected.length}
              activeCount={active.length}
              recentActivity={recentActivity}
              patrolProgress={patrolProgress}
              go={(key) => {
                if (key === "entry") go("manual-entry");
                else if (key === "exit") go("exit-picker");
                else if (key === "otp") go("otp-entry");
                else if (key === "search") { setVisitorsInitialTab("expected"); go("visitors"); }
                else if (key === "incident") go("incidents");
                else go(key);
              }}
            />
          )}

          {screen === "visitors" && (
            <VisitorsList
              expected={expected} active={active} history={visitorHistory} recurring={recurring}
              onSelect={handleVisitorSelect} initialTab={visitorsInitialTab}
            />
          )}
          {screen === "visitor-detail" && (
            <VisitorDetail visitor={selectedVisitor} kind={selectedKind} onExit={(v) => { setSelectedVisitor(v); go("exit-confirm"); }} />
          )}
          {screen === "recurring-confirm" && (
            <RecurringConfirm
              visitor={selectedVisitor}
              onConfirm={() => admitVisitor({ name: selectedVisitor.name, type: selectedVisitor.type, flat: selectedVisitor.flat, tower: selectedVisitor.tower, resident: selectedVisitor.resident, vehicle: selectedVisitor.vehicle, verificationMethod: "Recurring" })}
            />
          )}
          {screen === "exit-picker" && (
            <ExitPicker active={active} onPick={(v) => { setSelectedVisitor(v); go("exit-confirm"); }} />
          )}
          {screen === "exit-confirm" && (
            <ExitConfirm visitor={selectedVisitor} onConfirm={() => handleExitVisitor(selectedVisitor)} />
          )}

          {screen === "scan" && (
            <ScanQR onScanned={(key) => { setQrResultKey(key); go("visitor-verify"); }} onManualEntry={() => go("otp-entry")} />
          )}
          {screen === "visitor-verify" && (
            <VisitorVerify
              resultKey={qrResultKey}
              onApprove={() => {
                const d = QR_SAMPLES[qrResultKey];
                admitVisitor({ name: d.name, type: d.type, flat: d.flat, tower: d.tower, resident: d.resident, vehicle: d.vehicle, verificationMethod: "QR" });
              }}
              onRescan={() => go("scan")}
              onOtpFallback={() => go("otp-entry")}
              onManualFallback={() => go("manual-entry")}
              onDeny={() => {
                const d = QR_SAMPLES[qrResultKey];
                denyVisitor({ name: d.name || "Visitor", flat: d.flat, reason: "Pass could not be verified at the gate." });
              }}
            />
          )}

          {screen === "otp-entry" && (
            <OtpEntry onVerified={(outcome) => { setOtpResultKey(outcome); go("otp-result"); }} />
          )}
          {screen === "otp-result" && (
            <OtpResult
              outcomeKey={otpResultKey}
              onRetry={() => go("otp-entry")}
              onManualFallback={() => go("manual-entry")}
              onDeny={() => {
                const d = OTP_SAMPLES[otpResultKey];
                denyVisitor({ name: d.name || "Visitor", flat: d.flat, reason: "OTP verification failed at the gate." });
              }}
              onApprove={() => {
                const d = OTP_SAMPLES[otpResultKey];
                admitVisitor({ name: d.name, type: d.type, flat: d.flat, tower: d.tower, resident: d.resident, vehicle: d.vehicle, verificationMethod: "OTP" });
              }}
            />
          )}

          {screen === "manual-entry" && (
            <ManualEntry onRegister={(form) => admitVisitor({ name: form.name, type: form.type, flat: form.flat, resident: form.flat, vehicle: form.vehicle, verificationMethod: "Manual" })} />
          )}

          {screen === "parking" && (
            <Parking
              slots={slots}
              onAllocate={(id) => {
                setSlots((s) => s.map((x) => (x.id === id ? { ...x, status: "occupied", vehicle: "Manual allocation", visitor: "Walk-in visitor", flat: "—" } : x)));
                notify("Parking Allocated", `Slot ${id} has been assigned.`);
              }}
              onRelease={(id) => {
                setSlots((s) => s.map((x) => (x.id === id ? { id: x.id, status: "available" } : x)));
                notify("Parking Released", `Slot ${id} is now available.`);
              }}
            />
          )}

          {screen === "staff" && (
            <Staff
              workers={workers}
              onEntry={(id) => {
                setWorkers((w) => w.map((x) => (x.id === id ? { ...x, status: "Inside", entryTime: nowTime() } : x)));
                showResult({ tone: "success", icon: CheckCircle2, title: "Worker Checked In", body: "Entry has been recorded for this service worker.", primaryLabel: "Back to Staff List", onPrimary: () => navTo("staff") });
              }}
              onExit={(id) => {
                setWorkers((w) => w.map((x) => (x.id === id ? { ...x, status: "Outside", entryTime: undefined } : x)));
                showResult({ tone: "success", icon: CheckCircle2, title: "Worker Checked Out", body: "Exit has been recorded for this service worker.", primaryLabel: "Back to Staff List", onPrimary: () => navTo("staff") });
              }}
            />
          )}

          {screen === "vehicle" && <VehicleCheck onManualVerify={() => go("manual-entry")} />}

          {screen === "patrol" && (
            <PatrolScreen
              route={route}
              history={PATROL_HISTORY}
              onScanCheckpoint={(id) => {
                setRoute((r) => {
                  const idx = r.checkpoints.findIndex((c) => c.id === id);
                  const checkpoints = r.checkpoints.map((c, i) => {
                    if (c.id === id) return { ...c, status: "done", time: nowTime() };
                    if (i === idx + 1) return { ...c, status: "current" };
                    return c;
                  });
                  return { ...r, checkpoints };
                });
                const cp = route.checkpoints.find((c) => c.id === id);
                showResult({ tone: "success", icon: CheckCircle2, title: "Checkpoint Complete", body: `${cp?.name || "Checkpoint"} marked complete.`, primaryLabel: "Continue Patrol", onPrimary: () => navTo("patrol") });
              }}
            />
          )}

          {screen === "incidents" && <IncidentsList incidents={incidents} onCreate={() => go("incident-create")} />}
          {screen === "incident-create" && (
            <IncidentCreate
              onSubmit={(form) => {
                const id = `INC-${240 + incidents.length + 1}`;
                setIncidents((list) => [{ id, category: form.category, location: form.location || "Not specified", description: form.description, status: "Open", time: `Today, ${nowTime()}`, reportedBy: GUARD.employeeId }, ...list]);
                showResult({ tone: "success", icon: CheckCircle2, title: "Incident Reported", body: "The incident has been logged and sent to the security desk.", details: [{ label: "Incident ID", value: id }, { label: "Status", value: "Open" }], primaryLabel: "Back to Incidents", onPrimary: () => navTo("incidents") });
              }}
            />
          )}

          {screen === "sos" && (
            <Sos
              state={sosState}
              onConfirm={() => setSosState("active")}
              onCancel={() => { setSosState("confirm"); navTo("home"); }}
              onEnd={() => { setSosState("confirm"); navTo("home"); notify("Alert Ended", "The emergency alert has been closed.", "success"); }}
            />
          )}

          {screen === "shift" && (
            <ShiftScreen
              onDuty={onDuty}
              gate={gate}
              profile={profile}
              onCheckIn={() => { setOnDuty(true); notify("Checked In", "Your shift has started."); }}
              onCheckOut={() => { setOnDuty(false); notify("Checked Out", "Your shift has ended.", "warning"); }}
              onHandover={() => go("handover")}
            />
          )}
          {screen === "handover" && (
            <HandoverScreen
              notes={handoverNotes}
              activeCount={active.length}
              openIncidentsCount={incidents.filter((i) => i.status !== "Resolved").length}
              onAddNote={(text) => setHandoverNotes((n) => [{ id: `h-${Date.now()}`, from: profile.name, time: `Today, ${nowTime()}`, note: text }, ...n])}
              onComplete={() => showResult({ tone: "success", icon: CheckCircle2, title: "Handover Completed", body: "The incoming guard has been notified and given your notes.", primaryLabel: "Back to Home", onPrimary: () => navTo("home") })}
            />
          )}

          {screen === "notifications" && (
            <Notifications notifications={notifications} onMarkAllRead={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))} />
          )}
          {screen === "profile" && (
            <Profile
              gate={gate}
              profile={profile}
              roleLabel={isHeadGuard ? "Head Guard" : "Security"}
              onLogout={() => { setHistory([]); setScreen("home"); onExitToPortal?.(); }}
            />
          )}

          {screen === "team-oversight" && isHeadGuard && <TeamOversight notes={TEAM_HANDOVER_NOTES} />}

          {screen === "action-result" && resultConfig && <ResultScreen {...resultConfig} />}
        </main>

        {screen !== "sos" && (
          <>
            <FloatingActions screen={screen} isRoot={isRoot} onScan={() => go("scan")} onSos={() => { setSosState("confirm"); go("sos"); }} />
            <BottomNav active={screen} onChange={navTo} onMore={() => setMoreOpen(true)} />
          </>
        )}

        <Toast toast={toast} onDismiss={() => setToast(null)} />

        <Modal open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
          <div className="grid grid-cols-2 gap-2.5">
            <MoreItem icon={Car} label="Parking" onClick={() => { setMoreOpen(false); go("parking"); }} />
            <MoreItem icon={Wrench} label="Staff & Workers" onClick={() => { setMoreOpen(false); go("staff"); }} />
            <MoreItem icon={Car} label="Vehicle Check" onClick={() => { setMoreOpen(false); go("vehicle"); }} />
            <MoreItem icon={Clock} label="Shift & Attendance" onClick={() => { setMoreOpen(false); go("shift"); }} />
            <MoreItem icon={Bell} label="Notifications" onClick={() => { setMoreOpen(false); go("notifications"); }} />
            <MoreItem icon={Users} label="Profile" onClick={() => { setMoreOpen(false); go("profile"); }} />
            {isHeadGuard && (
              <MoreItem icon={Users} label="Team Oversight" onClick={() => { setMoreOpen(false); go("team-oversight"); }} />
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}

function MoreItem({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 rounded-2xl py-4" style={{ border: "1px solid var(--color-border)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--color-navy-50)" }}>
        <Icon size={18} style={{ color: "var(--color-navy-700)" }} />
      </div>
      <span className="text-[11px] font-bold text-center">{label}</span>
    </button>
  );
}

function TopBar({ title, isRoot, onBack, gate, onDuty, onBell, unread, appLabel = "Guard App" }) {
  return (
    <header className="flex items-center justify-between px-4 pt-5 pb-3">
      <div className="flex items-center gap-3">
        {onBack ? (
          <button onClick={onBack} className="guard-focus w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm">
            <ArrowLeft size={19} />
          </button>
        ) : (
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "var(--color-navy-900)" }}>
            <ShieldAlert size={18} color="var(--color-marigold-500)" />
          </div>
        )}
        <div>
          <p className="text-base font-bold">{title || appLabel}</p>
          {isRoot && (
            <p className="text-[11px] flex items-center gap-1" style={{ color: "var(--color-text-secondary)" }}>
              <MapPin size={11} /> {gate} · <span style={{ color: onDuty ? "var(--color-success)" : "var(--color-text-tertiary)" }}>{onDuty ? "On duty" : "Off duty"}</span>
            </p>
          )}
        </div>
      </div>
      <button onClick={onBell} className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm">
        <Bell size={17} style={{ color: "var(--color-text-secondary)" }} />
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{ background: "var(--color-danger)" }}>{unread}</span>}
      </button>
    </header>
  );
}

function FloatingActions({ screen, isRoot, onScan, onSos }) {
  if (screen === "home") return null; // Home has its own inline CTAs
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[520px] px-4 flex justify-between pointer-events-none">
      <button onClick={onSos} className="pointer-events-auto flex items-center gap-1.5 rounded-full px-4 py-3 text-xs font-bold text-white shadow-lg active:scale-95" style={{ background: "var(--color-danger)" }}>
        <ShieldAlert size={15} /> SOS
      </button>
      <button onClick={onScan} className="pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-lg active:scale-95" style={{ background: "var(--color-marigold-500)", color: "var(--color-navy-900)" }}>
        <QrCode size={17} /> Scan QR
      </button>
    </div>
  );
}

function BottomNav({ active, onChange, onMore }) {
  const items = [
    { key: "home", label: "Home", icon: Home },
    { key: "visitors", label: "Visitors", icon: Users },
    { key: "patrol", label: "Patrol", icon: Footprints },
    { key: "incidents", label: "Incidents", icon: AlertTriangle },
  ];
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[520px] flex items-stretch justify-around bg-white/95 backdrop-blur px-1 pt-1.5" style={{ borderTop: "1px solid var(--color-border)", paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}>
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl"
        >
          <span className="w-8 h-7 rounded-full flex items-center justify-center" style={{ background: active === it.key ? "var(--color-navy-50)" : "transparent" }}>
            <it.icon size={18} style={{ color: active === it.key ? "var(--color-navy-800)" : "var(--color-text-tertiary)" }} />
          </span>
          <span className="text-[10px] font-bold" style={{ color: active === it.key ? "var(--color-navy-900)" : "var(--color-text-tertiary)" }}>{it.label}</span>
        </button>
      ))}
      <button onClick={onMore} className="flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl">
        <span className="w-8 h-7 rounded-full flex items-center justify-center">
          <MoreHorizontal size={18} style={{ color: "var(--color-text-tertiary)" }} />
        </span>
        <span className="text-[10px] font-bold" style={{ color: "var(--color-text-tertiary)" }}>More</span>
      </button>
    </nav>
  );
}
