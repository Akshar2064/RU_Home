import { useState } from "react";
import {
  ChevronRight, Clock, Car, Building2, LogOut as ExitIcon, ShieldCheck,
  CalendarClock, Repeat, Search,
} from "lucide-react";
import { Card, Badge, Avatar, EmptyState, Button, Input } from "../ui.jsx";
import { Row } from "./Scan.jsx";

const TABS = [
  { key: "expected", label: "Expected" },
  { key: "current", label: "Inside" },
  { key: "history", label: "History" },
];

export function VisitorsList({ expected, active, history, recurring, onSelect, initialTab = "expected" }) {
  const [tab, setTab] = useState(initialTab);
  const [query, setQuery] = useState("");

  const list = tab === "expected" ? expected : tab === "current" ? active : history;
  const filtered = query
    ? list.filter((v) => v.name.toLowerCase().includes(query.toLowerCase()) || (v.flat || "").toLowerCase().includes(query.toLowerCase()))
    : list;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ border: "1px solid var(--color-border)", background: "#fff" }}>
        <Search size={16} style={{ color: "var(--color-text-tertiary)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search visitor name or flat"
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      <div className="inline-flex w-full p-1 rounded-xl" style={{ background: "var(--color-navy-50)" }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 text-xs font-bold rounded-lg py-2 transition"
            style={{ background: tab === t.key ? "#fff" : "transparent", color: tab === t.key ? "var(--color-navy-900)" : "var(--color-text-secondary)" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {recurring.length > 0 && tab === "expected" && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--color-text-tertiary)" }}>Recurring visitors due</p>
          <div className="space-y-2">
            {recurring.map((v) => (
              <Card key={v.id} className="p-4 flex items-center gap-3" onClick={() => onSelect(v, "recurring")}>
                <Avatar initials={v.name.slice(0, 2).toUpperCase()} tone="marigold" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold truncate">{v.name}</p>
                    <Repeat size={12} style={{ color: "var(--color-marigold-600)" }} />
                  </div>
                  <p className="text-[11px] truncate" style={{ color: "var(--color-text-secondary)" }}>{v.type} · {v.flat} · {v.schedule}</p>
                </div>
                <ChevronRight size={16} style={{ color: "var(--color-text-tertiary)" }} />
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        {filtered.length === 0 ? (
          <EmptyState title="No visitors here" body={`There are no ${tab === "current" ? "visitors currently inside" : tab} visitors matching your search.`} />
        ) : (
          <div className="space-y-2">
            {filtered.map((v) => (
              <Card key={v.id} className="p-4 flex items-center gap-3" onClick={() => onSelect(v, tab)}>
                <Avatar initials={v.name.slice(0, 2).toUpperCase()} tone="navy" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{v.name}</p>
                  <p className="text-[11px] truncate" style={{ color: "var(--color-text-secondary)" }}>
                    {v.type} · {v.flat} {v.window ? `· ${v.window}` : v.entryTime ? `· in at ${v.entryTime}` : v.date ? `· ${v.date}` : ""}
                  </p>
                </div>
                {tab === "history" ? (
                  <Badge tone={v.status === "Denied" ? "danger" : "neutral"} size="sm">{v.status}</Badge>
                ) : (
                  <ChevronRight size={16} style={{ color: "var(--color-text-tertiary)" }} />
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function VisitorDetail({ visitor, kind, onExit }) {
  if (!visitor) return null;
  const isActive = kind === "current";
  const isHistory = kind === "history";
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Avatar initials={visitor.name.slice(0, 2).toUpperCase()} size={48} tone="navy" />
          <div className="flex-1">
            <p className="text-base font-bold">{visitor.name}</p>
            <Badge tone="info" size="sm">{visitor.type}</Badge>
          </div>
        </div>
        <div className="space-y-2.5 text-xs">
          <Row icon={Building2} label="Flat" value={visitor.flat} />
          {visitor.vehicle && visitor.vehicle !== "—" && <Row icon={Car} label="Vehicle" value={visitor.vehicle} />}
          {visitor.entryTime && <Row icon={Clock} label="Entry time" value={visitor.entryTime} />}
          {visitor.exitTime && visitor.exitTime !== "—" && <Row icon={ExitIcon} label="Exit time" value={visitor.exitTime} />}
          {visitor.window && <Row icon={CalendarClock} label="Expected window" value={visitor.window} />}
          {visitor.verificationMethod && <Row icon={ShieldCheck} label="Verified via" value={visitor.verificationMethod} />}
        </div>
      </Card>

      <Card className="p-4">
        <p className="text-xs font-bold mb-2" style={{ color: "var(--color-text-tertiary)" }}>STATUS</p>
        <Badge tone={isHistory ? (visitor.status === "Denied" ? "danger" : "neutral") : isActive ? "success" : "info"}>
          {isHistory ? visitor.status : isActive ? "Currently inside" : "Expected"}
        </Badge>
      </Card>

      {isActive && (
        <Button variant="danger" full size="lg" icon={ExitIcon} onClick={() => onExit(visitor)}>
          Record Exit
        </Button>
      )}
    </div>
  );
}

export function RecurringConfirm({ visitor, onConfirm }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "var(--color-marigold-50)" }}>
        <Repeat size={22} style={{ color: "var(--color-marigold-600)" }} />
        <div>
          <p className="text-sm font-bold" style={{ color: "var(--color-marigold-600)" }}>Recognized Recurring Visitor</p>
          <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>Previously verified — no need to re-check documents.</p>
        </div>
      </div>
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Avatar initials={visitor.name.slice(0, 2).toUpperCase()} size={48} tone="navy" />
          <div>
            <p className="text-base font-bold">{visitor.name}</p>
            <Badge tone="info" size="sm">{visitor.type}</Badge>
          </div>
        </div>
        <div className="space-y-2.5 text-xs">
          <Row icon={Building2} label="Visiting" value={`${visitor.resident} · ${visitor.flat}`} />
          <Row icon={CalendarClock} label="Schedule" value={visitor.schedule} />
          {visitor.vehicle !== "—" && <Row icon={Car} label="Vehicle" value={visitor.vehicle} />}
        </div>
      </Card>
      <Card className="p-4">
        <p className="text-xs font-bold mb-1" style={{ color: "var(--color-text-tertiary)" }}>Last verified</p>
        <p className="text-xs font-semibold">{visitor.lastVerified}</p>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>by {visitor.verifiedBy}</p>
      </Card>
      <Button variant="success" full size="lg" onClick={onConfirm}>Confirm &amp; Record Entry</Button>
    </div>
  );
}

export function ExitPicker({ active, onPick }) {
  if (active.length === 0) {
    return <EmptyState icon={ExitIcon} title="No one to exit" body="There are no visitors currently inside to check out." />;
  }
  return (
    <div className="space-y-2">
      {active.map((v) => (
        <Card key={v.id} className="p-4 flex items-center gap-3" onClick={() => onPick(v)}>
          <Avatar initials={v.name.slice(0, 2).toUpperCase()} tone="navy" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{v.name}</p>
            <p className="text-[11px] truncate" style={{ color: "var(--color-text-secondary)" }}>{v.flat} · in since {v.entryTime}</p>
          </div>
          <ChevronRight size={16} style={{ color: "var(--color-text-tertiary)" }} />
        </Card>
      ))}
    </div>
  );
}

export function ExitConfirm({ visitor, onConfirm }) {
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <Avatar initials={visitor.name.slice(0, 2).toUpperCase()} size={48} tone="navy" />
          <div>
            <p className="text-base font-bold">{visitor.name}</p>
            <Badge tone="info" size="sm">{visitor.type}</Badge>
          </div>
        </div>
        <div className="space-y-2.5 text-xs">
          <Row icon={Building2} label="Flat" value={visitor.flat} />
          <Row icon={Clock} label="Entry time" value={visitor.entryTime} />
          {visitor.vehicle !== "—" && <Row icon={Car} label="Vehicle" value={visitor.vehicle} />}
        </div>
      </Card>
      <Button variant="danger" full size="lg" icon={ExitIcon} onClick={onConfirm}>Confirm Exit</Button>
    </div>
  );
}
