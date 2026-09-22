import { useState } from "react";
import { Car, Search, CheckCircle2, X } from "lucide-react";
import { Button, Card } from "../ui.jsx";

const STATUS_TONE = { available: "success", occupied: "danger", reserved: "warning" };

export default function Parking({ slots, onAllocate, onRelease }) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(null);

  const counts = {
    available: slots.filter((s) => s.status === "available").length,
    occupied: slots.filter((s) => s.status === "occupied").length,
    reserved: slots.filter((s) => s.status === "reserved").length,
  };

  const matched = query
    ? slots.filter((s) => (s.vehicle || "").toLowerCase().includes(query.toLowerCase()) || (s.visitor || "").toLowerCase().includes(query.toLowerCase()))
    : null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2.5">
        <Card className="p-3 text-center"><p className="text-xl font-bold" style={{ color: "var(--color-success)" }}>{counts.available}</p><p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>Available</p></Card>
        <Card className="p-3 text-center"><p className="text-xl font-bold" style={{ color: "var(--color-danger)" }}>{counts.occupied}</p><p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>Occupied</p></Card>
        <Card className="p-3 text-center"><p className="text-xl font-bold" style={{ color: "var(--color-warning)" }}>{counts.reserved}</p><p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>Reserved</p></Card>
      </div>

      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ border: "1px solid var(--color-border)", background: "#fff" }}>
        <Search size={16} style={{ color: "var(--color-text-tertiary)" }} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search vehicle number or visitor" className="w-full text-sm outline-none bg-transparent" />
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>Visitor parking map</p>
        <div className="grid grid-cols-4 gap-2.5">
          {(matched || slots).map((s) => (
            <button
              key={s.id}
              onClick={() => s.status === "available" && setPicked(s)}
              className="rounded-xl py-4 flex flex-col items-center gap-1 transition"
              style={{
                background: s.status === "available" ? "var(--color-success-bg)" : s.status === "occupied" ? "var(--color-danger-bg)" : "var(--color-warning-bg)",
                border: picked?.id === s.id ? "2px solid var(--color-navy-800)" : "1px solid transparent",
              }}
            >
              <Car size={16} style={{ color: `var(--color-${STATUS_TONE[s.status]})` }} />
              <span className="text-[11px] font-bold">{s.id}</span>
            </button>
          ))}
        </div>
      </div>

      {matched && matched.length > 0 && (
        <div className="space-y-2">
          {matched.filter((s) => s.status === "occupied").map((s) => (
            <Card key={s.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{s.vehicle}</p>
                <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{s.visitor} · {s.flat} · Slot {s.id}</p>
              </div>
              <Button variant="secondary" size="sm" icon={X} onClick={() => onRelease(s.id)}>Release</Button>
            </Card>
          ))}
        </div>
      )}

      {!matched && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>Occupied slots</p>
          <div className="space-y-2">
            {slots.filter((s) => s.status === "occupied").map((s) => (
              <Card key={s.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{s.vehicle}</p>
                  <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{s.visitor} · {s.flat} · Slot {s.id}</p>
                </div>
                <Button variant="secondary" size="sm" icon={X} onClick={() => onRelease(s.id)}>Release</Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {picked && (
        <Card className="p-4 flex items-center justify-between" style={{ borderColor: "var(--color-navy-800)" }}>
          <div>
            <p className="text-xs font-bold" style={{ color: "var(--color-text-tertiary)" }}>Allocate slot</p>
            <p className="text-sm font-bold">{picked.id} · recommended, closest to gate</p>
          </div>
          <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => { onAllocate(picked.id); setPicked(null); }}>Allocate</Button>
        </Card>
      )}
    </div>
  );
}
