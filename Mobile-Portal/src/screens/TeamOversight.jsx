import { Users } from "lucide-react";
import { Card, EmptyState } from "../ui.jsx";

// Head-Guard-only screen: handover notes across every gate, not just the
// signed-in guard's own shift.
export default function TeamOversight({ notes }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>
          Handover notes · all gates
        </p>
        {notes.length === 0 ? (
          <EmptyState icon={Users} title="No handover notes" body="Nothing has been handed over across any gate yet." />
        ) : (
          <div className="space-y-2">
            {notes.map((n) => (
              <Card key={n.id} className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold">{n.gate}</span>
                  <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>{n.time}</span>
                </div>
                <p className="text-xs">{n.note}</p>
                <p className="text-[10px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>Logged by {n.from}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
