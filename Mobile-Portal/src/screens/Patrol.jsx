import { CheckCircle2, Circle, MapPin, ScanLine, XCircle } from "lucide-react";
import { Card, Badge, Button } from "../ui.jsx";

const STATUS_ICON = { done: CheckCircle2, current: ScanLine, pending: Circle, missed: XCircle };
const STATUS_COLOR = { done: "var(--color-success)", current: "var(--color-marigold-600)", pending: "var(--color-text-tertiary)", missed: "var(--color-danger)" };

export default function Patrol({ route, history, onScanCheckpoint }) {
  const done = route.checkpoints.filter((c) => c.status === "done").length;
  const total = route.checkpoints.length;
  const current = route.checkpoints.find((c) => c.status === "current");

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-bold">{route.name}</p>
          <Badge tone="info" size="sm">{route.shift}</Badge>
        </div>
        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{done} of {total} checkpoints completed</p>
        <div className="h-2 rounded-full mt-3 overflow-hidden" style={{ background: "var(--color-navy-50)" }}>
          <div className="h-full rounded-full" style={{ width: `${(done / total) * 100}%`, background: "var(--color-success)" }} />
        </div>
      </Card>

      <div className="space-y-0">
        {route.checkpoints.map((cp, i) => {
          const Icon = STATUS_ICON[cp.status];
          return (
            <div key={cp.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: cp.status === "pending" ? "#fff" : "var(--color-navy-50)", border: cp.status === "pending" ? "1px solid var(--color-border)" : "none" }}>
                  <Icon size={18} style={{ color: STATUS_COLOR[cp.status] }} className={cp.status === "current" ? "guard-pulse" : ""} />
                </div>
                {i < route.checkpoints.length - 1 && <div className="w-0.5 flex-1 my-1" style={{ background: "var(--color-border)", minHeight: 20 }} />}
              </div>
              <div className="flex-1 pb-5">
                <p className="text-sm font-bold">{cp.name}</p>
                <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>
                  {cp.status === "done" ? `Completed ${cp.time}` : cp.status === "current" ? "Current checkpoint" : cp.status === "missed" ? "Missed" : "Pending"}
                </p>
                {cp.status === "current" && (
                  <Button variant="accent" size="sm" icon={ScanLine} className="mt-2" onClick={() => onScanCheckpoint(cp.id)}>
                    Scan Checkpoint
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>Patrol history</p>
        <div className="space-y-2">
          {history.map((h) => (
            <Card key={h.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MapPin size={16} style={{ color: "var(--color-text-tertiary)" }} />
                <div>
                  <p className="text-xs font-bold">{h.route}</p>
                  <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{h.date}</p>
                </div>
              </div>
              <Badge tone={h.missed > 0 ? "warning" : "success"} size="sm">{h.completed}/{h.total} done</Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
