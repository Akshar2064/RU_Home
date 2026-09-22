import { useState } from "react";
import { Plus, Camera, MapPin, AlertTriangle } from "lucide-react";
import { Card, Badge, Button, Field, Input, TextArea, EmptyState } from "../ui.jsx";
import { INCIDENT_CATEGORIES } from "../mockData.js";

const STATUS_TONE = { Open: "danger", "Under Review": "warning", Resolved: "success" };

export function IncidentsList({ incidents, onCreate }) {
  return (
    <div className="space-y-4">
      <Button variant="primary" full size="lg" icon={Plus} onClick={onCreate}>Report New Incident</Button>
      {incidents.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No incidents logged" body="Reported incidents for this community will appear here." />
      ) : (
        <div className="space-y-2.5">
          {incidents.map((inc) => (
            <Card key={inc.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold" style={{ color: "var(--color-text-tertiary)" }}>{inc.id}</p>
                  <p className="text-sm font-bold mt-0.5">{inc.category}</p>
                </div>
                <Badge tone={STATUS_TONE[inc.status]} size="sm">{inc.status}</Badge>
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>{inc.description}</p>
              <div className="flex items-center gap-1.5 mt-3 text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                <MapPin size={12} /> {inc.location} · {inc.time}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function IncidentCreate({ onSubmit }) {
  const [form, setForm] = useState({ category: INCIDENT_CATEGORIES[0], description: "", location: "", photo: false });
  const [error, setError] = useState("");

  function submit() {
    if (!form.description.trim()) {
      setError("Please describe what happened");
      return;
    }
    setError("");
    onSubmit(form);
  }

  return (
    <div className="space-y-5">
      <Card className="p-5 space-y-4">
        <Field label="Category">
          <div className="grid grid-cols-2 gap-2">
            {INCIDENT_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setForm((f) => ({ ...f, category: c }))}
                className="text-xs font-semibold rounded-lg px-2 py-2.5 border text-left transition"
                style={form.category === c ? { background: "var(--color-navy-800)", borderColor: "var(--color-navy-800)", color: "#fff" } : { borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="e.g. Visitor Parking · V-06" />
        </Field>
        <Field label="Description" error={error}>
          <TextArea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe what happened…" />
        </Field>
        <Field label="Photo evidence (optional)">
          <button
            onClick={() => setForm((f) => ({ ...f, photo: !f.photo }))}
            className="w-full rounded-xl py-6 flex flex-col items-center gap-2 border-2 border-dashed"
            style={{ borderColor: form.photo ? "var(--color-success)" : "var(--color-border)", color: form.photo ? "var(--color-success)" : "var(--color-text-tertiary)" }}
          >
            <Camera size={22} />
            <span className="text-xs font-semibold">{form.photo ? "Photo attached (simulated)" : "Tap to attach a photo"}</span>
          </button>
        </Field>
      </Card>
      <Button variant="primary" full size="lg" onClick={submit}>Submit Incident</Button>
    </div>
  );
}
