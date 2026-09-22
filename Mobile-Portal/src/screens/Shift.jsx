import { useState } from "react";
import { MapPin, Clock, LogIn, LogOut as ExitIcon, Users, Plus, CheckCircle2 } from "lucide-react";
import { Button, Card, Badge, TextArea } from "../ui.jsx";
import { GUARD, SHIFT_ROSTER } from "../mockData.js";

export function ShiftScreen({ onDuty, gate, onCheckIn, onCheckOut, onHandover, profile = GUARD }) {
  return (
    <div className="space-y-5">
      <Card className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>Current shift</p>
        <div className="flex items-center gap-2.5 mb-2">
          <MapPin size={16} style={{ color: "var(--color-navy-700)" }} />
          <span className="text-sm font-bold">{gate}</span>
        </div>
        <div className="flex items-center gap-2.5 mb-4">
          <Clock size={16} style={{ color: "var(--color-navy-700)" }} />
          <span className="text-sm">{profile.shiftLabel} · {profile.shiftWindow}</span>
        </div>
        <Badge tone={onDuty ? "success" : "neutral"}>{onDuty ? "ON DUTY" : "OFF DUTY"}</Badge>
      </Card>

      {onDuty ? (
        <Button variant="danger" full size="lg" icon={ExitIcon} onClick={onCheckOut}>Check Out · End Shift</Button>
      ) : (
        <Button variant="success" full size="lg" icon={LogIn} onClick={onCheckIn}>Check In · Start Shift</Button>
      )}

      <Button variant="secondary" full icon={Users} onClick={onHandover}>Shift Handover</Button>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>Today's roster · {gate}</p>
        <div className="space-y-2">
          {SHIFT_ROSTER.map((r, i) => (
            <Card key={i} className="p-4 flex items-center justify-between" style={r.isCurrentUser ? { borderColor: "var(--color-navy-800)" } : {}}>
              <div>
                <p className="text-sm font-bold">{r.guard} {r.isCurrentUser && <span style={{ color: "var(--color-navy-700)" }}>(You)</span>}</p>
                <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{r.time}</p>
              </div>
              {r.isCurrentUser && <Badge tone="success" size="sm">Now</Badge>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HandoverScreen({ notes, activeCount, openIncidentsCount, onAddNote, onComplete }) {
  const [draft, setDraft] = useState("");
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="p-4 text-center"><p className="text-xl font-bold" style={{ color: "var(--color-info)" }}>{activeCount}</p><p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>Active visitors</p></Card>
        <Card className="p-4 text-center"><p className="text-xl font-bold" style={{ color: "var(--color-warning)" }}>{openIncidentsCount}</p><p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>Open incidents</p></Card>
      </div>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--color-text-tertiary)" }}>Handover notes</p>
        <div className="space-y-2">
          {notes.map((n) => (
            <Card key={n.id} className="p-4">
              <p className="text-xs">{n.note}</p>
              <p className="text-[10px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>{n.from} · {n.time}</p>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-4">
        <TextArea rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a note for the incoming guard…" />
        <Button
          variant="secondary" size="sm" icon={Plus} className="mt-3"
          onClick={() => { if (draft.trim()) { onAddNote(draft.trim()); setDraft(""); } }}
        >
          Add Note
        </Button>
      </Card>

      <Button variant="primary" full size="lg" icon={CheckCircle2} onClick={onComplete}>Complete Handover</Button>
    </div>
  );
}
